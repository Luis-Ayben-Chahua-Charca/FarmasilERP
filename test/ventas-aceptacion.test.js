'use strict';

// Pruebas de aceptación de la API de ventas (#78, HU-01 CA1 a CA3).
// Usan la base «ventas» de docs/pruebas/casos-sprint-3.md y comprueban todo
// desde fuera, como la pantalla W1: POST /api/ventas y GET /api/stock.

const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app/server');
const { abrir } = require('../app/db');

let db;
beforeEach(() => {
  db = abrir(':memory:');
  app.locals.db = db;
  // Los lotes se insertan en el orden de registro de casos-sprint-3.md
  db.exec(`
    INSERT INTO producto (id, nombre, accion_terapeutica, tipo, precio_centimos) VALUES
      (1, 'Paracetamol 500 mg', 'Analgésico', 'generico', 50),
      (2, 'Amoxicilina 500 mg', 'Antibiótico', 'generico', 120),
      (3, 'Ibuprofeno 400 mg', 'Antiinflamatorio', 'comercial', 80),
      (4, 'Loratadina 10 mg', 'Antihistamínico', 'comercial', 30),
      (5, 'Omeprazol 20 mg', 'Antiácido', 'generico', 40);
    INSERT INTO lote (id, producto_id, numero_lote, fecha_vencimiento, cantidad_recibida) VALUES
      (1, 1, 'L-2309', '2027-03-31', 4),
      (2, 1, 'L-2411', '2027-11-30', 100),
      (3, 2, 'L-3001', '2027-06-30', 60),
      (4, 3, 'L-5001', '2027-12-31', 4),
      (5, 4, 'L-6002', '2028-09-30', 20),
      (6, 4, 'L-6001', '2027-05-31', 20),
      (7, 5, 'L-7001', '2027-10-31', 10),
      (8, 5, 'L-7002', '2027-10-31', 10);
  `);
});
afterEach(() => db.close());

const vender = (lineas) => request(app).post('/api/ventas').send({ lineas });

// Stock tal como lo ve W3: total y cantidad por número de lote
async function stock(producto_id) {
  const res = await request(app).get('/api/stock');
  assert.equal(res.status, 200);
  const producto = res.body.find((p) => p.id === producto_id);
  const lotes = Object.fromEntries(producto.lotes.map((l) => [l.numero_lote, l.cantidad]));
  return { total: producto.stock_total, lotes };
}

const contar = (tabla) => db.prepare(`SELECT COUNT(*) n FROM ${tabla}`).get().n;

test('CA1: una venta válida responde 201, se guarda completa y baja el stock', async () => {
  const res = await vender([{ producto_id: 2, cantidad: 5 }]);

  assert.equal(res.status, 201);
  assert.match(res.body.fecha_hora, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  assert.equal(res.body.monto_total_centimos, 600);
  assert.deepEqual(res.body.lineas.map(({ producto_id, numero_lote, cantidad, precio_unitario_centimos }) =>
    ({ producto_id, numero_lote, cantidad, precio_unitario_centimos })),
  [{ producto_id: 2, numero_lote: 'L-3001', cantidad: 5, precio_unitario_centimos: 120 }]);

  // Lo devuelto es lo que quedó guardado
  const venta = db.prepare('SELECT fecha_hora, monto_total_centimos FROM venta WHERE id = ?').get(res.body.id);
  assert.deepEqual({ ...venta }, { fecha_hora: res.body.fecha_hora, monto_total_centimos: 600 });
  const lineas = db.prepare('SELECT lote_id, cantidad, precio_unitario_centimos FROM linea_venta WHERE venta_id = ?')
    .all(res.body.id).map((l) => ({ ...l }));
  assert.deepEqual(lineas, [{ lote_id: 3, cantidad: 5, precio_unitario_centimos: 120 }]);

  assert.deepEqual(await stock(2), { total: 55, lotes: { 'L-3001': 55 } });
});

test('CA2: con 4 unidades, vender 5 responde 409 con lo disponible y no guarda nada', async () => {
  const res = await vender([{ producto_id: 3, cantidad: 5 }]);

  assert.equal(res.status, 409);
  assert.deepEqual(res.body, {
    error: 'Solo hay 4 unidades disponibles de Ibuprofeno 400 mg.',
    campo: 'cantidad', producto_id: 3, disponible: 4,
  });
  assert.equal(contar('venta'), 0);
  assert.equal(contar('linea_venta'), 0);
  assert.equal((await stock(3)).total, 4);
});

test('CA3: 10 unidades a S/ 0.50 y 4 a S/ 1.20 suman S/ 9.80', async () => {
  const res = await vender([{ producto_id: 1, cantidad: 10 }, { producto_id: 2, cantidad: 4 }]);

  assert.equal(res.status, 201);
  assert.equal(res.body.monto_total_centimos, 980);
  // Cada línea lleva el precio por unidad de su producto: 10 × 50 + 4 × 120
  const subtotales = res.body.lineas.reduce((suma, l) => suma + l.cantidad * l.precio_unitario_centimos, 0);
  assert.equal(subtotales, 980);
});

test('transacción: si un producto no tiene stock, no se guarda ninguna parte de la venta', async () => {
  const res = await vender([{ producto_id: 2, cantidad: 4 }, { producto_id: 3, cantidad: 10 }]);

  assert.equal(res.status, 409);
  assert.equal(res.body.producto_id, 3);
  assert.equal(contar('venta'), 0);
  assert.equal(contar('linea_venta'), 0);
  // La línea válida de Amoxicilina tampoco descontó stock
  assert.equal((await stock(2)).total, 60);
});

test('precio: un precio o monto inventado en el cuerpo no cambia lo que se cobra', async () => {
  const res = await request(app).post('/api/ventas').send({
    monto_total_centimos: 1,
    lineas: [
      { producto_id: 1, cantidad: 10, precio_unitario_centimos: 1, precio: 0.01 },
      { producto_id: 2, cantidad: 4, precio_unitario_centimos: 1, precio: 0.01 },
    ],
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.monto_total_centimos, 980);
  assert.ok(res.body.lineas.every((l) => l.precio_unitario_centimos === (l.producto_id === 1 ? 50 : 120)));
});

test('la secuencia de casos-sprint-3.md deja el stock esperado en cada paso', async () => {
  const pasos = [
    // [paso, venta, producto que se revisa, stock esperado]
    ['2: 6 de Paracetamol (HU-02 CA1)', [{ producto_id: 1, cantidad: 6 }], 1,
      { total: 98, lotes: { 'L-2309': 0, 'L-2411': 98 } }],
    ['3: 3 de Paracetamol con A en cero (HU-02 CA2)', [{ producto_id: 1, cantidad: 3 }], 1,
      { total: 95, lotes: { 'L-2309': 0, 'L-2411': 95 } }],
    ['4: 5 de Loratadina, vence antes aunque se registró después', [{ producto_id: 4, cantidad: 5 }], 4,
      { total: 35, lotes: { 'L-6001': 15, 'L-6002': 20 } }],
    ['5: 3 de Omeprazol, mismo vencimiento: el registrado primero', [{ producto_id: 5, cantidad: 3 }], 5,
      { total: 17, lotes: { 'L-7001': 7, 'L-7002': 10 } }],
    ['6: 10 de Paracetamol y 4 de Amoxicilina (HU-01 CA3)',
      [{ producto_id: 1, cantidad: 10 }, { producto_id: 2, cantidad: 4 }], 1,
      { total: 85, lotes: { 'L-2309': 0, 'L-2411': 85 } }],
    ['7: 5 de Amoxicilina (HU-01 CA1)', [{ producto_id: 2, cantidad: 5 }], 2,
      { total: 51, lotes: { 'L-3001': 51 } }],
  ];

  for (const [paso, lineas, producto_id, esperado] of pasos) {
    const res = await vender(lineas);
    assert.equal(res.status, 201, `paso ${paso}`);
    assert.deepEqual(await stock(producto_id), esperado, `paso ${paso}`);
  }

  // Paso 8: Ibuprofeno no se vende y sigue en 4
  assert.equal((await stock(3)).total, 4);
});
