'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Persona-Tarea: Carlos (1) -> Tarea 1, Tarea 2 | Ana (2) -> Tarea 3 | Luis (3) -> Tarea 4, Tarea 5
    await queryInterface.bulkInsert('PersonaTareas', [
      { personaId: 1, tareaId: 1, createdAt: now, updatedAt: now },
      { personaId: 1, tareaId: 2, createdAt: now, updatedAt: now },
      { personaId: 2, tareaId: 3, createdAt: now, updatedAt: now },
      { personaId: 3, tareaId: 4, createdAt: now, updatedAt: now },
      { personaId: 3, tareaId: 5, createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });

    // Tarea-Tag: Tarea 1 -> backend, en-progreso | Tarea 2 -> backend | Tarea 3 -> urgente | Tarea 5 -> documentacion
    await queryInterface.bulkInsert('TareaTags', [
      { tareaId: 1, tagId: 1, createdAt: now, updatedAt: now },
      { tareaId: 1, tagId: 4, createdAt: now, updatedAt: now },
      { tareaId: 2, tagId: 1, createdAt: now, updatedAt: now },
      { tareaId: 3, tagId: 3, createdAt: now, updatedAt: now },
      { tareaId: 5, tagId: 5, createdAt: now, updatedAt: now }
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('TareaTags',    null, {});
    await queryInterface.bulkDelete('PersonaTareas', null, {});
  }
};
