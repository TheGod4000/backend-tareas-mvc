const express = require('express');
const tareaController = require('../controllers/tarea.controller');
const router = express.Router();

// CRUD
router.get('/',         tareaController.obtenerTodas);
router.get('/buscar',   tareaController.buscar);
router.get('/:id',      tareaController.obtenerPorId);
router.post('/',        tareaController.crear);
router.put('/:id',      tareaController.actualizarCompleta);
router.patch('/:id',    tareaController.actualizarParcial);
router.delete('/:id',   tareaController.eliminar);

// Relaciones Tarea-Persona
router.get('/:id/personas',                    tareaController.obtenerPersonas);
router.post('/:id/personas/:personaId',        tareaController.agregarPersona);
router.delete('/:id/personas/:personaId',      tareaController.quitarPersona);

// Relaciones Tarea-Tag
router.get('/:id/tags',                        tareaController.obtenerTags);
router.post('/:id/tags/:tagId',                tareaController.agregarTag);
router.delete('/:id/tags/:tagId',              tareaController.quitarTag);

module.exports = router;