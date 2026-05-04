const express = require('express');
const usuarioController = require('../controllers/usuario.controller');
const { validarApiKey, verificarToken, verificarCSRF } = require('../middleware/auth');
const router = express.Router();

// Registro público — requiere API key pero sin JWT
router.post('/', validarApiKey, usuarioController.registrar);

// Consultas — requieren JWT
router.get('/',    verificarToken, usuarioController.obtenerTodas);
router.get('/:id', verificarToken, usuarioController.obtenerPorId);

// Modificaciones — requieren JWT + CSRF
router.put('/:id',            verificarToken, verificarCSRF, usuarioController.actualizar);
router.delete('/:id',         verificarToken, verificarCSRF, usuarioController.eliminar);
router.patch('/:id/activar',  verificarToken, verificarCSRF, usuarioController.activar);
router.patch('/:id/desactivar', verificarToken, verificarCSRF, usuarioController.desactivar);

module.exports = router;
