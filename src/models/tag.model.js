'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tag = sequelize.define('Tag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: 'El nombre del tag no puede estar vacío' } }
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#007bff'
    }
  }, {
    tableName: 'Tags',
    timestamps: true
  });

  return Tag;
};
