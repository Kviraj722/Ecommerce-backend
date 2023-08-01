const Sequelize = require("sequelize");
const sequelize = require("../config/dbconfig");

const OrderItem = sequelize.define("OrderItem", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER,
  },
  order_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Orders",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  product_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Products", // The name of the referenced table
      key: "id", // The primary key of the referenced table
    },
    onUpdate: "CASCADE", // Optional: Cascade update if the referenced product's ID changes
    onDelete: "CASCADE",
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  subtotal: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
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

module.exports = OrderItem;
