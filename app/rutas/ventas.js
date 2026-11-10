'use strict';

const express = require('express');
const { asignarLotes } = require('../ventas/asignar-lotes');

const router = express.Router();
const entero = (valor) => (typeof valor === 'string' ? Number(valor.trim()) : valor);

function rechazar(estado, cuerpo) {
  throw Object.assign(new Error(cuerpo.error), { estado, cuerpo });
}

function fechaLocal(fecha) {
  const dos = (valor) => String(valor).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())} ` +
    `${dos(fecha.getHours())}:${dos(fecha.getMinutes())}:${dos(fecha.getSeconds())}`;
}

router.post('/', (req, res, next) => {
  const db = req.app.locals.db;

  const registrar = db.transaction(() => {
    const lineas = req.body?.lineas;
    if (!Array.isArray(lineas) || lineas.length === 0) {
      rechazar(400, { error: 'Agregue al menos un producto a la venta.', campo: 'lineas' });
    }

    const cantidades = new Map();
    for (const linea of lineas) {
      const producto_id = entero(linea?.producto_id);
      if (!Number.isInteger(producto_id) || !db.prepare('SELECT 1 FROM producto WHERE id = ?').get(producto_id)) {
        rechazar(400, {
          error: 'El producto indicado no existe.', campo: 'producto_id',
          producto_id: linea?.producto_id,
        });
      }
      const cantidad = entero(linea.cantidad);
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        rechazar(400, {
          error: 'La cantidad debe ser mayor que cero.', campo: 'cantidad', producto_id,
        });
      }
      cantidades.set(producto_id, (cantidades.get(producto_id) ?? 0) + cantidad);
    }

    const detalle = [];
    let monto_total_centimos = 0;
    for (const [producto_id, cantidad] of cantidades) {
      const producto = db.prepare('SELECT precio_centimos FROM producto WHERE id = ?').get(producto_id);
      const lotes = db.prepare(`
        SELECT l.id, l.numero_lote, l.fecha_vencimiento,
          l.cantidad_recibida - COALESCE(
            (SELECT SUM(lv.cantidad) FROM linea_venta lv WHERE lv.lote_id = l.id), 0) AS disponible
        FROM lote l WHERE l.producto_id = ?
      `).all(producto_id);
      const asignaciones = asignarLotes(lotes, cantidad);
      if (asignaciones === null) {
        // #74 sustituye este rechazo provisional por el detalle del stock disponible.
        rechazar(409, { error: 'Stock insuficiente.', campo: 'cantidad' });
      }
      for (const asignacion of asignaciones) {
        detalle.push({ producto_id, ...asignacion, precio_unitario_centimos: producto.precio_centimos });
      }
      monto_total_centimos += cantidad * producto.precio_centimos;
    }

    const fecha_hora = fechaLocal(new Date());
    const venta = db.prepare(`INSERT INTO venta (fecha_hora, monto_total_centimos)
      VALUES (?, ?)`).run(fecha_hora, monto_total_centimos);
    const insertarLinea = db.prepare(`INSERT INTO linea_venta
      (venta_id, lote_id, cantidad, precio_unitario_centimos) VALUES (?, ?, ?, ?)`);
    for (const linea of detalle) {
      insertarLinea.run(venta.lastInsertRowid, linea.lote_id, linea.cantidad, linea.precio_unitario_centimos);
    }
    return { id: venta.lastInsertRowid, fecha_hora, monto_total_centimos, lineas: detalle };
  });

  try {
    // Reserva la escritura antes de leer stock; todo el registro es atómico.
    const venta = registrar.immediate();
    res.status(201).json(venta);
  } catch (err) {
    if (err.estado) return res.status(err.estado).json(err.cuerpo);
    next(err);
  }
});

module.exports = router;
