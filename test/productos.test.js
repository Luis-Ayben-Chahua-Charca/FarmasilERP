const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app/server');
const { abrir } = require('../app/db');

// API de productos: alta rápida y listado (#37, HU-04 CA2)

beforeEach(() => {
  app.locals.db = abrir(':memory:');
});

const valido = { nombre: 'Paracetamol 500 mg', accion_terapeutica: 'Analgésico', precio: '0.50' };

const productos = () => app.locals.db.prepare('SELECT COUNT(*) n FROM producto').get().n;

async function rechaza(cambios, campo) {
  const res = await request(app).post('/api/productos').send({ ...valido, ...cambios });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.campo, campo);
  assert.ok(res.body.error);
  assert.strictEqual(productos(), 0, 'un dato inválido no debe llegar a la base');
}

test('crea un producto con los tres campos obligatorios y aparece en el listado', async () => {
  const res = await request(app).post('/api/productos').send(valido);
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.nombre, 'Paracetamol 500 mg');
  assert.strictEqual(res.body.precio_centimos, 50, 'el precio en soles se guarda en céntimos');
  assert.strictEqual(res.body.tipo, null);

  const lista = await request(app).get('/api/productos');
  assert.strictEqual(lista.status, 200);
  assert.deepStrictEqual(lista.body.map((p) => p.id), [res.body.id]);
});

test('acepta el tipo y el precio con coma decimal', async () => {
  const res = await request(app).post('/api/productos')
    .send({ ...valido, precio: '12,30', tipo: 'comercial' });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.precio_centimos, 1230);
  assert.strictEqual(res.body.tipo, 'comercial');
});

test('el listado viene ordenado por nombre', async () => {
  for (const nombre of ['Omeprazol 20 mg', 'amoxicilina 500 mg', 'Ibuprofeno 400 mg']) {
    await request(app).post('/api/productos').send({ ...valido, nombre });
  }
  const res = await request(app).get('/api/productos');
  assert.deepStrictEqual(res.body.map((p) => p.nombre),
    ['amoxicilina 500 mg', 'Ibuprofeno 400 mg', 'Omeprazol 20 mg']);
});

test('falta un campo obligatorio: responde 400 indicando el campo', async () => {
  await rechaza({ nombre: undefined }, 'nombre');
  await rechaza({ nombre: '   ' }, 'nombre');
  await rechaza({ accion_terapeutica: '' }, 'accion_terapeutica');
  await rechaza({ precio: undefined }, 'precio');
});

test('precio negativo o que no es número: responde 400', async () => {
  await rechaza({ precio: -1 }, 'precio');
  await rechaza({ precio: 'abc' }, 'precio');
});

test('precio absurdo: responde 400 y no llega a la base', async () => {
  await rechaza({ precio: 1e20 }, 'precio');
  await rechaza({ precio: '1e308' }, 'precio');
  await rechaza({ precio: '10000.01' }, 'precio');
});

test('nombre o acción terapéutica que no son texto: responde 400', async () => {
  await rechaza({ nombre: { a: 1 } }, 'nombre');
  await rechaza({ nombre: 123 }, 'nombre');
  await rechaza({ accion_terapeutica: ['Analgésico'] }, 'accion_terapeutica');
});

test('tipo distinto de genérico o comercial: responde 400', () => rechaza({ tipo: 'otro' }, 'tipo'));
