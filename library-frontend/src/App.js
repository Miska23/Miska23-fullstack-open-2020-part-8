import React, { useState, useEffect } from 'react'
import { useApolloClient, useQuery } from '@apollo/client'
import * as queries from './gql/queries'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notify from './components/Notify'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'

const App = () => {
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('booklist-user-token')
    token
      ?
      setToken(token)
      :
      setToken(null)
  }, [])

  const client = useApolloClient()

  const books = useQuery(queries.ALL_BOOKS)
  const authors = useQuery(queries.ALL_AUTHORS)
  const currentUser = useQuery(queries.ME)

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!books.loading && !authors.loading) {
    return (
      <>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          {token && <button onClick={() => setPage('add')}>add book</button>}
          {token && <button onClick={() => setPage('recommendations')}>recommendations</button>}
          {token === null ? <button onClick={() => setPage('login')}>login</button> : <button onClick={() => logout()}>logout</button>}
        </div>
        <Notify
          errorMessage={errorMessage}
        />
        <Authors
          authors={authors.data.allAuthors}
          setError={notify}
          show={page === 'authors'}
          authenticated={token}
        />
        <Books
          show={page === 'books'}
          setError={notify}
          books={books.data.allBooks}
        />
        {token &&
        <NewBook
          show={page === 'add'}
          setError={notify}
        />}
        {token &&
        <Recommendations
          books={books.data.allBooks}
          show={page === 'recommendations'}
          currentUser={currentUser.data.me}
        />}
        {!token &&
          <div>
            <LoginForm
              show={page === 'login'}
              setToken={setToken}
              setError={notify}
            />
          </div>
        }
      </>
    )
  } else {
    return (
      <div>loading...</div>
    )
  }
}

export default App