import { gql } from '@apollo/client'

const ADD_BOOK = gql`
  mutation addNewBook(
    $title: String!, 
    $author: String!, 
    $published: Int!,
    $genres:[String!]!
    ){
    addBook(
      title: $title, 
      author: $author, 
      published: $published,
      genres: $genres,
    ){
      title 
      author 
      published
      genres
      id
    }
  }
`


export { ADD_BOOK }

