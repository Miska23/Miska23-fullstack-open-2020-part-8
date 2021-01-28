import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import * as mutations from '../gql/mutations'
import * as queries from '../gql/queries'

const UpdateAuthorBirthyear = ({ authors, setError }) => {
  const [birthyear, setBirthyear] = useState('')
  const [name, setName] = useState(authors[0].name)

  const [ editAuthor ] = useMutation(mutations.EDIT_AUTHOR, {
    refetchQueries: [ { query: queries.ALL_AUTHORS }],
  } )


  const submit = async (event) => {
    event.preventDefault()

    const response = await editAuthor({  variables: { name, setBornTo: Number(birthyear) } })

    if (response.data.editAuthor === null) {
      setError('Author not found')
    }

    setBirthyear('')
    setName('')
  }

  return (
    <div>
      <h2>Set birthyear</h2>
      <form>
        <select value={name} onChange={(event) => setName(event.target.value)}>
          {authors.map(author => <option key={author.id} value={author.name}>{author.name}</option>)}
        </select>
      </form>
      <form onSubmit={submit}>
        <div>
          born
          <input
            type="number"
            value={birthyear}
            onChange={({ target }) => setBirthyear(target.value)}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default UpdateAuthorBirthyear