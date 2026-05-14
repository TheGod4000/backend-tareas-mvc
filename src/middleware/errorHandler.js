'use strict';

function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Sequelize validation / unique errors
  if (err && err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors ? err.errors.map((e) => ({ field: e.path, message: e.message })) : undefined,
    });
  }
  if (err && err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Resource already exists',
      details: err.errors ? err.errors.map((e) => ({ field: e.path, message: e.message })) : undefined,
    });
  }
  if (err && err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Invalid reference', details: err.message });
  }

  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : 'Internal Server Error';

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[errorHandler]', err);
  }

  const body = { error: message };
  if (err && err.details) body.details = err.details;
  return res.status(status).json(body);
}

function notFoundHandler(req, res) {
  return res.status(404).json({ error: 'Not Found' });
}

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    if (details !== undefined) this.details = details;
  }
}

module.exports = { errorHandler, notFoundHandler, asyncHandler, HttpError };
