'use strict';

const express = require('express');
const { fechaValida, fechaLocal } = require('../fechas');

const router = express.Router();

// Orden por nombre en español (las tildes no van al final, como en W3)
const porNombre = (a, b) => a.nombre.localeCompare(b.nombre, 'es');

// GET /api/reportes/diario?fecha=AAAA-MM-DD: ventas de un día (HU-03).
// Sin fecha, el día de hoy en la hora local de la laptop. Solo lectura.
router.get('/diario', (req, res) => {
  const db = req.app.locals.db;
  const fecha = req.query.fecha || fechaLocal(new Date()).slice(0, 10);

  if (typeof fecha !== 'string' || !fechaValida(fecha)) {
    return res.status(400).json({ error: 'La fecha debe tener el formato AAAA-MM-DD.', campo: 'fecha' });
  }

  // fecha_hora se guarda como «AAAA-MM-DD HH:MM:SS» local: los 10 primeros caracteres son el día
  const ventas = db.prepare(`
    SELECT id, fecha_hora, monto_total_centimos
    FROM venta WHERE substr(fecha_hora, 1, 10) = ?
    ORDER BY fecha_hora, id
  `).all(fecha);

  // Una fila por venta y producto: un producto que salió de dos lotes se suma en una sola línea
  const lineas = db.prepare(`
    SELECT lv.venta_id, p.id AS producto_id, p.nombre,
      SUM(lv.cantidad) AS cantidad, lv.precio_unitario_centimos
    FROM linea_venta lv
    JOIN venta v ON v.id = lv.venta_id
    JOIN lote l ON l.id = lv.lote_id
    JOIN producto p ON p.id = l.producto_id
    WHERE substr(v.fecha_hora, 1, 10) = ?
    GROUP BY lv.venta_id, p.id, lv.precio_unitario_centimos
  `).all(fecha);

  const productos = new Map();
  for (const l of lineas) {
    const fila = productos.get(l.producto_id)
      ?? { producto_id: l.producto_id, nombre: l.nombre, unidades: 0, monto_centimos: 0 };
    fila.unidades += l.cantidad;
    fila.monto_centimos += l.cantidad * l.precio_unitario_centimos;
    productos.set(l.producto_id, fila);
  }

  res.json({
    fecha,
    numero_ventas: ventas.length,
    unidades_vendidas: lineas.reduce((total, l) => total + l.cantidad, 0),
    monto_total_centimos: ventas.reduce((total, v) => total + v.monto_total_centimos, 0),
    productos: [...productos.values()].sort(porNombre),
    ventas: ventas.map((v) => ({
      id: v.id,
      hora: v.fecha_hora.slice(11, 16),
      monto_total_centimos: v.monto_total_centimos,
      lineas: lineas
        .filter((l) => l.venta_id === v.id)
        .sort(porNombre)
        .map(({ nombre, cantidad, precio_unitario_centimos }) => ({ nombre, cantidad, precio_unitario_centimos })),
    })),
  });
});

module.exports = router;
