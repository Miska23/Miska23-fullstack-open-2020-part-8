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
const EDIT_AUTHOR = gql`
  mutation editAuthorBirthyear(
    $name: String!, 
    $setBornTo: Int!, 
    ){
      editAuthor(
      name: $name, 
      setBornTo: $setBornTo, 
    ){
      name
      born
      bookCount
      id
    }
  }
`


export { ADD_BOOK, EDIT_AUTHOR }

