const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app/server');
const { abrir } = require('../app/db');

// API de productos: alta rápida y listado (#37, HU-04 CA2)

beforeEach(() => {
  app.locals.db = abrir(':memory:');
});

const valido = { nombre: 'Paracetamol 500 mg', accion_terapeutica: 'Analgésico', precio: '0.50', tipo: 'generico' };

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
  assert.strictEqual(res.body.tipo, 'generico');

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

test('sin tipo: responde 400 con campo tipo', () => rechaza({ tipo: undefined }, 'tipo'));
test('tipo vacío: responde 400 con campo tipo', () => rechaza({ tipo: '  ' }, 'tipo'));

test('con tipo genérico o comercial: responde 201', async () => {
  for (const tipo of ['generico', 'comercial']) {
    const res = await request(app)
      .post('/api/productos')
      .send({ ...valido, nombre: 'Prueba ' + tipo, tipo });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.tipo, tipo);
  }
});

// Edición de producto (#105, HU-06 CA3)

async function crear(datos = valido) {
  return (await request(app).post('/api/productos').send(datos)).body;
}

test('edita los cuatro campos y el cambio se ve en el listado', async () => {
  const { id } = await crear();
  const cambios = { nombre: ' Paracetamol 1 g ', accion_terapeutica: 'Antipirético', tipo: 'comercial', precio: '0,65' };

  const res = await request(app).put(`/api/productos/${id}`).send(cambios);

  assert.strictEqual(res.status, 200);
  const esperado = { id, nombre: 'Paracetamol 1 g', accion_terapeutica: 'Antipirético', tipo: 'comercial', precio_centimos: 65 };
  assert.deepStrictEqual(res.body, esperado);
  const lista = await request(app).get('/api/productos');
  assert.deepStrictEqual(lista.body, [esperado]);
});

test('un dato inválido al editar responde 400 con su campo y el producto no cambia', async () => {
  const original = await crear();
  const casos = [
    [{ nombre: '' }, 'nombre'],
    [{ accion_terapeutica: '  ' }, 'accion_terapeutica'],
    [{ precio: '-1' }, 'precio'],
    [{ precio: 'gratis' }, 'precio'],
    [{ tipo: undefined }, 'tipo'],
    [{ tipo: 'otro' }, 'tipo'],
  ];

  for (const [cambios, campo] of casos) {
    const res = await request(app).put(`/api/productos/${original.id}`).send({ ...valido, ...cambios });
    assert.strictEqual(res.status, 400, campo);
    assert.strictEqual(res.body.campo, campo);
    assert.ok(res.body.error);
  }
  const lista = await request(app).get('/api/productos');
  assert.deepStrictEqual(lista.body, [original]);
});

test('editar un producto que no existe o con id no numérico responde 404', async () => {
  await crear();
  for (const id of ['999', 'abc', '1.5', '-1']) {
    const res = await request(app).put(`/api/productos/${id}`).send(valido);
    assert.strictEqual(res.status, 404, id);
    assert.deepStrictEqual(res.body, { error: 'El producto no existe.' });
  }
  assert.strictEqual(productos(), 1, 'no se crea ningún producto nuevo');
});

test('el nuevo precio rige solo para ventas futuras (HU-06 CA3)', async () => {
  const { id } = await crear();
  app.locals.db.prepare(`INSERT INTO lote (producto_id, numero_lote, fecha_vencimiento, cantidad_recibida)
    VALUES (?, 'L-2309', '2027-03-31', 100)`).run(id);
  const vender = () => request(app).post('/api/ventas').send({ lineas: [{ producto_id: id, cantidad: 10 }] });

  const anterior = await vender();
  assert.strictEqual(anterior.body.monto_total_centimos, 500);

  const edicion = await request(app).put(`/api/productos/${id}`).send({ ...valido, precio: '0.80' });
  assert.strictEqual(edicion.body.precio_centimos, 80);

  const nueva = await vender();
  assert.strictEqual(nueva.body.monto_total_centimos, 800, 'la venta nueva usa el precio nuevo');

  const guardadas = app.locals.db.prepare(`SELECT v.id, v.monto_total_centimos, lv.precio_unitario_centimos
    FROM venta v JOIN linea_venta lv ON lv.venta_id = v.id ORDER BY v.id`).all();
  assert.deepStrictEqual(guardadas.map((v) => [v.monto_total_centimos, v.precio_unitario_centimos]),
    [[500, 50], [800, 80]], 'la venta anterior conserva su monto y su precio');
});
