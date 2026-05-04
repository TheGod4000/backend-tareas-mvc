'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PersonaTareas', {
      personaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Personas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tareaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Tareas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('PersonaTareas');
  }
};
