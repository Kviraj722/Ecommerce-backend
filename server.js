require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Sequelize } = require("sequelize");

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
// const userRoutes = require(".")
const dbName = process.env.DATABASE;
const userName = process.env.USERNAME;
const password = process.env.PASSWORD;
const sequelize = new Sequelize(dbName, userName, password, {
  host: process.env.HOST,
  dialect: process.env.DIALECT,
});
console.log("dbName", dbName);
console.log("userName", userName, password);

sequelize
  .authenticate()
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((error) => {
    console.log("DB has a connection issue");
    console.log("error while connection to the db -> ", error);
  });

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running",
  });
});

//All routes
const userRoutes = require("../Ecommerce/routes/userRoutes");
const adminRoutes = require("../Ecommerce/routes/adminRoutes");
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running successfully at ${PORT}. `);
});
