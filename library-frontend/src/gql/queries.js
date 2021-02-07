import { gql } from '@apollo/client'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name 
      born 
      bookCount
      id
    }
  }
`
const ALL_BOOKS = gql`
  query getAllBooks($author: String, $genre: String){
    allBooks(author: $author, genre: $genre) {
      title 
      author {
        name
        born
        bookCount
        id
      }
      published
      genres
      id
    }
  }
`

const ME = gql`
query {
  me {username, favoriteGenre}
}
`

export { ALL_AUTHORS, ALL_BOOKS, ME }

