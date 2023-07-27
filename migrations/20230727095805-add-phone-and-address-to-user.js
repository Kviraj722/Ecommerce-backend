"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "phoneNumber", {
      type: Sequelize.STRING,
      allowNull: false, // Set to false if phone number is required
    });

    await queryInterface.addColumn("Users", "address", {
      type: Sequelize.STRING,
      allowNull: false, // Set to false if address is required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "phoneNumber");
    await queryInterface.removeColumn("Users", "address");
  },
};
