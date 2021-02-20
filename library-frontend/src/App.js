import React, { useState, useEffect } from 'react'
import { useApolloClient, useQuery, useLazyQuery, useSubscription } from '@apollo/client'
import * as queries from './gql/queries'
import { BOOK_ADDED } from './gql/subscriptions'
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

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) =>
      set.map(p => p.id).includes(object.id)

    const dataInStore = client.readQuery({ query: queries.ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: queries.ALL_BOOKS,
        data: { allBooks : dataInStore.allBooks.concat(addedBook) }
      })
    }
    const dataInStoreAfterUpdate = client.readQuery({ query: queries.ALL_BOOKS }).allBooks
    setBooks(dataInStoreAfterUpdate)
    if (page === 'recommendations') {
      getBooksByGenre({ variables: { genre: selectedGenre } })
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      window.alert(`A new book ${subscriptionData.data.bookAdded.title} was added`)
      updateCacheWith(subscriptionData.data.bookAdded)
    }
  })

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

  // getBooksByGenre (selectedGenre) hook
  useEffect(() => {
    if (selectedGenre !== null) {
      getBooksByGenre({ variables: { genre: selectedGenre } })
    }
  }, [selectedGenre, getBooksByGenre])

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
    if (genre !== selectedGenre) {
      setSelectedGenre(genre)
    } else {
      setSelectedGenre(null)
      setBooks(allBooks.data.allBooks)
    }
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

  const onSelectPage = (event) => {
    setPage(event.target.value)
    if (event.target.value === 'recommendations') {
      setSelectedGenre(currentUser.data.me.favoriteGenre)
    } else {
      setSelectedGenre(null)
      setBooks(allBooks.data.allBooks)
    }
  }

  if (books && !authors.loading) {
    return (
      <>
        <div>
          <button value='authors' onClick={onSelectPage}>authors</button>
          <button value='books' onClick={onSelectPage}>books</button>
          {token && <button value='add' onClick={onSelectPage}>add book</button>}
          {token && <button value='recommendations' onClick={onSelectPage}>recommendations</button>}
          {token === null ? <button value='login' onClick={onSelectPage}>login</button> : <button onClick={() => logout()}>logout</button>}
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