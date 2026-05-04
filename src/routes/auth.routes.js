const express  = require('express');
const passport = require('../config/passport');
const { login, logout, verificarAuth, googleCallback } = require('../controllers/auth.controller');
const { validarApiKey, verificarToken, verificarCSRF } = require('../middleware/auth');

const router = express.Router();

/** POST /api/auth/login — público, requiere x-api-key header */
router.post('/login',  validarApiKey, login);

/** POST /api/auth/logout — privado, requiere JWT + CSRF (modifica estado) */
router.post('/logout', verificarToken, verificarCSRF, logout);

/** GET /api/auth/verify — privado, sólo JWT (GET es safe, sin CSRF) */
router.get('/verify',  verificarToken, verificarAuth);

/**
 * GET /api/auth/google/login
 * Redirige al usuario a la pantalla de consentimiento de Google.
 */
router.get('/google/login',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

/**
 * GET /api/auth/google/callback
 * Google redirige aquí con el código de autorización.
 * Passport valida, crea/recupera el GoogleUsuario y llama a googleCallback.
 */
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/?error=google_auth_failed`
  }),
  googleCallback
);

module.exports = router;
