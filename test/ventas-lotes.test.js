const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app/server');
const { abrir } = require('../app/db');

// Descuento por vencimiento dentro de la venta (#79, HU-02 CA1 y CA2)

beforeEach(() => {
  const db = abrir(':memory:');
  app.locals.db = db;
  const producto = db.prepare('INSERT INTO producto (id, nombre, accion_terapeutica, tipo, precio_centimos) VALUES (?, ?, ?, ?, ?)');
  producto.run(1, 'Paracetamol 500 mg', 'Analgésico', 'generico', 50);
  producto.run(2, 'Amoxicilina 500 mg', 'Antibiótico', 'generico', 120);
  const lote = db.prepare('INSERT INTO lote (id, producto_id, numero_lote, fecha_vencimiento, cantidad_recibida) VALUES (?, ?, ?, ?, ?)');
  lote.run(1, 1, 'L-A', '2027-03-31', 4);
  lote.run(2, 1, 'L-B', '2027-11-30', 100);
  lote.run(3, 2, 'L-X', '2027-06-30', 10);
  lote.run(4, 2, 'L-Y', '2027-02-28', 10); // registrado después, pero vence antes
});

const vender = (lineas) => request(app).post('/api/ventas').send({ lineas });
const stock = async (id) => {
  const res = await request(app).get('/api/stock');
  return res.body.find((p) => p.id === id);
};
const cantidadLote = (producto, numero) =>
  producto.lotes.find((l) => l.numero_lote === numero)?.cantidad ?? 0;
const repartos = (res) => res.body.lineas.map((l) => [l.producto_id, l.numero_lote, l.cantidad]);
const lineasDelLote = (id) =>
  app.locals.db.prepare('SELECT COUNT(*) AS n FROM linea_venta WHERE lote_id = ?').get(id).n;

test('vender 6 usa 4 del lote A y 2 del B, y el stock queda en 0 y 98 (HU-02 CA1)', async () => {
  const res = await vender([{ producto_id: 1, cantidad: 6 }]);
  assert.strictEqual(res.status, 201);
  assert.deepStrictEqual(repartos(res), [[1, 'L-A', 4], [1, 'L-B', 2]]);

  const paracetamol = await stock(1);
  assert.strictEqual(cantidadLote(paracetamol, 'L-A'), 0);
  assert.strictEqual(cantidadLote(paracetamol, 'L-B'), 98);
  assert.strictEqual(paracetamol.stock_total, 98);
});

test('con el lote A en cero, vender 3 usa solo el B y no crea líneas para A (HU-02 CA2)', async () => {
  await vender([{ producto_id: 1, cantidad: 6 }]);
  const lineasAntes = lineasDelLote(1);

  const res = await vender([{ producto_id: 1, cantidad: 3 }]);
  assert.strictEqual(res.status, 201);
  assert.deepStrictEqual(repartos(res), [[1, 'L-B', 3]]);
  assert.strictEqual(lineasDelLote(1), lineasAntes);

  const paracetamol = await stock(1);
  assert.strictEqual(cantidadLote(paracetamol, 'L-B'), 95);
  assert.strictEqual(paracetamol.stock_total, 95);
});

test('un lote registrado después que vence antes se usa primero', async () => {
  const res = await vender([{ producto_id: 2, cantidad: 3 }]);
  assert.strictEqual(res.status, 201);
  assert.deepStrictEqual(repartos(res), [[2, 'L-Y', 3]]);

  const amoxicilina = await stock(2);
  assert.strictEqual(cantidadLote(amoxicilina, 'L-Y'), 7);
  assert.strictEqual(cantidadLote(amoxicilina, 'L-X'), 10);
});

test('en una venta de dos productos cada uno descuenta solo de sus lotes', async () => {
  const res = await vender([{ producto_id: 1, cantidad: 6 }, { producto_id: 2, cantidad: 3 }]);
  assert.strictEqual(res.status, 201);
  assert.deepStrictEqual(repartos(res), [[1, 'L-A', 4], [1, 'L-B', 2], [2, 'L-Y', 3]]);

  assert.strictEqual((await stock(1)).stock_total, 98);
  assert.strictEqual((await stock(2)).stock_total, 17);
});
