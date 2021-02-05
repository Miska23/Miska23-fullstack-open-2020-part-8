const { ApolloServer, AuthenticationError, UserInputError,  gql } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const config = require('./config')

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
    editAuthor(author: String!, setBornTo: Int!): Author
  }

`
const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: () => Book.find({}).populate('author').exec(),
    allAuthors: () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author:  {
    bookCount: (root => {
      return Book.find({ author: { $in: [root.id] } }).countDocuments()
    })
  },
  Mutation: {
    createUser: async (root, args) => {
      const { username, favoriteGenre } = args
      const user = new User({ username, favoriteGenre })

      try {
        return await user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    login: async (root, args) => {
      const { username, password } = args

      console.log('savedUser === ', username)
      console.log('password === ', password)
      const user = await User.findOne({ username })

      console.log('user === ', user)

      if ( !user || password !== 'secret' ) {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      console.log('userForToken === ', userForToken)
      return { value: jwt.sign(userForToken, config.SECRET) }
    },
    addAuthor: (_root, args,) => { // not used on UI!
      const author = new Author({ ...args })
      return author.save()
    },
    addBook: async (_root, args, context) => {

      const { currentUser } = context

      console.log('addBook 1 / currentUser === ', currentUser)

      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      let author = await Author.findOne({ name: args.author }).exec()
      if (!author) {
        author = new Author({ name: args.author })
        author = await author.save()
      }
      const book = new Book({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres,
      })

      let populatedBook
      try {
        const savedBook = await book.save()
        populatedBook = await Book.findOne({ _id: savedBook._id }).populate('author').exec()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return populatedBook
    },
    editAuthor: async (_root, args, context) => {

      const { currentUser } = context

      console.log('editAuthor 1 / currentUser === ', currentUser)

      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      const { setBornTo, author } = args
      const authorToEdit = await Author.findOne({ name: author }).exec()
      return Author.findByIdAndUpdate(authorToEdit._id, { born: setBornTo }, { new: true })
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    console.log('context 1 / req.headers === ', req.headers)

    const auth = req ? req.headers.authorization : null
    console.log('context 1 / auth === ', auth)

    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), config.SECRET
      )
      console.log('context 2 / decodedToken === ', decodedToken)

      const currentUser = await User.findById(decodedToken.id)

      console.log('context 3 / currentUser === ', currentUser)

      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})