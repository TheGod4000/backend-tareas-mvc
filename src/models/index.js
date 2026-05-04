'use strict';

const { Sequelize } = require('sequelize');
const config = require('../config/config.json')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(
  config.database || 'tareas_db',
  config.username || null,
  config.password || null,
  config
);

const Tarea          = require('./tarea.model')(sequelize);
const Persona        = require('./persona.model')(sequelize);
const Tag            = require('./tag.model')(sequelize);
const Usuario        = require('./usuario.model')(sequelize);
const GoogleUsuario  = require('./googleusuario.model')(sequelize);
const PersonaTarea   = require('./personatarea.model')(sequelize);
const TareaTag       = require('./tareatag.model')(sequelize);

// Relaciones N:M
Persona.belongsToMany(Tarea, {
  through: PersonaTarea, foreignKey: 'personaId', otherKey: 'tareaId', as: 'tareas'
});
Tarea.belongsToMany(Persona, {
  through: PersonaTarea, foreignKey: 'tareaId', otherKey: 'personaId', as: 'personas'
});

Tarea.belongsToMany(Tag, {
  through: TareaTag, foreignKey: 'tareaId', otherKey: 'tagId', as: 'tags'
});
Tag.belongsToMany(Tarea, {
  through: TareaTag, foreignKey: 'tagId', otherKey: 'tareaId', as: 'tareas'
});

module.exports = { sequelize, Sequelize, Tarea, Persona, Tag, Usuario, GoogleUsuario, PersonaTarea, TareaTag };
