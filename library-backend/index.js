const { ApolloServer,  UserInputError,  gql } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')
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
  }
  type Mutation {
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
  },
  Author:  {
    bookCount: (root => {
      return Book.find({ author: { $in: [root.id] } }).countDocuments()
    })
  },
  Mutation: {
    addAuthor: async (_root, args) => { // not used on UI!
      const author = new Author({ ...args })
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return author
    },
    addBook: async (_root, args) => {
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

      let newBook
      try {
        await book.save()
        newBook = await Book.findOne({ _id: book._id }).populate('author').exec()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return newBook
    },
    editAuthor: async (_root, args) => {
      const { setBornTo, author } = args
      const authorToEdit = await Author.findOne({ name: author }).exec()
      if (!authorToEdit) {
        return null
      }
      return Author.findByIdAndUpdate(authorToEdit._id, { born: setBornTo }, { new: true })
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})