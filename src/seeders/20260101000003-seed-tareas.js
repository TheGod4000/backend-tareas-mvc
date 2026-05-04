'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('Tareas', [
      {
        titulo: 'Aprender Express',
        descripcion: 'Estudiar el framework Express para Node.js',
        completada: false,
        createdAt: now,
        updatedAt: now
      },
      {
        titulo: 'Implementar MVC',
        descripcion: 'Aplicar el patrón Modelo-Vista-Controlador al proyecto',
        completada: false,
        createdAt: now,
        updatedAt: now
      },
      {
        titulo: 'Probar API con Postman',
        descripcion: 'Realizar pruebas de todos los endpoints con Postman',
        completada: true,
        createdAt: now,
        updatedAt: now
      },
      {
        titulo: 'Configurar base de datos',
        descripcion: 'Integrar Sequelize con SQLite',
        completada: true,
        createdAt: now,
        updatedAt: now
      },
      {
        titulo: 'Documentar la API',
        descripcion: 'Crear documentación OpenAPI 3.0 de todos los endpoints',
        completada: false,
        createdAt: now,
        updatedAt: now
      }
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Tareas', null, {});
  }
};
