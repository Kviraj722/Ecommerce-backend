require('dotenv').config()

module.exports = {
  "development": {
    "username": process.env.USERNAME,
    "password": process.env.PASSWORD,
    "database": process.env.DATABASE,
    "host": process.env.HOST,
    "dialect": 'mysql'
  },
  "test": {
    "username": process.env.SQL_USERNAME,
    "password": process.env.SQL_PASSWORD,
    "database": process.env.SQL_DB,
    "host": process.env.HOST,
    "dialect": process.env.DB
  },
  "production": {
    "username": process.env.SQL_USERNAME,
    "password": process.env.SQL_PASSWORD,
    "database": process.env.SQL_DB,
    "host": process.env.HOST,
    "dialect": process.env.DB
  }
}