'use strict';

const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app/server');
const { abrir } = require('../app/db');

let db;
beforeEach(() => {
  db = abrir(':memory:');
  app.locals.db = db;
  db.exec(`
    INSERT INTO producto (id, nombre, accion_terapeutica, precio_centimos)
    VALUES (1, 'Paracetamol', 'Analgésico', 50), (2, 'Panadol', 'Analgésico', 120);
    INSERT INTO lote (id, producto_id, numero_lote, fecha_vencimiento, cantidad_recibida)
    VALUES (1, 1, 'A', '2027-03-31', 4), (2, 1, 'B', '2027-11-30', 100),
           (3, 2, 'C', '2027-12-31', 10);
  `);
});
afterEach(() => db.close());

const vender = (lineas) => request(app).post('/api/ventas').send({ lineas });
const linea = (producto_id, cantidad) => ({ producto_id, cantidad });
const fechaLocal = (fecha) => {
  const dos = (valor) => String(valor).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())} ` +
    `${dos(fecha.getHours())}:${dos(fecha.getMinutes())}:${dos(fecha.getSeconds())}`;
};
function sinVentas() {
  assert.equal(db.prepare('SELECT COUNT(*) n FROM venta').get().n, 0);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM linea_venta').get().n, 0);
}

test('responde 201 y guarda fecha y hora local, cantidades y precio (HU-01 CA1)', async () => {
  const antes = fechaLocal(new Date());
  const res = await vender([linea(1, 3)]);
  const despues = fechaLocal(new Date());
  assert.equal(res.status, 201);
  assert.match(res.body.fecha_hora, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  assert.ok(res.body.fecha_hora >= antes && res.body.fecha_hora <= despues);
  assert.equal(res.body.monto_total_centimos, 150);
  assert.deepEqual(res.body.lineas, [
    { producto_id: 1, lote_id: 1, numero_lote: 'A', cantidad: 3, precio_unitario_centimos: 50 },
  ]);
  assert.deepEqual(db.prepare('SELECT * FROM venta').get(), {
    id: res.body.id, fecha_hora: res.body.fecha_hora, monto_total_centimos: 150,
  });
  assert.deepEqual(db.prepare('SELECT * FROM linea_venta').get(), {
    id: 1, venta_id: res.body.id, lote_id: 1, cantidad: 3, precio_unitario_centimos: 50,
  });
});

test('la consulta de stock descuenta las unidades vendidas', async () => {
  assert.equal((await vender([linea(1, 6)])).status, 201);
  const res = await request(app).get('/api/stock');
  assert.equal(res.status, 200);
  const producto = res.body.find((p) => p.id === 1);
  assert.equal(producto.stock_total, 98);
  assert.deepEqual(producto.lotes.map((l) => l.cantidad), [0, 98]);
});

test('10 unidades a 50 céntimos y 4 a 120 suman 980 (HU-01 CA3)', async () => {
  const res = await vender([linea(1, 10), linea(2, 4)]);
  assert.equal(res.status, 201);
  assert.equal(res.body.monto_total_centimos, 980);
  assert.equal(db.prepare('SELECT monto_total_centimos FROM venta').get().monto_total_centimos, 980);
});

test('un producto repartido entre dos lotes guarda dos líneas (HU-02 CA1)', async () => {
  const res = await vender([linea(1, 6)]);
  assert.equal(res.status, 201);
  assert.deepEqual(db.prepare('SELECT lote_id, cantidad FROM linea_venta ORDER BY id').all(), [
    { lote_id: 1, cantidad: 4 }, { lote_id: 2, cantidad: 2 },
  ]);
});

test('suma líneas repetidas y acepta números enviados como texto', async () => {
  const res = await vender([linea(1, '2'), linea('1', 4)]);
  assert.equal(res.status, 201);
  assert.equal(res.body.monto_total_centimos, 300);
  assert.deepEqual(res.body.lineas.map((l) => l.cantidad), [4, 2]);
});

test('calcula precios en el servidor y conserva el precio de ventas anteriores', async () => {
  const res = await request(app).post('/api/ventas').send({
    lineas: [{ ...linea(1, 1), precio_unitario_centimos: 1 }], monto_total_centimos: 1,
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.monto_total_centimos, 50);
  db.prepare('UPDATE producto SET precio_centimos = 75 WHERE id = 1').run();
  const siguiente = await vender([linea(1, 1)]);
  assert.equal(siguiente.status, 201);
  assert.equal(siguiente.body.monto_total_centimos, 75);
  assert.equal(db.prepare('SELECT precio_unitario_centimos FROM linea_venta WHERE venta_id = ?')
    .get(res.body.id).precio_unitario_centimos, 50);
});

test('lineas ausente, vacía o de otro tipo responde 400 sin guardar', async () => {
  for (const cuerpo of [{}, { lineas: [] }, { lineas: null }, { lineas: 'x' }, { lineas: {} }]) {
    const res = await request(app).post('/api/ventas').send(cuerpo);
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: 'Agregue al menos un producto a la venta.', campo: 'lineas' });
    sinVentas();
  }
});

test('cantidad inválida responde 400 con campo sin guardar ninguna línea', async () => {
  for (const cantidad of [0, -1, 2.5, '2.5', '', ' ', 'x', null, true, {}, []]) {
    const res = await vender([linea(2, 1), linea(1, cantidad)]);
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      error: 'La cantidad debe ser mayor que cero.', campo: 'cantidad', producto_id: 1,
    });
    sinVentas();
  }
  assert.equal((await vender([{ producto_id: 1 }])).status, 400);
  sinVentas();
});

test('producto inexistente responde 400 y no guarda la línea válida anterior', async () => {
  const res = await vender([linea(1, 1), linea(99, 1)]);
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, {
    error: 'El producto indicado no existe.', campo: 'producto_id', producto_id: 99,
  });
  sinVentas();
});

test('una línea nula o sin producto se rechaza sin error interno ni escrituras', async () => {
  for (const datos of [null, {}, { cantidad: 1 }, { producto_id: {}, cantidad: 1 }]) {
    const res = await vender([datos]);
    assert.equal(res.status, 400);
    assert.equal(res.body.campo, 'producto_id');
    sinVentas();
  }
});

test('stock insuficiente responde 409 con producto y disponible sin guardar una venta parcial', async () => {
  const res = await vender([linea(2, 1), linea(1, 105)]);
  assert.equal(res.status, 409);
  assert.deepEqual(res.body, {
    error: 'Solo hay 104 unidades disponibles de Paracetamol.',
    campo: 'cantidad', producto_id: 1, disponible: 104,
  });
  sinVentas();
});

test('las cantidades repetidas se acumulan antes de comprobar el stock', async () => {
  const res = await vender([linea(1, 100), linea(1, 5)]);
  assert.equal(res.status, 409);
  assert.deepEqual(res.body, {
    error: 'Solo hay 104 unidades disponibles de Paracetamol.',
    campo: 'cantidad', producto_id: 1, disponible: 104,
  });
  sinVentas();
});

test('con 4 unidades, vender 5 informa el stock restante después de ventas previas (HU-01 CA2)', async () => {
  assert.equal((await vender([linea(1, 100)])).status, 201);
  const ventasAntes = db.prepare('SELECT * FROM venta ORDER BY id').all();
  const lineasAntes = db.prepare('SELECT * FROM linea_venta ORDER BY id').all();
  const stockAntes = await request(app).get('/api/stock');
  assert.equal(stockAntes.status, 200);

  const res = await vender([linea(2, 1), linea(1, 5)]);
  assert.equal(res.status, 409);
  assert.deepEqual(res.body, {
    error: 'Solo hay 4 unidades disponibles de Paracetamol.',
    campo: 'cantidad', producto_id: 1, disponible: 4,
  });
  assert.deepEqual(db.prepare('SELECT * FROM venta ORDER BY id').all(), ventasAntes);
  assert.deepEqual(db.prepare('SELECT * FROM linea_venta ORDER BY id').all(), lineasAntes);
  const stockDespues = await request(app).get('/api/stock');
  assert.equal(stockDespues.status, 200);
  assert.deepEqual(stockDespues.body, stockAntes.body);
});

test('un producto sin lotes responde 409 con disponible cero', async () => {
  db.prepare(`INSERT INTO producto (id, nombre, accion_terapeutica, precio_centimos)
    VALUES (3, 'Amoxicilina', 'Antibiótico', 100)`).run();
  const res = await vender([linea(3, 1)]);
  assert.equal(res.status, 409);
  assert.deepEqual(res.body, {
    error: 'Solo hay 0 unidades disponibles de Amoxicilina.',
    campo: 'cantidad', producto_id: 3, disponible: 0,
  });
  sinVentas();
});

test('un producto con todos sus lotes agotados responde 409 sin modificar las ventas', async () => {
  assert.equal((await vender([linea(1, 104)])).status, 201);
  const ventasAntes = db.prepare('SELECT * FROM venta ORDER BY id').all();
  const lineasAntes = db.prepare('SELECT * FROM linea_venta ORDER BY id').all();
  const res = await vender([linea(1, 1)]);
  assert.equal(res.status, 409);
  assert.deepEqual(res.body, {
    error: 'Solo hay 0 unidades disponibles de Paracetamol.',
    campo: 'cantidad', producto_id: 1, disponible: 0,
  });
  assert.deepEqual(db.prepare('SELECT * FROM venta ORDER BY id').all(), ventasAntes);
  assert.deepEqual(db.prepare('SELECT * FROM linea_venta ORDER BY id').all(), lineasAntes);
});

test('permite vender exactamente el stock disponible y lo deja en cero', async () => {
  const res = await vender([linea(1, 104)]);
  assert.equal(res.status, 201);
  const stock = await request(app).get('/api/stock');
  assert.equal(stock.status, 200);
  assert.equal(stock.body.find((p) => p.id === 1).stock_total, 0);
});

test('un fallo de inserción revierte la cabecera y las líneas ya insertadas', async () => {
  db.exec(`CREATE TRIGGER fallo_prueba BEFORE INSERT ON linea_venta
    WHEN NEW.lote_id = 2 BEGIN SELECT RAISE(ABORT, 'fallo de prueba'); END;`);
  // Captura solo en esta prueba el error provocado por el trigger.
  const servidor = require('express')();
  servidor.use(app);
  servidor.use((err, req, res, next) => res.sendStatus(500));
  const res = await request(servidor).post('/api/ventas').send({ lineas: [linea(1, 6)] });
  assert.equal(res.status, 500);
  sinVentas();
});
