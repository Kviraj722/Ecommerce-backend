// "use strict";
// const { Model } = require("sequelize");
// module.exports = (sequelize, DataTypes) => {
//   class User extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   }
//   User.init(
//     {
//       firstName: DataTypes.STRING,
//       lastName: DataTypes.STRING,
//       email: DataTypes.STRING,
//       password: DataTypes.STRING,
//       accountType: DataTypes.STRING,
//     },
//     {
//       sequelize,
//       modelName: "User",
//     }
//   );
//   return User;
// };

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
