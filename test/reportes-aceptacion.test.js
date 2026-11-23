'use strict';

// Pruebas de aceptación de las APIs de reportes (#115, HU-03 y HU-09).
// Usan la base «reportes» de docs/pruebas/casos-sprint-4.md: cada venta se registra
// con POST /api/ventas y después se fija su fecha y hora para repartirlas en
// distintos días y meses.

const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app/server');
const { abrir } = require('../app/db');

let db;
beforeEach(async () => {
  db = abrir(':memory:');
  app.locals.db = db;
  db.exec(`
    INSERT INTO producto (id, nombre, accion_terapeutica, tipo, precio_centimos) VALUES
      (1, 'Paracetamol 500 mg', 'Analgésico', 'generico', 50),
      (2, 'Amoxicilina 500 mg', 'Antibiótico', 'generico', 120),
      (3, 'Ibuprofeno 400 mg', 'Antiinflamatorio', 'comercial', 80);
    INSERT INTO lote (id, producto_id, numero_lote, fecha_vencimiento, cantidad_recibida) VALUES
      (1, 1, 'L-2309', '2027-03-31', 24),
      (2, 1, 'L-2411', '2027-11-30', 100),
      (3, 2, 'L-3001', '2027-06-30', 60),
      (4, 3, 'L-5001', '2027-12-31', 20);
  `);
  // Ventas en el orden de casos-sprint-4.md
  await vender([{ producto_id: 1, cantidad: 20 }], '2026-10-20 10:05:00');
  await vender([{ producto_id: 3, cantidad: 6 }], '2026-11-10 11:30:00');
  await vender([{ producto_id: 1, cantidad: 10 }], '2026-11-24 09:12:00');
  await vender([{ producto_id: 2, cantidad: 4 }, { producto_id: 3, cantidad: 2 }], '2026-11-24 15:40:00');
  await vender([{ producto_id: 2, cantidad: 5 }], '2026-12-01 16:20:00');
});
afterEach(() => db.close());

async function vender(lineas, fechaHora) {
  const res = await request(app).post('/api/ventas').send({ lineas });
  assert.equal(res.status, 201);
  if (fechaHora) {
    db.prepare('UPDATE venta SET fecha_hora = ? WHERE id = ?').run(fechaHora, res.body.id);
  }
  return res.body;
}

const diario = (fecha) => request(app).get('/api/reportes/diario?fecha=' + fecha);
const ingresos = (desde, hasta) =>
  request(app).get(`/api/reportes/ingresos?desde=${desde}&hasta=${hasta}`);
const masVendidos = (desde, hasta) =>
  request(app).get(`/api/reportes/mas-vendidos?desde=${desde}&hasta=${hasta}`);

// Todas las fechas AAAA-MM-DD entre dos días, ambos incluidos
function dias(desde, hasta) {
  const lista = [];
  const fin = Date.parse(hasta + 'T00:00:00Z');
  for (let t = Date.parse(desde + 'T00:00:00Z'); t <= fin; t += 86400000) {
    lista.push(new Date(t).toISOString().slice(0, 10));
  }
  return lista;
}

test('el reporte de un día con ventas trae totales, productos y detalle (HU-03 CA1)', async () => {
  const res = await diario('2026-11-24');
  assert.equal(res.status, 200);
  assert.equal(res.body.fecha, '2026-11-24');
  assert.equal(res.body.numero_ventas, 2);
  assert.equal(res.body.unidades_vendidas, 16);
  assert.equal(res.body.monto_total_centimos, 1140);

  // Por nombre; el Paracetamol salió de dos lotes pero va en una sola fila
  assert.deepEqual(
    res.body.productos.map((p) => [p.nombre, p.unidades, p.monto_centimos]),
    [['Amoxicilina 500 mg', 4, 480], ['Ibuprofeno 400 mg', 2, 160], ['Paracetamol 500 mg', 10, 500]]
  );

  // Ventas de la más temprana a la más tarde, con sus líneas
  assert.deepEqual(
    res.body.ventas.map((v) => [v.hora, v.monto_total_centimos]),
    [['09:12', 500], ['15:40', 640]]
  );
  assert.deepEqual(
    res.body.ventas[0].lineas.map((l) => [l.nombre, l.cantidad, l.precio_unitario_centimos]),
    [['Paracetamol 500 mg', 10, 50]]
  );
  assert.deepEqual(
    res.body.ventas[1].lineas.map((l) => [l.nombre, l.cantidad, l.precio_unitario_centimos]).sort(),
    [['Amoxicilina 500 mg', 4, 120], ['Ibuprofeno 400 mg', 2, 80]]
  );
});

test('un día sin ventas responde 200 con ceros y listas vacías (HU-03 CA2)', async () => {
  const res = await diario('2026-11-23');
  assert.equal(res.status, 200);
  assert.equal(res.body.numero_ventas, 0);
  assert.equal(res.body.unidades_vendidas, 0);
  assert.equal(res.body.monto_total_centimos, 0);
  assert.deepEqual(res.body.productos, []);
  assert.deepEqual(res.body.ventas, []);
});

test('la suma de los reportes diarios es igual al ingreso del periodo y a la suma de sus meses (HU-09 CA1)', async () => {
  const periodo = await ingresos('2026-10-15', '2026-12-03');
  assert.equal(periodo.status, 200);
  assert.equal(periodo.body.numero_ventas, 5);
  assert.equal(periodo.body.monto_total_centimos, 3220);
  assert.deepEqual(
    periodo.body.meses.map((m) => [m.mes, m.numero_ventas, m.monto_total_centimos]),
    [['2026-10', 1, 1000], ['2026-11', 3, 1620], ['2026-12', 1, 600]]
  );

  const sumaMeses = periodo.body.meses.reduce((total, m) => total + m.monto_total_centimos, 0);
  assert.equal(sumaMeses, periodo.body.monto_total_centimos);

  let sumaDiarios = 0;
  for (const fecha of dias('2026-10-15', '2026-12-03')) {
    sumaDiarios += (await diario(fecha)).body.monto_total_centimos;
  }
  assert.equal(sumaDiarios, periodo.body.monto_total_centimos);
});

test('el periodo trae todos los meses del rango, incluso los que no tienen ventas', async () => {
  const res = await ingresos('2026-09-15', '2026-10-31');
  assert.equal(res.status, 200);
  assert.deepEqual(
    res.body.meses.map((m) => [m.mes, m.numero_ventas, m.monto_total_centimos]),
    [['2026-09', 0, 0], ['2026-10', 1, 1000]]
  );
});

test('los más vendidos van de mayor a menor por unidades (HU-09 CA2)', async () => {
  const res = await masVendidos('2026-10-15', '2026-12-03');
  assert.equal(res.status, 200);
  assert.deepEqual(
    res.body.productos.map((p) => [p.nombre, p.unidades, p.monto_centimos]),
    [['Paracetamol 500 mg', 30, 1500], ['Amoxicilina 500 mg', 9, 1080], ['Ibuprofeno 400 mg', 8, 640]]
  );
});

test('un rango sin ventas devuelve ceros y listas vacías en los dos reportes (HU-09 CA3)', async () => {
  const periodo = await ingresos('2026-09-01', '2026-09-30');
  assert.equal(periodo.status, 200);
  assert.equal(periodo.body.numero_ventas, 0);
  assert.equal(periodo.body.monto_total_centimos, 0);
  assert.deepEqual(
    periodo.body.meses.map((m) => [m.mes, m.numero_ventas, m.monto_total_centimos]),
    [['2026-09', 0, 0]]
  );

  const vendidos = await masVendidos('2026-09-01', '2026-09-30');
  assert.equal(vendidos.status, 200);
  assert.deepEqual(vendidos.body.productos, []);
});

test('cambiar un precio no altera los reportes de días anteriores (HU-06 CA3)', async () => {
  const antes = (await diario('2026-11-24')).body;
  const periodoAntes = (await ingresos('2026-10-15', '2026-12-03')).body;

  const cambio = await request(app).put('/api/productos/1').send({
    nombre: 'Paracetamol 500 mg', accion_terapeutica: 'Analgésico', tipo: 'generico', precio: '0.60',
  });
  assert.equal(cambio.status, 200);
  assert.equal(cambio.body.precio_centimos, 60);

  assert.deepEqual((await diario('2026-11-24')).body, antes);
  assert.deepEqual((await ingresos('2026-10-15', '2026-12-03')).body, periodoAntes);

  // Una venta nueva sí usa el precio nuevo
  const nueva = await vender([{ producto_id: 1, cantidad: 10 }]);
  assert.equal(nueva.monto_total_centimos, 600);
  assert.equal(nueva.lineas[0].precio_unitario_centimos, 60);
});

test('las fechas inválidas responden 400 con el campo afectado', async () => {
  let res = await diario('2026-02-30');
  assert.equal(res.status, 400);
  assert.equal(res.body.campo, 'fecha');

  res = await ingresos('2026-12-03', '2026-10-15');
  assert.equal(res.status, 400);
  assert.equal(res.body.campo, 'desde');

  res = await request(app).get('/api/reportes/ingresos?desde=2026-10-15');
  assert.equal(res.status, 400);
});
