'use strict';

const express = require('express');

const router = express.Router();

const vacio = (valor) => valor === undefined || valor === null || String(valor).trim() === '';

const TIPOS = ['generico', 'comercial'];

// El precio llega en soles («1.50», «1,50» o 1.5) y se guarda en céntimos enteros
function aCentimos(precio) {
  const soles = typeof precio === 'string' ? Number(precio.trim().replace(',', '.')) : precio;
  if (typeof soles !== 'number' || !Number.isFinite(soles)) return null;
  return Math.round(soles * 100);
}

// Valida antes de insertar (RF-07): devuelve { error, campo } o null si todo está bien
function validarProducto(datos) {
  const { nombre, accion_terapeutica, precio, tipo } = datos;

  if (vacio(nombre)) return { error: 'Ingrese el nombre del producto.', campo: 'nombre' };
  if (vacio(accion_terapeutica)) {
    return { error: 'Ingrese la acción terapéutica.', campo: 'accion_terapeutica' };
  }
  if (vacio(precio)) return { error: 'Ingrese el precio unitario.', campo: 'precio' };

  const centimos = aCentimos(precio);
  if (centimos === null) return { error: 'El precio debe ser un número.', campo: 'precio' };
  if (centimos < 0) return { error: 'El precio no puede ser negativo.', campo: 'precio' };

  if (!vacio(tipo) && !TIPOS.includes(tipo)) {
    return { error: 'El tipo debe ser genérico o comercial.', campo: 'tipo' };
  }
  return null;
}

// GET /api/productos: lista ordenada por nombre para el selector de W2
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const productos = db.prepare(`SELECT id, nombre, accion_terapeutica, tipo, precio_centimos
    FROM producto ORDER BY nombre COLLATE NOCASE`).all();
  res.json(productos);
});

// POST /api/productos: alta rápida desde W2 (HU-04 CA2)
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const datos = req.body ?? {};

  const invalido = validarProducto(datos);
  if (invalido) return res.status(400).json(invalido);

  const info = db.prepare(`INSERT INTO producto (nombre, accion_terapeutica, tipo, precio_centimos)
    VALUES (?, ?, ?, ?)`).run(
    String(datos.nombre).trim(),
    String(datos.accion_terapeutica).trim(),
    vacio(datos.tipo) ? null : datos.tipo,
    aCentimos(datos.precio)
  );

  const producto = db.prepare(`SELECT id, nombre, accion_terapeutica, tipo, precio_centimos
    FROM producto WHERE id = ?`).get(info.lastInsertRowid);
  res.status(201).json(producto);
});

module.exports = router;
