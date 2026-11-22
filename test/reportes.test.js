'use strict';

const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app/server');
const { abrir } = require('../app/db');
const { fechaLocal } = require('../app/fechas');

// Reporte diario de ventas (#110, HU-03 CA1 y CA2)

let db;
beforeEach(() => {
  db = abrir(':memory:');
  app.locals.db = db;
  db.exec(`
    INSERT INTO producto (id, nombre, accion_terapeutica, tipo, precio_centimos) VALUES
      (1, 'Paracetamol 500 mg', 'Analgésico', 'generico', 50),
      (2, 'Ibuprofeno 400 mg', 'Antiinflamatorio', 'comercial', 120),
      (3, 'Ácido fólico 1 mg', 'Vitamina', 'generico', 30);
    INSERT INTO lote (id, producto_id, numero_lote, fecha_vencimiento, cantidad_recibida) VALUES
      (1, 1, 'L-2309', '2027-03-31', 4), (2, 1, 'L-2411', '2027-11-30', 100),
      (3, 2, 'L-5001', '2027-12-31', 50), (4, 3, 'L-8001', '2028-01-31', 50);
  `);
});
afterEach(() => db.close());

// Guarda una venta con fecha y hora fijas: [lote_id, cantidad, precio] por línea
function venta(fecha_hora, lineas) {
  const monto = lineas.reduce((total, [, cantidad, precio]) => total + cantidad * precio, 0);
  const { lastInsertRowid: id } = db.prepare('INSERT INTO venta (fecha_hora, monto_total_centimos) VALUES (?, ?)')
    .run(fecha_hora, monto);
  const linea = db.prepare(`INSERT INTO linea_venta (venta_id, lote_id, cantidad, precio_unitario_centimos)
    VALUES (?, ?, ?, ?)`);
  for (const [lote_id, cantidad, precio] of lineas) linea.run(id, lote_id, cantidad, precio);
  return Number(id);
}

const diario = (fecha) => request(app).get('/api/reportes/diario').query(fecha === undefined ? {} : { fecha });

test('un día con dos ventas trae totales, productos y detalle (HU-03 CA1)', async () => {
  const tarde = venta('2026-11-25 18:42:05', [[3, 4, 120]]);
  const manana = venta('2026-11-25 09:12:30', [[2, 10, 50]]);

  const res = await diario('2026-11-25');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    fecha: '2026-11-25',
    numero_ventas: 2,
    unidades_vendidas: 14,
    monto_total_centimos: 980,
    productos: [
      { producto_id: 2, nombre: 'Ibuprofeno 400 mg', unidades: 4, monto_centimos: 480 },
      { producto_id: 1, nombre: 'Paracetamol 500 mg', unidades: 10, monto_centimos: 500 },
    ],
    ventas: [
      { id: manana, hora: '09:12', monto_total_centimos: 500,
        lineas: [{ nombre: 'Paracetamol 500 mg', cantidad: 10, precio_unitario_centimos: 50 }] },
      { id: tarde, hora: '18:42', monto_total_centimos: 480,
        lineas: [{ nombre: 'Ibuprofeno 400 mg', cantidad: 4, precio_unitario_centimos: 120 }] },
    ],
  });
});

test('un producto vendido desde dos lotes aparece en una sola fila y una sola línea', async () => {
  venta('2026-11-25 10:00:00', [[1, 4, 50], [2, 2, 50], [3, 1, 120]]);

  const res = await diario('2026-11-25');

  assert.deepEqual(res.body.productos.find((p) => p.producto_id === 1),
    { producto_id: 1, nombre: 'Paracetamol 500 mg', unidades: 6, monto_centimos: 300 });
  assert.deepEqual(res.body.ventas[0].lineas, [
    { nombre: 'Ibuprofeno 400 mg', cantidad: 1, precio_unitario_centimos: 120 },
    { nombre: 'Paracetamol 500 mg', cantidad: 6, precio_unitario_centimos: 50 },
  ]);
  assert.equal(res.body.unidades_vendidas, 7);
  assert.equal(res.body.monto_total_centimos, 420);
});

test('las ventas de otros días no se cuentan, aunque estén a un minuto', async () => {
  venta('2026-11-24 23:59:59', [[2, 5, 50]]);
  venta('2026-11-25 00:00:00', [[3, 1, 120]]);
  venta('2026-11-26 00:00:00', [[2, 7, 50]]);

  const res = await diario('2026-11-25');

  assert.equal(res.body.numero_ventas, 1);
  assert.equal(res.body.monto_total_centimos, 120);
  assert.deepEqual(res.body.productos.map((p) => p.nombre), ['Ibuprofeno 400 mg']);
});

test('un día sin ventas devuelve ceros y listas vacías (HU-03 CA2)', async () => {
  venta('2026-11-24 12:00:00', [[2, 5, 50]]);

  const res = await diario('2026-11-25');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    fecha: '2026-11-25', numero_ventas: 0, unidades_vendidas: 0, monto_total_centimos: 0, productos: [], ventas: [],
  });
});

test('usa el precio guardado en cada línea, no el precio actual del producto', async () => {
  venta('2026-11-25 10:00:00', [[2, 10, 50]]);
  db.prepare('UPDATE producto SET precio_centimos = 80 WHERE id = 1').run();

  const res = await diario('2026-11-25');

  assert.equal(res.body.monto_total_centimos, 500);
  assert.equal(res.body.productos[0].monto_centimos, 500);
  assert.equal(res.body.ventas[0].lineas[0].precio_unitario_centimos, 50);
});

test('ordena los productos por nombre en español, con las tildes en su lugar', async () => {
  venta('2026-11-25 10:00:00', [[3, 1, 120], [4, 1, 30], [2, 1, 50]]);

  const res = await diario('2026-11-25');

  assert.deepEqual(res.body.productos.map((p) => p.nombre),
    ['Ácido fólico 1 mg', 'Ibuprofeno 400 mg', 'Paracetamol 500 mg']);
});

test('sin fecha, o con la fecha vacía, usa el día de hoy en hora local', async () => {
  const ahora = fechaLocal(new Date());
  venta(ahora, [[2, 3, 50]]);

  for (const fecha of [undefined, '']) {
    const res = await diario(fecha);
    assert.equal(res.status, 200);
    assert.equal(res.body.fecha, ahora.slice(0, 10));
    assert.equal(res.body.numero_ventas, 1);
  }
});

test('una fecha con otro formato o que no existe responde 400 con campo fecha', async () => {
  for (const fecha of ['25/11/2026', '2026-11-5', '2026-02-30', 'hoy']) {
    const res = await diario(fecha);
    assert.equal(res.status, 400, fecha);
    assert.deepEqual(res.body, { error: 'La fecha debe tener el formato AAAA-MM-DD.', campo: 'fecha' });
  }
});

test('el reporte es de solo lectura: no cambia ventas ni stock', async () => {
  venta('2026-11-25 10:00:00', [[2, 10, 50]]);
  const contar = () => db.prepare('SELECT (SELECT COUNT(*) FROM venta) v, (SELECT COUNT(*) FROM linea_venta) l').get();
  const antes = contar();

  await diario('2026-11-25');
  await diario('2026-02-30');

  assert.deepEqual(contar(), antes);
});
