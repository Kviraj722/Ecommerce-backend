"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "address", {
      type: Sequelize.JSON, // Use Sequelize.JSON data type for JSON objects
      allowNull: false,
      defaultValue: {}, // Set a default empty object if necessary
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "address", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
