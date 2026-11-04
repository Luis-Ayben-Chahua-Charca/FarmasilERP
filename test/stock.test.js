const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app/server');
const { abrir } = require('../app/db');

// API de consulta de stock (#44, HU-08 CA1, CA2 y CA3)

beforeEach(() => {
  const db = abrir(':memory:');
  app.locals.db = db;
  const producto = db.prepare('INSERT INTO producto (id, nombre, accion_terapeutica, tipo, precio_centimos) VALUES (?, ?, ?, ?, ?)');
  producto.run(1, 'Paracetamol 500 mg', 'Analgésico', 'generico', 50);
  producto.run(2, 'Panadol 500 mg', 'Analgésico', 'comercial', 120);
  producto.run(3, 'Amoxicilina 500 mg', 'Antibiótico', 'generico', 80);
  const lote = db.prepare('INSERT INTO lote (id, producto_id, numero_lote, fecha_vencimiento, cantidad_recibida) VALUES (?, ?, ?, ?, ?)');
  lote.run(1, 1, 'L-B', '2028-06-01', 10);
  lote.run(2, 1, 'L-A', '2027-01-15', 5);
  lote.run(3, 2, 'L-C', '2027-09-30', 8);
});

const buscar = (consulta = '') => request(app).get('/api/stock' + consulta);
const nombres = (res) => res.body.map((p) => p.nombre);

test('el stock total es la suma de los ingresos menos las ventas (CA1)', async () => {
  let res = await buscar();
  assert.strictEqual(res.status, 200);
  const paracetamol = res.body.find((p) => p.id === 1);
  assert.strictEqual(paracetamol.stock_total, 15);
  assert.strictEqual(paracetamol.precio_centimos, 50);

  // Una venta de 3 unidades del lote L-A descuenta del stock
  const db = app.locals.db;
  db.prepare("INSERT INTO venta (id, fecha_hora, monto_total_centimos) VALUES (1, '2026-11-03 10:00', 150)").run();
  db.prepare('INSERT INTO linea_venta (venta_id, lote_id, cantidad, precio_unitario_centimos) VALUES (1, 2, 3, 50)').run();
  res = await buscar();
  assert.strictEqual(res.body.find((p) => p.id === 1).stock_total, 12);
});

test('un producto sin lotes aparece con stock 0', async () => {
  const res = await buscar();
  const amoxicilina = res.body.find((p) => p.id === 3);
  assert.strictEqual(amoxicilina.stock_total, 0);
  assert.deepStrictEqual(amoxicilina.lotes, []);
});

test('los lotes vienen del vencimiento más próximo al más lejano (CA2)', async () => {
  const res = await buscar();
  const paracetamol = res.body.find((p) => p.id === 1);
  assert.deepStrictEqual(paracetamol.lotes.map((l) => l.numero_lote), ['L-A', 'L-B']);
  assert.deepStrictEqual(paracetamol.lotes[0], { numero_lote: 'L-A', fecha_vencimiento: '2027-01-15', cantidad: 5 });
});

test('busca por nombre sin distinguir mayúsculas (CA3)', async () => {
  const res = await buscar('?nombre=PARACE');
  assert.deepStrictEqual(nombres(res), ['Paracetamol 500 mg']);
});

test('filtra por categoría y por tipo (CA3)', async () => {
  assert.deepStrictEqual(nombres(await buscar('?categoria=Antibiótico')), ['Amoxicilina 500 mg']);
  assert.deepStrictEqual(nombres(await buscar('?tipo=comercial')), ['Panadol 500 mg']);
  assert.deepStrictEqual(nombres(await buscar('?categoria=Analgésico&tipo=generico')), ['Paracetamol 500 mg']);
});

test('sin coincidencias devuelve una lista vacía', async () => {
  const res = await buscar('?nombre=ibuprofeno');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, []);
});
