# API de ventas (Sprint 3)

Contrato de `POST /api/ventas`, acordado en el Sprint Planning del Sprint 3 (06/11/2026). Lo implementan HU-01.2 y HU-01.3, y lo usa la pantalla W1. Si cambia, se actualiza aquí en el mismo PR.

Convenciones heredadas del Sprint 2: precios en **céntimos enteros**, cantidades **por unidad**, errores con código HTTP y cuerpo `{ "error": "mensaje en español", "campo": "..." }`, que ya interpreta `app/public/js/api.js`.

## Petición

```json
POST /api/ventas
{
  "lineas": [
    { "producto_id": 1, "cantidad": 10 },
    { "producto_id": 2, "cantidad": 4 }
  ]
}
```

- `cantidad`: entero mayor que cero.
- Si el mismo `producto_id` llega en dos líneas, el servidor **suma las cantidades** y lo trata como una sola línea. W1 ya junta las líneas del mismo producto, así que en uso normal no ocurre.

## Respuesta correcta — `201`

```json
{
  "id": 15,
  "fecha_hora": "2026-11-12 18:42:05",
  "monto_total_centimos": 980,
  "lineas": [
    { "producto_id": 1, "lote_id": 3, "numero_lote": "L-2309", "cantidad": 4, "precio_unitario_centimos": 50 },
    { "producto_id": 1, "lote_id": 7, "numero_lote": "L-2411", "cantidad": 6, "precio_unitario_centimos": 50 },
    { "producto_id": 2, "lote_id": 9, "numero_lote": "L-3001", "cantidad": 4, "precio_unitario_centimos": 120 }
  ]
}
```

- `lineas` trae **una fila por lote usado**: si un producto se descuenta de dos lotes (HU-02), aparece dos veces, como en el ejemplo.
- `precio_unitario_centimos` y `monto_total_centimos` los calcula el **servidor** con el precio actual de cada producto. El total que muestra W1 es solo una referencia para la técnica.
- `fecha_hora` está en la **hora local de la laptop**, con formato `AAAA-MM-DD HH:MM:SS`, no en UTC. El reporte diario del Sprint 4 (HU-03) agrupa por el día de la farmacia; con UTC, las ventas posteriores a las 7 p. m. caerían en el día siguiente.

## Errores

| Código | Cuándo | Cuerpo |
|---|---|---|
| `400` | `lineas` falta, no es una lista o está vacía | `{ "error": "Agregue al menos un producto a la venta.", "campo": "lineas" }` |
| `400` | Una `cantidad` no es un entero mayor que cero | `{ "error": "La cantidad debe ser mayor que cero.", "campo": "cantidad", "producto_id": 1 }` |
| `400` | Un `producto_id` no existe | `{ "error": "El producto indicado no existe.", "campo": "producto_id", "producto_id": 99 }` |
| `409` | La cantidad supera el stock disponible del producto | `{ "error": "Solo hay 4 unidades disponibles de Paracetamol 500 mg.", "campo": "cantidad", "producto_id": 1, "disponible": 4 }` |

Ante cualquier error **no se guarda nada**: ni la venta ni ninguna de sus líneas. La venta se valida y se guarda dentro de **una sola transacción**.

## Regla de descuento (HU-02, RF-03)

Por cada producto se usan sus lotes con stock mayor que cero, del vencimiento más próximo al más lejano. Si dos lotes vencen el mismo día, se usa primero el de menor `id` (el que se registró antes). La regla vive en `app/ventas/asignar-lotes.js` (HU-02.1), sin acceso a la base, para probarla por separado.

Stock de un lote = `cantidad_recibida` − suma de `linea_venta.cantidad` de ese lote, igual que en `GET /api/stock`.
