import React from 'react'


const GenreList = ({ genres, onSelectGenre }) => {

  return (
    <div>
      {genres.map(genre => <button key={genre} onClick={() => onSelectGenre(genre)}>{genre}</button>)}
    </div>
  )
}

export default GenreList