const { ApolloServer, AuthenticationError, UserInputError,  gql } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { PubSub } = require('apollo-server')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const config = require('./config')

const pubsub = new PubSub()


mongoose.set('useFindAndModify', false)

mongoose.set('useCreateIndex', true)

console.log('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Author {
    name: String!
    born: Int
    bookCount: Int
    id: ID!
  }
   type Book {
     title: String!
     published: Int!
     author: Author!
     genres: [String!]!
     id: ID!
   }
  type Query {
    authorCount: Int!
    allAuthors: [Author!]!
    allBooks(author: String, genre: String): [Book]
    bookCount(author: String): Int!
    me: User
  }
  type Mutation {
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
      ): Book
    addAuthor(
      name: String!
      born: Int
      ): Author
    editAuthor(
      author: String!, 
      setBornTo: Int!): Author
    removeAllBooks: String!,
  }
  type Subscription {
    bookAdded: Book!
  }    
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (_root, args) => {
      const { genre } = args
      if (genre) {
        const allBooks = await Book.find({}).populate('author').exec()
        const allBooksByGenre = allBooks.filter(book => book.genres.includes(genre))
        return allBooksByGenre
      }
      return Book.find({}).populate('author').exec()
    },
    allAuthors: () => Author.find({}),
    me: (_root, _args, { currentUser }) => {
      return currentUser
    }
  },
  Author:  {
    bookCount: (root => {
      return Book.find({ author: { $in: [root.id] } }).countDocuments()
    })
  },
  Mutation: {
    createUser: (_root, args) => {
      const { username, favoriteGenre } = args
      const user = new User({ username, favoriteGenre })

      try {
        return user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    login: async (_root, { username, password }) => {
      const user = await User.findOne({ username })
      if ( !user || password !== 'secret' ) {
        throw new UserInputError('wrong credentials')
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      }
      return { value: jwt.sign(userForToken, config.SECRET) }
    },
    addAuthor: (_root, args,) => { // not used on UI!
      const author = new Author({ ...args })
      try {
        return author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    addBook: async (_root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      let author = await Author.findOne({ name: args.author }).exec()
      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }
      const book = new Book({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres,
      })
      try {
        await book.save()
        const populatedBook = await Book.findOne({ _id: book._id }).populate('author').exec()
        pubsub.publish('BOOK_ADDED', { bookAdded: populatedBook })
        return populatedBook
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    editAuthor: async (_root, args, context) => {

      const { currentUser } = context

      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      const { setBornTo, author } = args
      const authorToEdit = await Author.findOne({ name: author }).exec()
      if (!authorToEdit) {
        return null
      }
      return Author.findByIdAndUpdate(authorToEdit._id, { born: setBornTo }, { new: true })
    },
    removeAllBooks: async () => {
      await Book.deleteMany({})
      await Book.find({})
      return 'All books removed'
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), config.SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})