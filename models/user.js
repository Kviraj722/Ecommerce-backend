
const Sequelize = require("sequelize");
const sequelize = require("../config/dbconfig");

const User = sequelize.define(
  "User",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    accountType: {
      type: Sequelize.ENUM("Admin", "Seller", "User"),
      allowNull: false,
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: false, // Change to false if phone number is required
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false, // Change to false if address is required
    },
    createdAt: {
      allowNull: true,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: true,
      type: Sequelize.DATE,
    },
  },
  { timestamps: false }
);

module.exports = User;
