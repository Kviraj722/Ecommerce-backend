const Sequelize = require("sequelize");
const sequelize = require("../config/dbconfig");

const User = sequelize.define("Order", {
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
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
});

module.exports = User;
