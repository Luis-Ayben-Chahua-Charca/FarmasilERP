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

// Ingresos por periodo con desglose mensual (#112, HU-09 CA1 y CA3)

const ingresos = (query) => request(app).get('/api/reportes/ingresos').query(query);

test('suma las ventas del periodo con una fila por mes, incluido un mes sin ventas (HU-09 CA1)', async () => {
  venta('2026-10-20 10:00:00', [[2, 10, 50]]);
  venta('2026-12-01 09:00:00', [[3, 2, 120]]);
  venta('2026-12-02 18:00:00', [[2, 4, 50], [3, 1, 120]]);

  const res = await ingresos({ desde: '2026-10-15', hasta: '2026-12-03' });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    desde: '2026-10-15',
    hasta: '2026-12-03',
    numero_ventas: 3,
    monto_total_centimos: 500 + 240 + 320,
    meses: [
      { mes: '2026-10', numero_ventas: 1, monto_total_centimos: 500 },
      { mes: '2026-11', numero_ventas: 0, monto_total_centimos: 0 },
      { mes: '2026-12', numero_ventas: 2, monto_total_centimos: 560 },
    ],
  });
});

test('las fechas son inclusivas: entra el día desde y el día hasta completos', async () => {
  venta('2026-11-09 23:59:59', [[2, 1, 50]]);
  venta('2026-11-10 00:00:00', [[2, 2, 50]]);
  venta('2026-11-20 23:59:59', [[2, 3, 50]]);
  venta('2026-11-21 00:00:00', [[2, 4, 50]]);

  const res = await ingresos({ desde: '2026-11-10', hasta: '2026-11-20' });

  assert.equal(res.body.numero_ventas, 2);
  assert.equal(res.body.monto_total_centimos, 250);
});

test('el total coincide con la suma de los meses y con la suma de los reportes diarios', async () => {
  const dias = ['2026-11-28', '2026-11-30', '2026-12-01', '2026-12-03'];
  venta(`${dias[0]} 10:00:00`, [[2, 3, 50]]);
  venta(`${dias[1]} 11:00:00`, [[1, 4, 50], [2, 2, 50]]);
  venta(`${dias[2]} 12:00:00`, [[3, 5, 120]]);
  venta(`${dias[3]} 13:00:00`, [[4, 7, 30]]);
  venta(`${dias[3]} 14:00:00`, [[2, 1, 50]]);

  const periodo = (await ingresos({ desde: '2026-11-28', hasta: '2026-12-03' })).body;
  let sumaDiarios = 0;
  for (const dia of dias) sumaDiarios += (await diario(dia)).body.monto_total_centimos;

  assert.equal(periodo.monto_total_centimos, periodo.meses.reduce((t, m) => t + m.monto_total_centimos, 0));
  assert.equal(periodo.monto_total_centimos, sumaDiarios);
  assert.equal(periodo.numero_ventas, 5);
});

test('un rango sin ventas devuelve ceros y sus meses en 0 (HU-09 CA3)', async () => {
  venta('2026-09-15 10:00:00', [[2, 5, 50]]);

  const res = await ingresos({ desde: '2026-11-15', hasta: '2027-01-10' });

  assert.equal(res.status, 200);
  assert.equal(res.body.numero_ventas, 0);
  assert.equal(res.body.monto_total_centimos, 0);
  assert.deepEqual(res.body.meses.map((m) => [m.mes, m.numero_ventas, m.monto_total_centimos]),
    [['2026-11', 0, 0], ['2026-12', 0, 0], ['2027-01', 0, 0]]);
});

test('un periodo dentro de un solo mes trae una sola fila', async () => {
  venta('2026-11-25 10:00:00', [[2, 2, 50]]);

  const res = await ingresos({ desde: '2026-11-25', hasta: '2026-11-25' });

  assert.deepEqual(res.body.meses, [{ mes: '2026-11', numero_ventas: 1, monto_total_centimos: 100 }]);
});

test('falta desde o hasta: 400 con el campo que falta', async () => {
  const casos = [[{ hasta: '2026-11-30' }, 'desde'], [{ desde: '2026-11-01' }, 'hasta'],
    [{ desde: '', hasta: '2026-11-30' }, 'desde'], [{}, 'desde']];
  for (const [query, campo] of casos) {
    const res = await ingresos(query);
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: 'Elija la fecha de inicio y la de fin.', campo });
  }
});

test('una fecha con otro formato o que no existe: 400 con su campo', async () => {
  const casos = [[{ desde: '01/11/2026', hasta: '2026-11-30' }, 'desde'],
    [{ desde: '2026-11-01', hasta: '2026-02-30' }, 'hasta'], [{ desde: '2026-11', hasta: '2026-11-30' }, 'desde']];
  for (const [query, campo] of casos) {
    const res = await ingresos(query);
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: 'La fecha debe tener el formato AAAA-MM-DD.', campo });
  }
});

test('desde posterior a hasta: 400 con campo desde', async () => {
  const res = await ingresos({ desde: '2026-12-01', hasta: '2026-11-30' });

  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'La fecha de inicio no puede ser posterior a la de fin.', campo: 'desde' });
});

// Productos más vendidos por periodo (#113, HU-09 CA2 y CA3)

const masVendidos = (query) => request(app).get('/api/reportes/mas-vendidos').query(query);

test('ordena los productos por unidades, sumando todos sus lotes (HU-09 CA2)', async () => {
  venta('2026-11-10 10:00:00', [[1, 4, 50], [2, 2, 50], [3, 3, 120]]);
  venta('2026-11-20 10:00:00', [[2, 10, 50], [4, 5, 30]]);

  const res = await masVendidos({ desde: '2026-11-01', hasta: '2026-11-30' });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    desde: '2026-11-01',
    hasta: '2026-11-30',
    productos: [
      { producto_id: 1, nombre: 'Paracetamol 500 mg', unidades: 16, monto_centimos: 800 },
      { producto_id: 3, nombre: 'Ácido fólico 1 mg', unidades: 5, monto_centimos: 150 },
      { producto_id: 2, nombre: 'Ibuprofeno 400 mg', unidades: 3, monto_centimos: 360 },
    ],
  });
});

test('en empate de unidades ordena por nombre en español', async () => {
  venta('2026-11-10 10:00:00', [[2, 4, 50], [3, 4, 120], [4, 4, 30]]);

  const res = await masVendidos({ desde: '2026-11-10', hasta: '2026-11-10' });

  assert.deepEqual(res.body.productos.map((p) => p.nombre),
    ['Ácido fólico 1 mg', 'Ibuprofeno 400 mg', 'Paracetamol 500 mg']);
});

test('usa el precio guardado de cada venta y respeta las fechas inclusivas', async () => {
  venta('2026-10-31 23:59:59', [[2, 50, 50]]);
  venta('2026-11-01 00:00:00', [[2, 2, 50]]);
  db.prepare('UPDATE producto SET precio_centimos = 80 WHERE id = 1').run();
  venta('2026-11-30 23:59:59', [[2, 3, 80]]);
  venta('2026-12-01 00:00:00', [[2, 70, 80]]);

  const res = await masVendidos({ desde: '2026-11-01', hasta: '2026-11-30' });

  assert.deepEqual(res.body.productos,
    [{ producto_id: 1, nombre: 'Paracetamol 500 mg', unidades: 5, monto_centimos: 2 * 50 + 3 * 80 }]);
});

test('no limita la lista: devuelve todos los productos vendidos', async () => {
  const insertar = db.prepare(`INSERT INTO producto (id, nombre, accion_terapeutica, tipo, precio_centimos)
    VALUES (?, ?, 'Prueba', 'generico', 10)`);
  const lote = db.prepare(`INSERT INTO lote (id, producto_id, numero_lote, fecha_vencimiento, cantidad_recibida)
    VALUES (?, ?, ?, '2028-01-01', 100)`);
  const lineas = [];
  for (let i = 0; i < 12; i++) {
    insertar.run(100 + i, `Producto ${String(i).padStart(2, '0')}`);
    lote.run(100 + i, 100 + i, `L-${i}`);
    lineas.push([100 + i, i + 1, 10]);
  }
  venta('2026-11-15 10:00:00', lineas);

  const res = await masVendidos({ desde: '2026-11-15', hasta: '2026-11-15' });

  assert.equal(res.body.productos.length, 12);
  assert.equal(res.body.productos[0].nombre, 'Producto 11');
});

test('un rango sin ventas devuelve productos vacío (HU-09 CA3)', async () => {
  venta('2026-09-15 10:00:00', [[2, 5, 50]]);

  const res = await masVendidos({ desde: '2026-11-01', hasta: '2026-11-30' });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { desde: '2026-11-01', hasta: '2026-11-30', productos: [] });
});

test('valida el periodo igual que los ingresos', async () => {
  const casos = [
    [{ hasta: '2026-11-30' }, 'Elija la fecha de inicio y la de fin.', 'desde'],
    [{ desde: '2026-11-01', hasta: '30/11/2026' }, 'La fecha debe tener el formato AAAA-MM-DD.', 'hasta'],
    [{ desde: '2026-12-01', hasta: '2026-11-30' }, 'La fecha de inicio no puede ser posterior a la de fin.', 'desde'],
  ];
  for (const [query, error, campo] of casos) {
    const res = await masVendidos(query);
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error, campo });
  }
});
