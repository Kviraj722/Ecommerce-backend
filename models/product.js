const Sequelize = require("sequelize");
const sequelize = require("../config/dbconfig");
const Category = require("../models/category");
const Product = sequelize.define(
  "Product",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    productName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
    },
    price: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    quantity: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    categoryId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      // references: {
      //   model: "Category",
      //   key: "id",
      // },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  { timestamps: true }
);

Product.belongsTo(Category, { foreignKey: "categoryId", as: "Category" });
Category.hasMany(Product, { foreignKey: "categoryId", as: "Product" });


module.exports = Product;
