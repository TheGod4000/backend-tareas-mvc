'use strict';

const { Persona, Tarea, Tag } = require('../models');

// GET /api/personas
const obtenerTodas = async (req, res) => {
  try {
    const personas = await Persona.findAll({ order: [['id', 'ASC']] });
    res.json({ success: true, data: personas, count: personas.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// GET /api/personas/:id
const obtenerPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const persona = await Persona.findByPk(id, {
      include: [{ model: Tarea, as: 'tareas', include: [{ model: Tag, as: 'tags' }] }]
    });
    if (!persona) return res.status(404).json({ success: false, message: 'Persona no encontrada' });

    res.json({ success: true, data: persona });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// POST /api/personas
const crear = async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nombre es requerido' });
    }
    const persona = await Persona.create({ nombre: nombre.trim(), email, telefono });
    res.status(201).json({ success: true, data: persona });
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

// PUT /api/personas/:id
const actualizar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const { nombre, email, telefono } = req.body;
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nombre es requerido' });
    }

    const persona = await Persona.findByPk(id);
    if (!persona) return res.status(404).json({ success: false, message: 'Persona no encontrada' });

    await persona.update({ nombre: nombre.trim(), email, telefono });
    res.json({ success: true, data: persona });
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

// DELETE /api/personas/:id
const eliminar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const persona = await Persona.findByPk(id);
    if (!persona) return res.status(404).json({ success: false, message: 'Persona no encontrada' });

    await persona.destroy();
    res.json({ success: true, data: persona });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// GET /api/personas/:id/tareas
const obtenerTareas = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const persona = await Persona.findByPk(id, {
      include: [{ model: Tarea, as: 'tareas', include: [{ model: Tag, as: 'tags' }] }]
    });
    if (!persona) return res.status(404).json({ success: false, message: 'Persona no encontrada' });

    res.json({ success: true, data: persona.tareas, count: persona.tareas.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// POST /api/personas/:id/tareas/:tareaId
const agregarTarea = async (req, res) => {
  try {
    const personaId = parseInt(req.params.id);
    const tareaId   = parseInt(req.params.tareaId);
    if (isNaN(personaId) || isNaN(tareaId)) return res.status(400).json({ success: false, message: 'IDs inválidos' });

    const [persona, tarea] = await Promise.all([Persona.findByPk(personaId), Tarea.findByPk(tareaId)]);
    if (!persona) return res.status(404).json({ success: false, message: 'Persona no encontrada' });
    if (!tarea)   return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    await persona.addTarea(tarea);
    res.status(201).json({ success: true, message: 'Tarea asociada a la persona' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// DELETE /api/personas/:id/tareas/:tareaId
const quitarTarea = async (req, res) => {
  try {
    const personaId = parseInt(req.params.id);
    const tareaId   = parseInt(req.params.tareaId);
    if (isNaN(personaId) || isNaN(tareaId)) return res.status(400).json({ success: false, message: 'IDs inválidos' });

    const [persona, tarea] = await Promise.all([Persona.findByPk(personaId), Tarea.findByPk(tareaId)]);
    if (!persona) return res.status(404).json({ success: false, message: 'Persona no encontrada' });
    if (!tarea)   return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    await persona.removeTarea(tarea);
    res.json({ success: true, message: 'Tarea desasociada de la persona' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// GET /api/personas/:id/tags  — relación indirecta: tags a través de tareas
const obtenerTags = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const persona = await Persona.findByPk(id, {
      include: [{ model: Tarea, as: 'tareas', include: [{ model: Tag, as: 'tags' }] }]
    });
    if (!persona) return res.status(404).json({ success: false, message: 'Persona no encontrada' });

    // Aplanar y deduplicar tags
    const tagsMap = new Map();
    persona.tareas.forEach(tarea => {
      tarea.tags.forEach(tag => tagsMap.set(tag.id, tag));
    });
    const tags = Array.from(tagsMap.values());

    res.json({ success: true, data: tags, count: tags.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

module.exports = {
  obtenerTodas, obtenerPorId, crear, actualizar, eliminar,
  obtenerTareas, agregarTarea, quitarTarea, obtenerTags
};
