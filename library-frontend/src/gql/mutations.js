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
        bookCount
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
    $author: String!, 
    $setBornTo: Int!, 
    ){
      editAuthor(
      author: $author, 
      setBornTo: $setBornTo, 
    ){
      name
      born
      bookCount
      id
    }
  }
`
const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`


export { ADD_BOOK, EDIT_AUTHOR, LOGIN }

