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

// Valida desde y hasta de los reportes por periodo (#112; la reutiliza #113).
// Devuelve { error, campo } o null si el periodo es válido.
function validarPeriodo({ desde, hasta }) {
  for (const [campo, valor] of [['desde', desde], ['hasta', hasta]]) {
    if (valor === undefined || valor === '') return { error: 'Elija la fecha de inicio y la de fin.', campo };
  }
  for (const [campo, valor] of [['desde', desde], ['hasta', hasta]]) {
    if (typeof valor !== 'string' || !fechaValida(valor)) {
      return { error: 'La fecha debe tener el formato AAAA-MM-DD.', campo };
    }
  }
  if (desde > hasta) return { error: 'La fecha de inicio no puede ser posterior a la de fin.', campo: 'desde' };
  return null;
}

// Meses AAAA-MM del rango, en orden, incluidos el primero y el último
function mesesDelRango(desde, hasta) {
  const meses = [];
  let [anio, mes] = desde.slice(0, 7).split('-').map(Number);
  const ultimo = hasta.slice(0, 7);
  for (;;) {
    const actual = `${anio}-${String(mes).padStart(2, '0')}`;
    meses.push(actual);
    if (actual >= ultimo) return meses;
    mes += 1;
    if (mes === 13) { mes = 1; anio += 1; }
  }
}

// GET /api/reportes/ingresos?desde=&hasta=: ingresos del periodo con una fila por mes (HU-09 CA1).
// Fechas inclusivas; los meses sin ventas van con 0 para que se note el hueco. Solo lectura.
router.get('/ingresos', (req, res) => {
  const db = req.app.locals.db;
  const invalido = validarPeriodo(req.query);
  if (invalido) return res.status(400).json(invalido);

  const { desde, hasta } = req.query;
  const porMes = new Map(db.prepare(`
    SELECT substr(fecha_hora, 1, 7) AS mes, COUNT(*) AS numero_ventas,
      SUM(monto_total_centimos) AS monto_total_centimos
    FROM venta WHERE substr(fecha_hora, 1, 10) BETWEEN ? AND ?
    GROUP BY mes
  `).all(desde, hasta).map((fila) => [fila.mes, fila]));

  const meses = mesesDelRango(desde, hasta).map((mes) => ({
    mes,
    numero_ventas: porMes.get(mes)?.numero_ventas ?? 0,
    monto_total_centimos: porMes.get(mes)?.monto_total_centimos ?? 0,
  }));

  res.json({
    desde,
    hasta,
    numero_ventas: meses.reduce((total, m) => total + m.numero_ventas, 0),
    monto_total_centimos: meses.reduce((total, m) => total + m.monto_total_centimos, 0),
    meses,
  });
});

// GET /api/reportes/mas-vendidos?desde=&hasta=: productos del periodo por unidades (HU-09 CA2).
// Suma todos los lotes de cada producto; de mayor a menor y, en empate, por nombre. Sin límite:
// W5 muestra los 10 primeros. Solo lectura.
router.get('/mas-vendidos', (req, res) => {
  const db = req.app.locals.db;
  const invalido = validarPeriodo(req.query);
  if (invalido) return res.status(400).json(invalido);

  const { desde, hasta } = req.query;
  const productos = db.prepare(`
    SELECT p.id AS producto_id, p.nombre, SUM(lv.cantidad) AS unidades,
      SUM(lv.cantidad * lv.precio_unitario_centimos) AS monto_centimos
    FROM linea_venta lv
    JOIN venta v ON v.id = lv.venta_id
    JOIN lote l ON l.id = lv.lote_id
    JOIN producto p ON p.id = l.producto_id
    WHERE substr(v.fecha_hora, 1, 10) BETWEEN ? AND ?
    GROUP BY p.id
  `).all(desde, hasta);

  productos.sort((a, b) => b.unidades - a.unidades || porNombre(a, b));
  res.json({ desde, hasta, productos });
});

module.exports = router;
