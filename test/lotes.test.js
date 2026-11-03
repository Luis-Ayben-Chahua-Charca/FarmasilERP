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

const lote = { producto_id: 1, numero_lote: 'L-2309', fecha_vencimiento: '2027-03-01', cantidad_recibida: 20 };

test('rechaza con 409 el mismo lote en el mismo producto y el stock no cambia (HU-05 CA1)', async () => {
  await request(app).post('/api/lotes').send(lote).expect(201);
  const res = await request(app).post('/api/lotes').send({ ...lote, cantidad_recibida: 7 });
  assert.strictEqual(res.status, 409);
  assert.strictEqual(res.body.error, 'El lote L-2309 ya está registrado para este producto.');
  assert.strictEqual(res.body.campo, 'numero_lote');
  assert.strictEqual(stock(), 20);
});

test('acepta el mismo número de lote en otro producto (HU-05 CA2)', async () => {
  app.locals.db.prepare("INSERT INTO producto (id, nombre, accion_terapeutica, precio_centimos) VALUES (2, 'Ibuprofeno 400 mg', 'Antiinflamatorio', 120)").run();
  await request(app).post('/api/lotes').send(lote).expect(201);
  const res = await request(app).post('/api/lotes').send({ ...lote, producto_id: 2 });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.producto_id, 2);
});
