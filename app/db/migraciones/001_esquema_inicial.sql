CREATE TABLE producto (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  accion_terapeutica TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('generico','comercial')),
  precio_centimos INTEGER NOT NULL CHECK (precio_centimos >= 0)
);

CREATE TABLE lote (
  id INTEGER PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES producto(id),
  numero_lote TEXT NOT NULL,
  fecha_vencimiento TEXT NOT NULL,
  cantidad_recibida INTEGER NOT NULL CHECK (cantidad_recibida > 0),
  UNIQUE (producto_id, numero_lote)
);

CREATE TABLE venta (
  id INTEGER PRIMARY KEY,
  fecha_hora TEXT NOT NULL,
  monto_total_centimos INTEGER NOT NULL CHECK (monto_total_centimos >= 0)
);

CREATE TABLE linea_venta (
  id INTEGER PRIMARY KEY,
  venta_id INTEGER NOT NULL REFERENCES venta(id),
  lote_id INTEGER NOT NULL REFERENCES lote(id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario_centimos INTEGER NOT NULL CHECK (precio_unitario_centimos >= 0)
);
