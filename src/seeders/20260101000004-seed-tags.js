'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('Tags', [
      { nombre: 'backend',     color: '#28a745', createdAt: now, updatedAt: now },
      { nombre: 'frontend',    color: '#007bff', createdAt: now, updatedAt: now },
      { nombre: 'urgente',     color: '#dc3545', createdAt: now, updatedAt: now },
      { nombre: 'en-progreso', color: '#ffc107', createdAt: now, updatedAt: now },
      { nombre: 'documentacion', color: '#6f42c1', createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Tags', null, {});
  }
};
