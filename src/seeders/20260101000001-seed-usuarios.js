'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('Usuarios', [
      {
        nombre: 'Admin Sistema',
        email: 'admin@tareas.com',
        password: bcrypt.hashSync('Admin1234!', 10),
        activo: true,
        createdAt: now,
        updatedAt: now
      },
      {
        nombre: 'María García',
        email: 'maria@tareas.com',
        password: bcrypt.hashSync('Maria1234!', 10),
        activo: true,
        createdAt: now,
        updatedAt: now
      },
      {
        nombre: 'Usuario Inactivo',
        email: 'inactivo@tareas.com',
        password: bcrypt.hashSync('Inactivo1234!', 10),
        activo: false,
        createdAt: now,
        updatedAt: now
      }
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Usuarios', null, {});
  }
};
