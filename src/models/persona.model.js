'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Persona = sequelize.define('Persona', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: { msg: 'El nombre no puede estar vacío' } }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: { isEmail: { msg: 'Formato de email inválido' } }
    },
    telefono: {
      type: DataTypes.STRING(30),
      allowNull: true
    }
  }, {
    tableName: 'Personas',
    timestamps: true
  });

  return Persona;
};
