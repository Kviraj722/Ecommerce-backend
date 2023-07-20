"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn("Seller", "createdAt", {
        type: Sequelize.DATE,
        allowNull: false,
      }),
      queryInterface.addColumn("Seller", "updatedAt", {
        type: Sequelize.DATE,
        allowNull: false,
      }),
      queryInterface.addColumn("Seller", "deletedAt", {
        type: Sequelize.DATE,
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.removeColumn("Seller", "createdAt"),
      queryInterface.removeColumn("Seller", "updatedAt"),
      queryInterface.removeColumn("Seller", "deletedAt"),
    ]);
  },
};
