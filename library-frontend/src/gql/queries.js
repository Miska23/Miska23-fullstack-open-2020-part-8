import { gql } from '@apollo/client'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name 
      born 
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
        id
      }
      published
      genres
      id
    }
  }
`

export { ALL_AUTHORS, ALL_BOOKS }

