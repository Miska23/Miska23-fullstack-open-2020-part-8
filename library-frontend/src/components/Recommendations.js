import React from 'react'


const Recommendations = ({ books, currentUser, show }) => {

  if (!show) {
    return null
  }

  const getBooks = (books) => {
    return books.filter(book => book.genres.includes(currentUser.favoriteGenre))
  }

  return (
    <div>
      <h2>recommendations</h2>
      <div>books in your favorite genre {currentUser.favoriteGenre}</div>
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
    </div>
  )
}

export default Recommendations