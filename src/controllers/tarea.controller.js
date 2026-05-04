'use strict';

const { Tarea, Persona, Tag } = require('../models');
const { Op } = require('sequelize');

// GET /api/tareas  — lista todas o filtra con ?q=  (también soporta ?formato=text)
const obtenerTodas = async (req, res) => {
  try {
    const { formato, q } = req.query;
    const where = q ? { titulo: { [Op.like]: `%${q}%` } } : {};
    const tareas = await Tarea.findAll({ where, order: [['id', 'ASC']] });

    if (formato === 'text') {
      let texto = '--- LISTA DE TAREAS ---\n';
      tareas.forEach(t => {
        texto += `[${t.completada ? 'X' : ' '}] ID: ${t.id} - ${t.titulo}\n`;
      });
      return res.type('text/plain').send(texto);
    }

    res.json({ success: true, data: tareas, count: tareas.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// GET /api/tareas/buscar?q=
const buscar = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Falta el parámetro ?q=' });

    const resultados = await Tarea.findAll({ where: { titulo: { [Op.like]: `%${q}%` } } });
    res.json({ success: true, data: resultados, count: resultados.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// GET /api/tareas/:id
const obtenerPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const tarea = await Tarea.findByPk(id, {
      include: [{ model: Persona, as: 'personas' }, { model: Tag, as: 'tags' }]
    });
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    res.json({ success: true, data: tarea });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// POST /api/tareas
const crear = async (req, res) => {
  try {
    const { titulo, descripcion, completada } = req.body;
    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ success: false, message: 'Título es requerido' });
    }
    const nuevaTarea = await Tarea.create({ titulo: titulo.trim(), descripcion, completada: completada || false });
    res.status(201).json({ success: true, data: nuevaTarea });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// PUT /api/tareas/:id
const actualizarCompleta = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { titulo, descripcion, completada } = req.body;

    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
    if (!titulo || titulo.trim() === '') return res.status(400).json({ success: false, message: 'Título es requerido' });

    const tarea = await Tarea.findByPk(id);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    await tarea.update({ titulo: titulo.trim(), descripcion, completada: completada !== undefined ? completada : tarea.completada });
    res.json({ success: true, data: tarea });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// PATCH /api/tareas/:id
const actualizarParcial = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
    if (Object.keys(req.body).length === 0) return res.status(400).json({ success: false, message: 'Enviar datos para actualizar' });

    const tarea = await Tarea.findByPk(id);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    const { titulo, descripcion, completada } = req.body;
    const updates = {};
    if (titulo !== undefined) updates.titulo = titulo.trim();
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (completada !== undefined) updates.completada = completada;

    await tarea.update(updates);
    res.json({ success: true, data: tarea });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// DELETE /api/tareas/:id
const eliminar = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const tarea = await Tarea.findByPk(id);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    await tarea.destroy();
    res.json({ success: true, data: tarea });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// GET /api/tareas/:id/personas
const obtenerPersonas = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const tarea = await Tarea.findByPk(id, { include: [{ model: Persona, as: 'personas' }] });
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    res.json({ success: true, data: tarea.personas, count: tarea.personas.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// POST /api/tareas/:id/personas/:personaId
const agregarPersona = async (req, res) => {
  try {
    const tareaId   = parseInt(req.params.id);
    const personaId = parseInt(req.params.personaId);
    if (isNaN(tareaId) || isNaN(personaId)) return res.status(400).json({ success: false, message: 'IDs inválidos' });

    const [tarea, persona] = await Promise.all([Tarea.findByPk(tareaId), Persona.findByPk(personaId)]);
    if (!tarea)   return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    if (!persona) return res.status(404).json({ success: false, message: 'Persona no encontrada' });

    await tarea.addPersona(persona);
    res.status(201).json({ success: true, message: 'Persona asociada a la tarea' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// DELETE /api/tareas/:id/personas/:personaId
const quitarPersona = async (req, res) => {
  try {
    const tareaId   = parseInt(req.params.id);
    const personaId = parseInt(req.params.personaId);
    if (isNaN(tareaId) || isNaN(personaId)) return res.status(400).json({ success: false, message: 'IDs inválidos' });

    const [tarea, persona] = await Promise.all([Tarea.findByPk(tareaId), Persona.findByPk(personaId)]);
    if (!tarea)   return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    if (!persona) return res.status(404).json({ success: false, message: 'Persona no encontrada' });

    await tarea.removePersona(persona);
    res.json({ success: true, message: 'Persona desasociada de la tarea' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// GET /api/tareas/:id/tags
const obtenerTags = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });

    const tarea = await Tarea.findByPk(id, { include: [{ model: Tag, as: 'tags' }] });
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    res.json({ success: true, data: tarea.tags, count: tarea.tags.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// POST /api/tareas/:id/tags/:tagId
const agregarTag = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);
    const tagId   = parseInt(req.params.tagId);
    if (isNaN(tareaId) || isNaN(tagId)) return res.status(400).json({ success: false, message: 'IDs inválidos' });

    const [tarea, tag] = await Promise.all([Tarea.findByPk(tareaId), Tag.findByPk(tagId)]);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    if (!tag)   return res.status(404).json({ success: false, message: 'Tag no encontrado' });

    await tarea.addTag(tag);
    res.status(201).json({ success: true, message: 'Tag asociado a la tarea' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// DELETE /api/tareas/:id/tags/:tagId
const quitarTag = async (req, res) => {
  try {
    const tareaId = parseInt(req.params.id);
    const tagId   = parseInt(req.params.tagId);
    if (isNaN(tareaId) || isNaN(tagId)) return res.status(400).json({ success: false, message: 'IDs inválidos' });

    const [tarea, tag] = await Promise.all([Tarea.findByPk(tareaId), Tag.findByPk(tagId)]);
    if (!tarea) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    if (!tag)   return res.status(404).json({ success: false, message: 'Tag no encontrado' });

    await tarea.removeTag(tag);
    res.json({ success: true, message: 'Tag desasociado de la tarea' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

module.exports = {
  obtenerTodas, buscar, obtenerPorId, crear,
  actualizarCompleta, actualizarParcial, eliminar,
  obtenerPersonas, agregarPersona, quitarPersona,
  obtenerTags, agregarTag, quitarTag
};
