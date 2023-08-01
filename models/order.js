const Sequelize = require("sequelize");
const sequelize = require("../config/dbconfig");
const User = require("../models/user");
const Product = require("../models/product");
const OrderItem = require("../models/orderitem");
const Order = sequelize.define("Order", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  order_date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  total_amount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  isPaid: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  paymentIntentId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  isCancelled: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
});

Order.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});
Order.belongsToMany(Product, {
  through: "OrderItem",
  foreignKey: "order_id",
  otherKey: "product_id",
  as: "products",
});

module.exports = Order;
