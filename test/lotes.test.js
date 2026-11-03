const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app/server');
const { abrir } = require('../app/db');

beforeEach(() => {
  app.locals.db = abrir(':memory:');
  app.locals.db.prepare("INSERT INTO producto (id, nombre, accion_terapeutica, precio_centimos) VALUES (1, 'Paracetamol 500 mg', 'Analgésico', 50)").run();
});

const stock = () => app.locals.db
  .prepare('SELECT COALESCE(SUM(cantidad_recibida), 0) n FROM lote WHERE producto_id = 1').get().n;

test('registra un lote válido y aumenta el stock (HU-04 CA1)', async () => {
  const res = await request(app).post('/api/lotes')
    .send({ producto_id: 1, numero_lote: 'L-2309', fecha_vencimiento: '2027-03-01', cantidad_recibida: 20 });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.numero_lote, 'L-2309');
  assert.strictEqual(res.body.cantidad_recibida, 20);
  assert.strictEqual(stock(), 20);
});

test('responde 400 con mensaje en español si faltan datos', async () => {
  const res = await request(app).post('/api/lotes').send({ producto_id: 1 });
  assert.strictEqual(res.status, 400);
  assert.ok(res.body.error);
  assert.strictEqual(stock(), 0);
});

test('responde 400 en JSON si el producto no existe', async () => {
  const res = await request(app).post('/api/lotes')
    .send({ producto_id: 999, numero_lote: 'L-001', fecha_vencimiento: '2027-03-01', cantidad_recibida: 5 });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error, 'El producto indicado no existe.');
});
