'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('btc_history', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      token_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      share_size: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      catch_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('btc_history', ['slug']);
    await queryInterface.addIndex('btc_history', ['token_type']);
    await queryInterface.addIndex('btc_history', ['price']);
    await queryInterface.addIndex('btc_history', ['share_size']);
    await queryInterface.addIndex('btc_history', ['catch_time']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('btc_history');
  },
};
