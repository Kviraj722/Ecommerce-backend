const mysql = require("mysql");
require("dotenv").config();
var ENV = process.env.ENV;
var HOST = process.env.HOST;
var USER = process.env.USERNAME;
var PASSWORD = process.env.PASSWORD;
var DATABASE = process.env.DATABASE;

let mysqlCon = {
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
};
const connection = mysql.createConnection(mysqlCon);
connection.connect((error) => {
  try {
    console.log("Successfully connected to the database!");
  } catch (error) {
    console.log("error while connection to the db");
    console.log("error -> ", error);
  }
});
module.exports = connection;
