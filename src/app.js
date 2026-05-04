require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { sequelize } = require('./models');

const tareaRoutes   = require('./routes/tarea.routes');
const personaRoutes = require('./routes/persona.routes');
const tagRoutes     = require('./routes/tag.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const authRoutes    = require('./routes/auth.routes');
const { verificarToken, verificarCSRF } = require('./middleware/auth');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Inicializar la base de datos (crea tablas si no existen)
sequelize.sync()
  .then(() => console.log('Base de datos sincronizada'))
  .catch(err => console.error('Error al sincronizar la base de datos:', err));

// Rutas públicas
app.use('/api/auth',     authRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Rutas protegidas — JWT + CSRF en mutaciones
app.use('/api/tareas',   verificarToken, verificarCSRF, tareaRoutes);
app.use('/api/personas', verificarToken, verificarCSRF, personaRoutes);
app.use('/api/tags',     verificarToken, verificarCSRF, tagRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Ruta no encontrada' }));

module.exports = app;