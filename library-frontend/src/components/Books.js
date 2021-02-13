import React, { useState, useEffect } from 'react'
import GenreList from './GenreList'
import { useLazyQuery } from '@apollo/client'
import { ALL_BOOKS } from '../gql/queries'


const Books = ({ books, show }) => {

  const [getBooksByGenre, result] = useLazyQuery(ALL_BOOKS)
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [booksByGenre, setBooksByGenre] = useState(null)

  const onSelectGenre = (genre) => {
    setSelectedGenre(genre === selectedGenre ? null : genre)
  }

  useEffect(() => {
    if (result.data) {
      setBooksByGenre(result.data.allBooks)
    }
  }, [result])

  useEffect(() => {
    console.log('UE 2 / 1')
    if (selectedGenre !== null) {
      console.log('UE 2 / 2 / selectedGenre === ' , selectedGenre)

      getBooksByGenre({ variables: { genre: selectedGenre } })
    }
  }, [selectedGenre])

  const getGenreList = (books) => {
    const genreList = []
    books.map(book => {
      return book.genres.map(genre => {
        return !genreList.includes(genre) && genreList.push(genre)
      })
    })
    return genreList
  }

  const getBooks = () => {
    if (selectedGenre !== null && booksByGenre !== null && !booksByGenre.loading) {
      console.log('getBooks 1 / booksByGenre === ' , booksByGenre)
      return booksByGenre
    }
    return  books
  }

  if (!show) {
    // selectedGenre !== null && setSelectedGenre(null)
    return null
  }

  return (
    <div>
      <h2>books</h2>
      <h6>selectedGenre = {selectedGenre}</h6>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {getBooks().map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )
          }
        </tbody>
      </table>
      <GenreList genres={getGenreList(books)} onSelectGenre={onSelectGenre} selectedGenre={selectedGenre} />
    </div>
  )
}

export default Books