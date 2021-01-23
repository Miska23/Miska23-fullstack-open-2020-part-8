import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { useQuery } from '@apollo/client'
import * as queries from './gql/queries'

const App = () => {
  const [page, setPage] = useState('authors')

  const books = useQuery(queries.ALL_BOOKS)
  const authors = useQuery(queries.ALL_AUTHORS)

  if (!books.loading && !authors.loading)  {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('add')}>add book</button>
        </div>

        <Authors
          authors={authors.data.allAuthors}
          show={page === 'authors'}
        />

        <Books
          show={page === 'books'}
          books={books.data.allBooks}
        />

        <NewBook
          show={page === 'add'}
        />

      </div>
    )
  } else {
    return <div>loading...</div>
  }


}

export default App