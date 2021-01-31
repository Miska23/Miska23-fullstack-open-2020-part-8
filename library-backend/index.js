const { ApolloServer,/*  UserInputError, */ gql } = require('apollo-server')
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

// ALL:
// const typeDefs = gql`

//   type Book {
//     title: String!
//     published: Int!
//     author: Author!
//     genres: [String!]!
//     id: ID!
//   }

//   type Author {
//     name: String!
//     born: Int
//     id: ID!
//   }

//   type Query {
//     bookCount(author: String): Int!
//     authorCount: Int!
//     allBooks(author: String, genre: String): [Book]
//     allAuthors: [Author!]!
//   }

// type Mutation {
//   addBook(
//     title: String!
//     author: String!
//     published: Int!
//     genres: [String!]!
//     ): Book
//   editAuthor(name: String!, setBornTo: Int!): Author
// }
// `

const typeDefs = gql`

  type Author {
    name: String!
    born: Int
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
  }

`
const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async () => Book.find({}).populate('author').exec(),
    allAuthors: () => Author.find({}),
  },
  // Author: {
  //   bookCount: (root => {
  //     return books.filter(book => book.author === root.name).length
  //   })
  // },
  Mutation: {
    addAuthor: (_root, args) => {
      const author = new Author({ ...args })
      return author.save()
    },
    addBook: async (_root, args) => {
      const author = await Author.findOne({ name: args.author }).exec()
      const book = new Book({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres,
      })

      const savedBook = await book.save()
      const populatedBook = await Book.findOne({ _id: savedBook._id }).populate('author').exec()
      return populatedBook
    }
    //   editAuthor(_root, args) {
    //     const { name, setBornTo } = args
    //     const author = authors.find(a => a.name === name)
    //     if (author) {
    //       author.born = setBornTo
    //       authors = authors.map(a => a.id === author.id ? author : a)
    //       return author
    //     } else {
    //       return null
    //     }
    //   }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})