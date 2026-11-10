'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { asignarLotes } = require('../app/ventas/asignar-lotes');

const loteA = { id: 1, numero_lote: 'A', fecha_vencimiento: '2027-03-31', disponible: 4 };
const loteB = { id: 2, numero_lote: 'B', fecha_vencimiento: '2027-11-30', disponible: 100 };
const reparto = (lote, cantidad) => ({ lote_id: lote.id, numero_lote: lote.numero_lote, cantidad });

test('vender 6 descuenta 4 del lote A y 2 del lote B (HU-02 CA1)', () => {
  assert.deepEqual(asignarLotes([loteA, loteB], 6), [reparto(loteA, 4), reparto(loteB, 2)]);
});

test('omite el lote agotado aunque venza primero (HU-02 CA2)', () => {
  assert.deepEqual(asignarLotes([{ ...loteA, disponible: 0 }, loteB], 6), [reparto(loteB, 6)]);
});

test('asigna solo la cantidad solicitada cuando cabe en un lote', () => {
  assert.deepEqual(asignarLotes([{ ...loteA, disponible: 10 }], 3), [reparto(loteA, 3)]);
});

test('permite vender exactamente la suma disponible', () => {
  assert.deepEqual(asignarLotes([loteA, { ...loteB, disponible: 2 }], 6), [reparto(loteA, 4), reparto(loteB, 2)]);
});

test('devuelve null sin modificar los lotes cuando el stock no alcanza', () => {
  const lotes = Object.freeze([Object.freeze({ ...loteA }), Object.freeze({ ...loteB, disponible: 2 })]);
  assert.equal(asignarLotes(lotes, 7), null);
});

test('a igual vencimiento usa primero el lote de menor id', () => {
  const primero = { ...loteA, id: 10 };
  const segundo = { ...loteB, id: 2, fecha_vencimiento: loteA.fecha_vencimiento };
  assert.deepEqual(asignarLotes([primero, segundo], 1), [reparto(segundo, 1)]);
});

test('el orden de entrada no cambia el reparto ni se modifica la entrada', () => {
  const lotes = Object.freeze([Object.freeze({ ...loteB }), Object.freeze({ ...loteA })]);
  assert.deepEqual(asignarLotes(lotes, 6), [reparto(loteA, 4), reparto(loteB, 2)]);
});
