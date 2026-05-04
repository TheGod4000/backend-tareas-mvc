const express = require('express');
const personaController = require('../controllers/persona.controller');
const router = express.Router();

// CRUD
router.get('/',       personaController.obtenerTodas);
router.get('/:id',    personaController.obtenerPorId);
router.post('/',      personaController.crear);
router.put('/:id',    personaController.actualizar);
router.delete('/:id', personaController.eliminar);

// Relaciones Persona-Tarea
router.get('/:id/tareas',                  personaController.obtenerTareas);
router.post('/:id/tareas/:tareaId',        personaController.agregarTarea);
router.delete('/:id/tareas/:tareaId',      personaController.quitarTarea);

// Relación indirecta Persona-Tags (a través de tareas)
router.get('/:id/tags', personaController.obtenerTags);

module.exports = router;
