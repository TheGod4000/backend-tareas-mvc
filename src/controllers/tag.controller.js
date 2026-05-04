'use strict';

const { Tag, Tarea, Persona } = require('../models');

// GET /api/tags
const obtenerTodas = async (req, res) => {
  try {
    const tags = await Tag.findAll({ order: [['id', 'ASC']] });
    res.json({ success: true, data: tags, count: tags.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// GET /api/tags/:id
const obtenerPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const tag = await Tag.findByPk(id, {
      include: [{ model: Tarea, as: 'tareas' }]
    });
    if (!tag) return res.status(404).json({ success: false, message: 'Tag no encontrado' });

    res.json({ success: true, data: tag });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// POST /api/tags
const crear = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nombre del tag es requerido' });
    }
    const tag = await Tag.create({ nombre: nombre.trim(), color });
    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'El nombre del tag ya existe' });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// PUT /api/tags/:id
const actualizar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const { nombre, color } = req.body;
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nombre del tag es requerido' });
    }

    const tag = await Tag.findByPk(id);
    if (!tag) return res.status(404).json({ success: false, message: 'Tag no encontrado' });

    await tag.update({ nombre: nombre.trim(), color });
    res.json({ success: true, data: tag });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'El nombre del tag ya existe' });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// DELETE /api/tags/:id
const eliminar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const tag = await Tag.findByPk(id);
    if (!tag) return res.status(404).json({ success: false, message: 'Tag no encontrado' });

    await tag.destroy();
    res.json({ success: true, data: tag });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// GET /api/tags/:id/tareas
const obtenerTareas = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const tag = await Tag.findByPk(id, {
      include: [{ model: Tarea, as: 'tareas', include: [{ model: Persona, as: 'personas' }] }]
    });
    if (!tag) return res.status(404).json({ success: false, message: 'Tag no encontrado' });

    res.json({ success: true, data: tag.tareas, count: tag.tareas.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// POST /api/tags/:id/tareas/:tareaId
const agregarTarea = async (req, res) => {
  try {
    const tagId   = parseInt(req.params.id);
    const tareaId = parseInt(req.params.tareaId);
    if (isNaN(tagId) || isNaN(tareaId)) return res.status(400).json({ success: false, message: 'IDs inválidos' });

    const [tag, tarea] = await Promise.all([Tag.findByPk(tagId), Tarea.findByPk(tareaId)]);
    if (!tag)   return res.status(404).json({ success: false, message: 'Tag no encontrado' });
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    await tag.addTarea(tarea);
    res.status(201).json({ success: true, message: 'Tarea asociada al tag' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// DELETE /api/tags/:id/tareas/:tareaId
const quitarTarea = async (req, res) => {
  try {
    const tagId   = parseInt(req.params.id);
    const tareaId = parseInt(req.params.tareaId);
    if (isNaN(tagId) || isNaN(tareaId)) return res.status(400).json({ success: false, message: 'IDs inválidos' });

    const [tag, tarea] = await Promise.all([Tag.findByPk(tagId), Tarea.findByPk(tareaId)]);
    if (!tag)   return res.status(404).json({ success: false, message: 'Tag no encontrado' });
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    await tag.removeTarea(tarea);
    res.json({ success: true, message: 'Tarea desasociada del tag' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// GET /api/tags/:id/personas  — relación indirecta: personas a través de tareas
const obtenerPersonas = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const tag = await Tag.findByPk(id, {
      include: [{ model: Tarea, as: 'tareas', include: [{ model: Persona, as: 'personas' }] }]
    });
    if (!tag) return res.status(404).json({ success: false, message: 'Tag no encontrado' });

    const personasMap = new Map();
    tag.tareas.forEach(tarea => {
      tarea.personas.forEach(p => personasMap.set(p.id, p));
    });
    const personas = Array.from(personasMap.values());

    res.json({ success: true, data: personas, count: personas.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

module.exports = {
  obtenerTodas, obtenerPorId, crear, actualizar, eliminar,
  obtenerTareas, agregarTarea, quitarTarea, obtenerPersonas
};
