require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Sequelize } = require("sequelize");
const fileUpload = require("express-fileupload");

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(fileUpload());
// const userRoutes = require(".")
const dbName = process.env.DATABASE;
const userName = process.env.USERNAME;
const password = process.env.PASSWORD;
const sequelize = new Sequelize(dbName, userName, password, {
  host: process.env.HOST,
  dialect: process.env.DIALECT,
  timezone: "+05:30",
});

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
const userRoutes = require("../Ecommerce-backend/routes/userRoutes");
const adminRoutes = require("../Ecommerce-backend/routes/adminRoutes");
const sellerRoutes = require("../Ecommerce-backend/routes/sellerRoutes");
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running successfully at ${PORT}. `);
});
