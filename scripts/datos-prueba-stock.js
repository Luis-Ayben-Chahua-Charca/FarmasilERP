'use strict';

// Crea una base de prueba con unos 300 productos y 2 a 4 lotes cada uno,
// para medir la búsqueda de W3 Consultar stock (HU-08 CA1, RNF-07).
// Usa datos/prueba-stock.db, nunca la base real. Uso:
//   npm run datos-prueba-stock

const fs = require('node:fs');
const path = require('node:path');
const { abrir } = require('../app/db');

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
db.close();
console.log(`Base de prueba creada en datos/prueba-stock.db: ${productos} productos y ${lotes} lotes.`);
