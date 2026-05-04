'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('Personas', [
      {
        nombre: 'Carlos López',
        email: 'carlos@ejemplo.com',
        telefono: '555-0101',
        createdAt: now,
        updatedAt: now
      },
      {
        nombre: 'Ana Martínez',
        email: 'ana@ejemplo.com',
        telefono: '555-0102',
        createdAt: now,
        updatedAt: now
      },
      {
        nombre: 'Luis Rodríguez',
        email: 'luis@ejemplo.com',
        telefono: '555-0103',
        createdAt: now,
        updatedAt: now
      }
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Personas', null, {});
  }
};
