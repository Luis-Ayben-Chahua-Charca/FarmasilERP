const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const RUTA_DEFECTO = path.join(__dirname, '..', '..', 'datos', 'farmasil.db');
const DIR_MIGRACIONES = path.join(__dirname, 'migraciones');

function migrar(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS migracion (
    nombre TEXT PRIMARY KEY,
    aplicada_en TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  const hechas = new Set(db.prepare('SELECT nombre FROM migracion').all().map(r => r.nombre));
  const archivos = fs.readdirSync(DIR_MIGRACIONES).filter(f => f.endsWith('.sql')).sort();
  for (const archivo of archivos) {
    if (hechas.has(archivo)) continue;
    const sql = fs.readFileSync(path.join(DIR_MIGRACIONES, archivo), 'utf8');
    db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO migracion (nombre) VALUES (?)').run(archivo);
    })();
  }
}

function abrir(ruta = RUTA_DEFECTO) {
  if (ruta !== ':memory:') fs.mkdirSync(path.dirname(ruta), { recursive: true });
  const db = new Database(ruta);
  db.pragma('foreign_keys = ON');
  migrar(db);
  return db;
}

module.exports = { abrir, migrar };
