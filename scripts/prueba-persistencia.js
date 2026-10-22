'use strict';

// Comprueba que un dato sigue disponible después de reiniciar (HT-01 CA2).
// Usa datos/prueba.db, nunca la base real. Uso:
//   node scripts/prueba-persistencia.js guardar
//   (reiniciar la laptop)
//   node scripts/prueba-persistencia.js leer
//   node scripts/prueba-persistencia.js limpiar

const fs = require('node:fs');
const path = require('node:path');
const { abrir } = require('../app/db');

const RUTA = path.join(__dirname, '..', 'datos', 'prueba.db');
const NOMBRE = 'Producto de prueba (reinicio)';
const modo = process.argv[2];

if (modo === 'guardar') {
  const db = abrir(RUTA);
  db.prepare('DELETE FROM producto WHERE nombre = ?').run(NOMBRE);
  db.prepare(
    "INSERT INTO producto (nombre, accion_terapeutica, precio_centimos) VALUES (?, 'Prueba', 100)"
  ).run(NOMBRE);
  db.close();
  console.log('Dato de prueba guardado. Ahora reinicie la laptop y ejecute "leer".');
} else if (modo === 'leer') {
  if (!fs.existsSync(RUTA)) {
    console.log('FALLO: no existe datos/prueba.db. Ejecute primero "guardar".');
    process.exit(1);
  }
  const db = abrir(RUTA);
  const fila = db.prepare('SELECT nombre FROM producto WHERE nombre = ?').get(NOMBRE);
  db.close();
  if (fila) {
    console.log('CORRECTO: el dato sigue disponible tras el reinicio.');
  } else {
    console.log('FALLO: el dato no está.');
    process.exit(1);
  }
} else if (modo === 'limpiar') {
  fs.rmSync(RUTA, { force: true });
  console.log('Base de prueba eliminada.');
} else {
  console.log('Uso: node scripts/prueba-persistencia.js guardar | leer | limpiar');
  process.exit(1);
}
