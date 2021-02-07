import React, { useState } from 'react'
import GenreList from './GenreList'

const Books = ({ books, show }) => {

  const [selectedGenre, setSelectedGenre] = useState(null)

  const onSelectGenre = (genre) => {
    genre === selectedGenre
      ?
      setSelectedGenre(null)
      :
      setSelectedGenre(genre)
  }

  const getGenreList = (books) => {
    const genreList = []
    books.map(book => {
      return book.genres.map(genre => {
        return !genreList.includes(genre) && genreList.push(genre)
      })
    })
    return genreList
  }

  const getBooks = (books) => {
    return  !selectedGenre ? books : books.filter(book => book.genres.includes(selectedGenre))
  }

  if (!show) {
    selectedGenre !== null && setSelectedGenre(null)
    return null
  }


  return (
    <div>
      <h2>books</h2>
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
          {getBooks(books).map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <GenreList genres={getGenreList(books)} onSelectGenre={onSelectGenre} selectedGenre={selectedGenre} />
    </div>
  )
}

export default Books