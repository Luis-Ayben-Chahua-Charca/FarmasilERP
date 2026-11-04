const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app/server');
const { abrir } = require('../app/db');

// Validaciones del servidor para el ingreso de lote (#38, HU-04 CA3)

beforeEach(() => {
  app.locals.db = abrir(':memory:');
  app.locals.db.prepare("INSERT INTO producto (id, nombre, accion_terapeutica, precio_centimos) VALUES (1, 'Paracetamol 500 mg', 'Analgésico', 50)").run();
});

const valido = { producto_id: 1, numero_lote: 'L-2309', fecha_vencimiento: '2027-03-01', cantidad_recibida: 20 };

const lotes = () => app.locals.db.prepare('SELECT COUNT(*) n FROM lote').get().n;

async function rechaza(cambios, campo, mensaje) {
  const res = await request(app).post('/api/lotes').send({ ...valido, ...cambios });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.campo, campo);
  if (mensaje) assert.strictEqual(res.body.error, mensaje);
  assert.strictEqual(lotes(), 0, 'un dato inválido no debe llegar a la base');
}

test('falta el producto', () => rechaza({ producto_id: undefined }, 'producto_id', 'Elija un producto.'));

test('falta el número de lote o está en blanco', async () => {
  await rechaza({ numero_lote: undefined }, 'numero_lote', 'Ingrese el número de lote.');
  await rechaza({ numero_lote: '   ' }, 'numero_lote');
});

test('falta la fecha de vencimiento', () =>
  rechaza({ fecha_vencimiento: '' }, 'fecha_vencimiento', 'Ingrese la fecha de vencimiento.'));

test('falta la cantidad', () => rechaza({ cantidad_recibida: undefined }, 'cantidad_recibida', 'Ingrese la cantidad.'));

test('cantidad cero o negativa', async () => {
  await rechaza({ cantidad_recibida: 0 }, 'cantidad_recibida', 'La cantidad debe ser mayor que cero.');
  await rechaza({ cantidad_recibida: -5 }, 'cantidad_recibida');
});

test('cantidad que no es un entero', async () => {
  await rechaza({ cantidad_recibida: 2.5 }, 'cantidad_recibida');
  await rechaza({ cantidad_recibida: 'diez' }, 'cantidad_recibida');
});

test('fecha con formato distinto de AAAA-MM-DD', async () => {
  await rechaza({ fecha_vencimiento: '01/03/2027' }, 'fecha_vencimiento', 'La fecha debe tener el formato AAAA-MM-DD.');
  await rechaza({ fecha_vencimiento: '2027-3-1' }, 'fecha_vencimiento');
});

test('fecha que no existe', () => rechaza({ fecha_vencimiento: '2027-02-30' }, 'fecha_vencimiento'));

test('producto que no existe', () => rechaza({ producto_id: 999 }, 'producto_id', 'El producto indicado no existe.'));

test('acepta números enviados como texto desde el formulario', async () => {
  const res = await request(app).post('/api/lotes')
    .send({ ...valido, producto_id: '1', cantidad_recibida: '20', numero_lote: ' L-2309 ' });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.cantidad_recibida, 20);
  assert.strictEqual(res.body.numero_lote, 'L-2309');
});
