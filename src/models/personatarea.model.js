'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PersonaTarea = sequelize.define('PersonaTarea', {
    personaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Personas', key: 'id' }
    },
    tareaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Tareas', key: 'id' }
    }
  }, {
    tableName: 'PersonaTareas',
    timestamps: true
  });

  return PersonaTarea;
};
