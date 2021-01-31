
import React from 'react'
import UpdateAuthorBirthyear from './UpdateAuthorBirthyear'

const Authors = ({ authors, setError, show }) => {
  if (!show) {
    return null
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              {/* <td>{a.bookCount}</td> */}
            </tr>
          )}
        </tbody>
      </table>
      <UpdateAuthorBirthyear setError={setError} authors={authors} />
    </div>
  )
}

export default Authors
