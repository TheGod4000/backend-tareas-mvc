const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

const cookieBase = () => ({
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   parseInt(process.env.COOKIE_MAX_AGE) || 3600000
});

/**
 * POST /api/auth/login
 * Requiere header x-api-key (validado por middleware validarApiKey).
 * Valida email + password contra la base de datos.
 * Genera JWT (HttpOnly cookie) + CSRF token (cookie legible + body).
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || email.trim() === '') {
      return res.status(400).json({ success: false, message: 'El email es requerido' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'La contraseña es requerida' });
    }

    const usuario = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    if (!usuario.activo) {
      return res.status(403).json({ success: false, message: 'Usuario inactivo. Contacte al administrador.' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const csrfToken = crypto.randomBytes(32).toString('hex');
    const payload = {
      id:        usuario.id,
      email:     usuario.email,
      apiKey:    process.env.API_KEY,
      csrfToken
    };

    const tokenJWT = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    const opts = cookieBase();
    res.cookie('jwt_token',  tokenJWT,  { ...opts, httpOnly: true });
    res.cookie('csrf_token', csrfToken, opts);

    res.json({
      success:   true,
      csrfToken,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el proceso de login' });
  }
};

/**
 * POST /api/auth/logout
 * Elimina ambas cookies del cliente.
 */
const logout = (req, res) => {
  try {
    const clearOpts = { secure: process.env.NODE_ENV === 'production', sameSite: 'strict' };
    res.clearCookie('jwt_token',  { ...clearOpts, httpOnly: true });
    res.clearCookie('csrf_token', clearOpts);
    res.json({ success: true, message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ success: false, message: 'Error en el proceso de logout' });
  }
};

/**
 * GET /api/auth/verify
 * Devuelve datos del usuario y csrfToken para restaurar sesión tras recarga.
 * El JWT ya fue validado por verificarToken.
 */
const verificarAuth = (req, res) => {
  res.json({
    success:   true,
    usuario:   { id: req.usuario.id, email: req.usuario.email },
    csrfToken: req.usuario.csrfToken
  });
};

/**
 * GET /api/auth/google/callback (después del redirect de Google)
 * Passport ya autenticó al usuario. Se emite JWT + CSRF y redirige al frontend.
 */
const googleCallback = (req, res) => {
  try {
    const usuario = req.user; // inyectado por Passport
    if (!usuario || !usuario.activo) {
      return res.redirect(
        `${process.env.CLIENT_URL}/?error=google_auth_failed`
      );
    }

    const csrfToken = crypto.randomBytes(32).toString('hex');
    const payload = {
      id:         usuario.id,
      email:      usuario.email,
      googleAuth: true,
      csrfToken
    };

    const tokenJWT = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    const opts = cookieBase();
    res.cookie('jwt_token',  tokenJWT,  { ...opts, httpOnly: true });
    res.cookie('csrf_token', csrfToken, opts);

    // Redirige al frontend con el CSRF token en la URL para que lo lea en localStorage
    res.redirect(`${process.env.CLIENT_URL}/?csrf=${csrfToken}`);
  } catch (error) {
    console.error('Error en googleCallback:', error);
    res.redirect(`${process.env.CLIENT_URL}/?error=server_error`);
  }
};

module.exports = { login, logout, verificarAuth, googleCallback };
