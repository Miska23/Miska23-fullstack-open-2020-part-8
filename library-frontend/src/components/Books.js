import React from 'react'
import GenreList from './GenreList'

const Books = ({ books, genres, selectedGenre, onSelectGenre, show }) => {

  if (!show || !books) {
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
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )
          }
        </tbody>
      </table>
      <GenreList genres={genres} onSelectGenre={onSelectGenre} selectedGenre={selectedGenre} />
    </div>
  )
}

export default Books