require('dotenv').config()

// eslint-disable-next-line no-undef
const PORT = process.env.PORT
// eslint-disable-next-line no-undef
const MONGODB_URI = process.env.MONGODB_URI
// eslint-disable-next-line no-undef
const SECRET = process.env.SECRET

module.exports = {
  MONGODB_URI,
  PORT,
  SECRET
}