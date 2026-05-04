'use strict';

const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

// POST /api/usuarios — registro público (requiere x-api-key)
const registrar = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nombre es requerido' });
    }
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email es requerido' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Contraseña mínima de 6 caracteres' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({
      nombre: nombre.trim(),
      email:  email.trim().toLowerCase(),
      password: hashedPassword,
      activo: true
    });

    const { password: _, ...datos } = usuario.toJSON();
    res.status(201).json({ success: true, data: datos });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// GET /api/usuarios
const obtenerTodas = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']]
    });
    res.json({ success: true, data: usuarios, count: usuarios.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// GET /api/usuarios/:id
const obtenerPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const usuario = await Usuario.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    res.json({ success: true, data: usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// PUT /api/usuarios/:id
const actualizar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const { nombre, email, password } = req.body;
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nombre es requerido' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const updates = { nombre: nombre.trim(), email: email ? email.trim().toLowerCase() : usuario.email };
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Contraseña mínima de 6 caracteres' });
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    await usuario.update(updates);
    const { password: _, ...datos } = usuario.toJSON();
    res.json({ success: true, data: datos });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// DELETE /api/usuarios/:id
const eliminar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const usuario = await Usuario.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    await usuario.destroy();
    res.json({ success: true, data: usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// PATCH /api/usuarios/:id/activar
const activar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    await usuario.update({ activo: true });
    res.json({ success: true, message: 'Usuario activado', data: { id: usuario.id, activo: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// PATCH /api/usuarios/:id/desactivar
const desactivar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    await usuario.update({ activo: false });
    res.json({ success: true, message: 'Usuario desactivado', data: { id: usuario.id, activo: false } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

module.exports = { registrar, obtenerTodas, obtenerPorId, actualizar, eliminar, activar, desactivar };
