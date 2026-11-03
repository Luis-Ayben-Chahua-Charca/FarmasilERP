'use strict';

const express = require('express');

const router = express.Router();

// Texto del filtro o '' si no viene (un parámetro vacío no filtra)
const filtro = (valor) => (typeof valor === 'string' ? valor.trim() : '');

// GET /api/stock?nombre=&categoria=&tipo=: stock por producto con sus lotes (HU-08).
// Stock de un lote = cantidad_recibida − lo vendido de ese lote (las ventas llegan en el Sprint 3).
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const filtros = {
    nombre: filtro(req.query.nombre),
    categoria: filtro(req.query.categoria),
    tipo: filtro(req.query.tipo),
  };

  // LIKE de SQLite no distingue mayúsculas en letras sin tilde
  const filas = db.prepare(`
    SELECT p.id, p.nombre, p.accion_terapeutica, p.tipo, p.precio_centimos,
           l.numero_lote, l.fecha_vencimiento,
           l.cantidad_recibida - COALESCE(
             (SELECT SUM(lv.cantidad) FROM linea_venta lv WHERE lv.lote_id = l.id), 0) AS cantidad
    FROM producto p
    LEFT JOIN lote l ON l.producto_id = p.id
    WHERE (@nombre = '' OR p.nombre LIKE '%' || @nombre || '%')
      AND (@categoria = '' OR p.accion_terapeutica = @categoria)
      AND (@tipo = '' OR p.tipo = @tipo)
    ORDER BY p.nombre, l.fecha_vencimiento
  `).all(filtros);

  // Agrupa las filas por producto; un producto sin lotes queda con stock 0
  const productos = new Map();
  for (const f of filas) {
    if (!productos.has(f.id)) {
      productos.set(f.id, {
        id: f.id,
        nombre: f.nombre,
        accion_terapeutica: f.accion_terapeutica,
        tipo: f.tipo,
        precio_centimos: f.precio_centimos,
        stock_total: 0,
        lotes: [],
      });
    }
    if (f.numero_lote !== null) {
      const producto = productos.get(f.id);
      producto.lotes.push({
        numero_lote: f.numero_lote,
        fecha_vencimiento: f.fecha_vencimiento,
        cantidad: f.cantidad,
      });
      producto.stock_total += f.cantidad;
    }
  }

  res.json([...productos.values()]);
});

module.exports = router;
