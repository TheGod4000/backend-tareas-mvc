const express = require('express');
const tagController = require('../controllers/tag.controller');
const router = express.Router();

// CRUD
router.get('/',       tagController.obtenerTodas);
router.get('/:id',    tagController.obtenerPorId);
router.post('/',      tagController.crear);
router.put('/:id',    tagController.actualizar);
router.delete('/:id', tagController.eliminar);

// Relaciones Tag-Tarea
router.get('/:id/tareas',                tagController.obtenerTareas);
router.post('/:id/tareas/:tareaId',      tagController.agregarTarea);
router.delete('/:id/tareas/:tareaId',    tagController.quitarTarea);

// Relación indirecta Tag-Personas (a través de tareas)
router.get('/:id/personas', tagController.obtenerPersonas);

module.exports = router;
