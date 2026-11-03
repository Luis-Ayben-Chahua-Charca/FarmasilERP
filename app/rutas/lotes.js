'use strict';

const express = require('express');

const router = express.Router();

// POST /api/lotes: registra el ingreso de un lote (HU-04).
// El stock no se guarda aparte: se calcula desde cantidad_recibida.
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { producto_id, numero_lote, fecha_vencimiento, cantidad_recibida } = req.body ?? {};

  // Validación mínima; las validaciones completas del servidor son de #38
  if (!producto_id || !numero_lote || !fecha_vencimiento || !(cantidad_recibida > 0)) {
    return res.status(400).json({ error: 'Faltan datos del lote o no son válidos.' });
  }

  let info;
  try {
    info = db.prepare(`INSERT INTO lote (producto_id, numero_lote, fecha_vencimiento, cantidad_recibida)
      VALUES (?, ?, ?, ?)`).run(producto_id, numero_lote, fecha_vencimiento, cantidad_recibida);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({ error: 'El producto indicado no existe.' });
    }
    throw err;
  }

  const lote = db.prepare('SELECT * FROM lote WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(lote);
});

module.exports = router;
