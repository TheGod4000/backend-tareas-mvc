'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GoogleUsuario = sequelize.define('GoogleUsuario', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    googleId: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
      comment: 'ID único proporcionado por Google'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    foto: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL de la foto de perfil de Google'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'GoogleUsuarios',
    timestamps: true
  });

  return GoogleUsuario;
};
