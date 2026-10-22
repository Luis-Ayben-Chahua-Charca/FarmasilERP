# Modelo de datos

Todo precio y cantidad va por unidad. Los precios se guardan en céntimos enteros (S/ 0.50 = 50).

```mermaid
erDiagram
  producto ||--o{ lote : tiene
  lote ||--o{ linea_venta : "se descuenta en"
  venta ||--|{ linea_venta : contiene
  producto {
    int id PK
    text nombre
    text accion_terapeutica
    text tipo
    int precio_centimos
  }
  lote {
    int id PK
    int producto_id FK
    text numero_lote
    text fecha_vencimiento
    int cantidad_recibida
  }
  venta {
    int id PK
    text fecha_hora
    int monto_total_centimos
  }
  linea_venta {
    int id PK
    int venta_id FK
    int lote_id FK
    int cantidad
    int precio_unitario_centimos
  }
```

El stock de un lote es `cantidad_recibida` menos la suma de `linea_venta.cantidad` de ese lote.
La restricción `UNIQUE (producto_id, numero_lote)` evita registrar dos veces el mismo lote de un producto (HU-05).
