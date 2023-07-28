const Sequelize = require("sequelize");
const sequelize = require("../config/dbconfig");
const Product = require("../models/product");
const moment = require("moment");
moment.tz.setDefault("Asia/Kolkata");
const Category = sequelize.define(
  "Category",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    createdAt: {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      allowNull: true,
      type: Sequelize.DATE,
      // defaultValue: Sequelize.NOW,
      defaultValue: () => moment().toDate(),
    },
  },
  { timestamps: false }
);

Category.addHook("beforeFind", (options) => {
  if (!options.timezone) {
    options.timezone = "Asia/Kolkata";
  }
});

Category.addHook("beforeCreate", (options) => {
  const currentTime = moment().toDate();
  Category.createdAt = currentTime;
  Category.updatedAt = currentTime;
});

Category.addHook("beforeUpdate", (category) => {
  category.updatedAt = moment().toDate();
});

// Category.hasMany(Product, { onDelete: "CASCADE", foreignKey: "id" });
// Category.associate = (models) => {
//   Category.hasMany(Product, { foreignKey: "categoryId" });
// };
module.exports = Category;
