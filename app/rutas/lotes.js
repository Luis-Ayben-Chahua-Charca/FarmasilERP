'use strict';

const express = require('express');

const router = express.Router();

const vacio = (valor) => valor === undefined || valor === null || String(valor).trim() === '';

// Acepta números o texto con dígitos (el formulario puede enviar el valor del campo tal cual)
const entero = (valor) => (typeof valor === 'string' ? Number(valor.trim()) : valor);

// AAAA-MM-DD y que la fecha exista (rechaza, por ejemplo, 2027-02-30)
function fechaValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(texto);
}

// Valida antes de insertar (HU-04 CA3): devuelve { error, campo } o null si todo está bien
function validarLote(db, datos) {
  const { producto_id, numero_lote, fecha_vencimiento, cantidad_recibida } = datos;

  if (vacio(producto_id)) return { error: 'Elija un producto.', campo: 'producto_id' };
  if (vacio(numero_lote)) return { error: 'Ingrese el número de lote.', campo: 'numero_lote' };
  if (vacio(fecha_vencimiento)) {
    return { error: 'Ingrese la fecha de vencimiento.', campo: 'fecha_vencimiento' };
  }
  if (vacio(cantidad_recibida)) return { error: 'Ingrese la cantidad.', campo: 'cantidad_recibida' };

  const cantidad = entero(cantidad_recibida);
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    return { error: 'La cantidad debe ser mayor que cero.', campo: 'cantidad_recibida' };
  }
  if (!fechaValida(String(fecha_vencimiento))) {
    return { error: 'La fecha debe tener el formato AAAA-MM-DD.', campo: 'fecha_vencimiento' };
  }
  const id = entero(producto_id);
  if (!Number.isInteger(id) || !db.prepare('SELECT 1 FROM producto WHERE id = ?').get(id)) {
    return { error: 'El producto indicado no existe.', campo: 'producto_id' };
  }
  return null;
}

// POST /api/lotes: registra el ingreso de un lote (HU-04).
// El stock no se guarda aparte: se calcula desde cantidad_recibida.
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const datos = req.body ?? {};

  const invalido = validarLote(db, datos);
  if (invalido) return res.status(400).json(invalido);

  const producto_id = entero(datos.producto_id);
  const numero_lote = String(datos.numero_lote).trim();
  const fecha_vencimiento = String(datos.fecha_vencimiento);
  const cantidad_recibida = entero(datos.cantidad_recibida);

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
