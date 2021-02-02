import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import * as queries from './gql/queries'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notify from './components/Notify'

const App = () => {
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)

  const books = useQuery(queries.ALL_BOOKS)
  const authors = useQuery(queries.ALL_AUTHORS)

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  if (!books.loading && !authors.loading)  {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('add')}>add book</button>
        </div>

        <Notify
          errorMessage={errorMessage}
        />

        <Authors
          authors={authors.data.allAuthors}
          setError={notify}
          show={page === 'authors'}
        />

        <Books
          show={page === 'books'}
          setError={notify}
          books={books.data.allBooks}
        />

        <NewBook
          show={page === 'add'}
          setError={notify}
        />


      </div>
    )
  } else {
    return <div>loading...</div>
  }


}

export default App