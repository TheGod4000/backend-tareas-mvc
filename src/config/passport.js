'use strict';

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { GoogleUsuario } = require('../models');

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value ?? null;
      const foto  = profile.photos?.[0]?.value  ?? null;

      if (!email) {
        return done(new Error('Google no proporcionó un correo electrónico'), null);
      }

      // Buscar o crear el usuario Google en la BD
      const [usuario, created] = await GoogleUsuario.findOrCreate({
        where: { googleId: profile.id },
        defaults: {
          email,
          nombre: profile.displayName,
          foto
        }
      });

      // Si ya existía pero el email/foto cambiaron, actualizar
      if (!created) {
        await usuario.update({ email, nombre: profile.displayName, foto });
      }

      return done(null, usuario);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialización mínima (solo para el flujo de callback, no se mantiene sesión de usuario)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await GoogleUsuario.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
