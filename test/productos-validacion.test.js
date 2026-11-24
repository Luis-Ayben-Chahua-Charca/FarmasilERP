'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Carga el módulo del navegador sin cambiar el tipo CommonJS del proyecto.
const codigo = fs.readFileSync(path.join(__dirname, '../app/public/js/productos.js'), 'utf8');
const modulo = import('data:text/javascript;base64,' + Buffer.from(codigo).toString('base64'));
const datos = { nombre: 'Prueba', accion_terapeutica: 'Analgésico', tipo: 'generico' };

test('la validación compartida rechaza precios superiores al límite del servidor', async () => {
  const { validarProducto } = await modulo;
  for (const precio of ['10000.01', '10000,01', '1e20']) {
    assert.equal(validarProducto({ ...datos, precio }).precio,
      'El precio no puede superar S/ 10 000 por unidad.');
  }
});

test('la validación compartida acepta el límite exacto y precios con coma', async () => {
  const { validarProducto } = await modulo;
  for (const precio of ['10000', '10000,00', '0.60', '0,60', '0']) {
    assert.deepEqual(validarProducto({ ...datos, precio }), {});
  }
});
