import React, { useState, useEffect } from 'react'
import { useApolloClient, useQuery, useLazyQuery } from '@apollo/client'
import * as queries from './gql/queries'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notify from './components/Notify'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'

const App = () => {
  const client = useApolloClient()

  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [books, setBooks] = useState(null)
  const [genres, setGenres] = useState(null)

  const allBooks = useQuery(queries.ALL_BOOKS)
  const authors = useQuery(queries.ALL_AUTHORS)
  const currentUser = useQuery(queries.ME)
  const [getBooksByGenre, booksByGenre] = useLazyQuery(queries.ALL_BOOKS)

  // token hook
  useEffect(() => {
    const token = localStorage.getItem('booklist-user-token')
    token
      ?
      setToken(token)
      :
      setToken(null)
  }, [])

  // allbooks hook
  useEffect(() => {
    if (!allBooks.loading && allBooks.data) {
      setBooks(allBooks.data.allBooks)
      getGenresFromAllBooks(allBooks.data.allBooks)
    }
  }, [allBooks.loading, allBooks.data])

  // getBooksByGenre / clear selected genre hook
  useEffect(() => {
    if (selectedGenre !== null) {
      getBooksByGenre({ variables: { genre: selectedGenre } })
    } else if (selectedGenre === null && books !== null){
      setBooks(allBooks.data.allBooks)
    }
  }, [selectedGenre])

  // booksByGenre hook
  useEffect(() => {
    if (!booksByGenre.loading && booksByGenre.data) {
      setBooks(booksByGenre.data.allBooks)
    }
  }, [booksByGenre.loading, booksByGenre.data])

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

  const onSelectGenre = (genre) => {
    setSelectedGenre(genre === selectedGenre ? null : genre)
  }

  const getGenresFromAllBooks = (books) => {
    const genreList = []
    books.map(book => {
      return book.genres.map(genre => {
        return !genreList.includes(genre) && genreList.push(genre)
      })
    })
    setGenres(genreList)
  }

  if (books && !authors.loading) {
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
          genres={genres}
          onSelectGenre={onSelectGenre}
          books={books}
          selectedGenre={selectedGenre}
        />
        {token &&
        <NewBook
          show={page === 'add'}
          setError={notify}
        />}
        {token &&
        <Recommendations
          books={books}
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