const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { abrir } = require('../app/db');

const ruta = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'farmasil-')), 'test.db');

test('un dato sobrevive al cerrar y reabrir la base', () => {
  let db = abrir(ruta);
  db.prepare("INSERT INTO producto (nombre, accion_terapeutica, precio_centimos) VALUES ('Paracetamol 500 mg','Analgésico',50)").run();
  db.close();
  db = abrir(ruta);
  assert.strictEqual(db.prepare('SELECT COUNT(*) n FROM producto').get().n, 1);
  db.close();
});

test('rechaza lote duplicado en el mismo producto pero acepta en otro (HU-05)', () => {
  const db = abrir(':memory:');
  const p = db.prepare("INSERT INTO producto (nombre, accion_terapeutica, precio_centimos) VALUES (?, 'X', 100)");
  const a = p.run('A').lastInsertRowid;
  const b = p.run('B').lastInsertRowid;
  const l = db.prepare("INSERT INTO lote (producto_id, numero_lote, fecha_vencimiento, cantidad_recibida) VALUES (?, 'L-2309', '2027-03-01', 10)");
  l.run(a);
  assert.throws(() => l.run(a), /UNIQUE/);
  assert.doesNotThrow(() => l.run(b));
});
