'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TareaTag = sequelize.define('TareaTag', {
    tareaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Tareas', key: 'id' }
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Tags', key: 'id' }
    }
  }, {
    tableName: 'TareaTags',
    timestamps: true
  });

  return TareaTag;
};
