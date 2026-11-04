'use strict';

// Crea una base de prueba con unos 300 productos y 2 a 4 lotes cada uno
// y mide el tiempo de respuesta de GET /api/stock con ese volumen
// (HU-08 CA1, RNF-07: menos de 2 s). Usa datos/prueba-stock.db, nunca la base real. Uso:
//   npm run datos-prueba-stock

const fs = require('node:fs');
const path = require('node:path');
const { abrir } = require('../app/db');
const app = require('../app/server');

const RUTA = path.join(__dirname, '..', 'datos', 'prueba-stock.db');

const MEDICAMENTOS = [
  ['Paracetamol', 'Analgésico'], ['Ibuprofeno', 'Antiinflamatorio'],
  ['Naproxeno', 'Antiinflamatorio'], ['Diclofenaco', 'Antiinflamatorio'],
  ['Metamizol', 'Analgésico'], ['Amoxicilina', 'Antibiótico'],
  ['Azitromicina', 'Antibiótico'], ['Ciprofloxacino', 'Antibiótico'],
  ['Cefalexina', 'Antibiótico'], ['Clorfenamina', 'Antihistamínico'],
  ['Loratadina', 'Antihistamínico'], ['Cetirizina', 'Antihistamínico'],
  ['Omeprazol', 'Antiácido'], ['Ranitidina', 'Antiácido'],
  ['Losartán', 'Antihipertensivo'], ['Enalapril', 'Antihipertensivo'],
  ['Metformina', 'Antidiabético'], ['Glibenclamida', 'Antidiabético'],
  ['Salbutamol', 'Broncodilatador'], ['Dexametasona', 'Corticoide'],
  ['Prednisona', 'Corticoide'], ['Albendazol', 'Antiparasitario'],
  ['Mebendazol', 'Antiparasitario'], ['Loperamida', 'Antidiarreico'],
  ['Hioscina', 'Antiespasmódico'],
];
const PRESENTACIONES = [
  '100 mg', '250 mg', '500 mg', '1 g', '5 mg', '10 mg',
  '20 mg', '50 mg', '400 mg', '120 mg/5 ml', '250 mg/5 ml', '2 mg',
];

// Generador con semilla fija: la base sale igual en cada ejecución
let semilla = 48;
function azar(min, max) {
  semilla = (semilla * 1103515245 + 12345) % 2147483648;
  // Los bits altos varían más que los bajos en este tipo de generador
  return min + (Math.floor(semilla / 65536) % (max - min + 1));
}

function fechaVencimiento() {
  const anio = azar(2027, 2029);
  const mes = String(azar(1, 12)).padStart(2, '0');
  const dia = String(azar(1, 28)).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

fs.rmSync(RUTA, { force: true });
const db = abrir(RUTA);

const insertarProducto = db.prepare(
  'INSERT INTO producto (nombre, accion_terapeutica, tipo, precio_centimos) VALUES (?, ?, ?, ?)'
);
const insertarLote = db.prepare(
  'INSERT INTO lote (producto_id, numero_lote, fecha_vencimiento, cantidad_recibida) VALUES (?, ?, ?, ?)'
);

let lotes = 0;
db.transaction(() => {
  for (const [nombre, accion] of MEDICAMENTOS) {
    for (const presentacion of PRESENTACIONES) {
      const tipo = azar(0, 1) ? 'generico' : 'comercial';
      const id = insertarProducto.run(
        `${nombre} ${presentacion}`, accion, tipo, azar(10, 5000)
      ).lastInsertRowid;
      const cantidadLotes = azar(2, 4);
      for (let i = 1; i <= cantidadLotes; i++) {
        insertarLote.run(id, `L-${id}-${i}`, fechaVencimiento(), azar(10, 200));
        lotes++;
      }
    }
  }
})();

const productos = db.prepare('SELECT COUNT(*) n FROM producto').get().n;
console.log(`Base de prueba creada en datos/prueba-stock.db: ${productos} productos y ${lotes} lotes.`);

// ---- Medición de la búsqueda de stock ----
const LIMITE_MS = 2000;
const REPETICIONES = 5;
const BUSQUEDAS = [
  ['Listado completo (al abrir W3)', ''],
  ['Nombre «para»', '?nombre=para'],
  ['Categoría Antibiótico', '?categoria=Antibi%C3%B3tico'],
  ['Tipo genérico', '?tipo=generico'],
  ['Nombre + categoría + tipo', '?nombre=amoxi&categoria=Antibi%C3%B3tico&tipo=generico'],
  ['Sin resultados', '?nombre=zzz'],
];

async function medir() {
  // La app real de Express con la base de prueba, en un puerto libre de 127.0.0.1
  app.locals.db = db;
  const servidor = app.listen(0, '127.0.0.1');
  await new Promise((listo) => servidor.once('listening', listo));
  const base = `http://127.0.0.1:${servidor.address().port}/api/stock`;

  console.log(`\nMedición de GET /api/stock (peor de ${REPETICIONES} intentos por búsqueda):`);
  let peor = 0;
  for (const [nombre, consulta] of BUSQUEDAS) {
    let maximo = 0;
    let cantidad = 0;
    for (let i = 0; i < REPETICIONES; i++) {
      const inicio = performance.now();
      const respuesta = await fetch(base + consulta);
      const datos = await respuesta.json();
      maximo = Math.max(maximo, performance.now() - inicio);
      cantidad = datos.length;
    }
    peor = Math.max(peor, maximo);
    console.log(`  ${nombre.padEnd(32)} ${String(cantidad).padStart(3)} productos  ${maximo.toFixed(1).padStart(7)} ms`);
  }

  servidor.close();
  db.close();
  console.log(`\nPeor tiempo: ${peor.toFixed(1)} ms (límite ${LIMITE_MS} ms).`);
  if (peor < LIMITE_MS) {
    console.log('CORRECTO: la búsqueda responde en menos de 2 s con este volumen.');
  } else {
    console.log('FALLO: la búsqueda tarda 2 s o más.');
    process.exitCode = 1;
  }
}

medir();
