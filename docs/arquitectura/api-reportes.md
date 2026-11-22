# API de productos (edición) y de reportes (Sprint 4)

Contrato acordado en el Sprint Planning del Sprint 4 (22/11/2026). Lo implementa back-end en HU-06.2, HU-03.2, HU-09.1 y HU-09.2, y lo usan las pantallas W4 Productos y W5 Reportes. Si cambia, se actualiza aquí en el mismo PR.

Convenciones heredadas: precios y montos en **céntimos enteros**, cantidades **por unidad**, errores con código HTTP y cuerpo `{ "error": "mensaje en español", "campo": "..." }` (los interpreta `app/public/js/api.js`). Las fechas van como `AAAA-MM-DD` y se comparan con la **fecha local** de `venta.fecha_hora`, que se guarda en hora local desde el Sprint 3 (`docs/arquitectura/api-ventas.md`). Los reportes son de **solo lectura**: ninguno modifica datos.

## 1. Edición de producto — `PUT /api/productos/:id` (HU-06)

Petición con los cuatro campos, igual que el alta (`POST /api/productos`):

```json
PUT /api/productos/1
{ "nombre": "Paracetamol 500 mg", "accion_terapeutica": "Analgésico", "tipo": "generico", "precio": "0.60" }
```

- Misma validación que el alta y mismos mensajes: nombre, acción terapéutica, tipo (`generico` o `comercial`) y precio en soles (`0.60`, `0,60` o `0.6`), no negativo y hasta S/ 10 000.
- `200` con el producto actualizado: `{ "id": 1, "nombre": "...", "accion_terapeutica": "...", "tipo": "generico", "precio_centimos": 60 }`.
- `400` con `campo` si un dato no es válido. `404` con `{ "error": "El producto no existe." }` si el `id` no existe. Nada cambia si hay error.
- El nuevo precio rige solo para las **ventas futuras**: cada `linea_venta` guarda el precio con que se vendió, así que las ventas ya registradas no cambian (HU-06 CA3).

## 2. Reporte diario — `GET /api/reportes/diario?fecha=AAAA-MM-DD` (HU-03)

Sin `fecha`, usa el día de hoy (hora local de la laptop).

```json
{
  "fecha": "2026-11-25",
  "numero_ventas": 2,
  "unidades_vendidas": 14,
  "monto_total_centimos": 980,
  "productos": [
    { "producto_id": 2, "nombre": "Ibuprofeno 400 mg", "unidades": 4, "monto_centimos": 480 },
    { "producto_id": 1, "nombre": "Paracetamol 500 mg", "unidades": 10, "monto_centimos": 500 }
  ],
  "ventas": [
    { "id": 15, "hora": "09:12", "monto_total_centimos": 500,
      "lineas": [ { "nombre": "Paracetamol 500 mg", "cantidad": 10, "precio_unitario_centimos": 50 } ] },
    { "id": 16, "hora": "18:42", "monto_total_centimos": 480,
      "lineas": [ { "nombre": "Ibuprofeno 400 mg", "cantidad": 4, "precio_unitario_centimos": 120 } ] }
  ]
}
```

- `productos`: una fila por producto vendido en el día, ordenada por nombre. Si un producto salió de dos lotes, sus unidades se suman en una sola fila.
- `ventas`: una por venta, de la más temprana a la más tarde; `lineas` junta por producto las filas de `linea_venta` de esa venta.
- Día sin ventas: `200` con `numero_ventas: 0`, `unidades_vendidas: 0`, `monto_total_centimos: 0` y listas vacías (HU-03 CA2).
- `fecha` con formato inválido o inexistente (`2026-02-30`): `400` con `{ "error": "La fecha debe tener el formato AAAA-MM-DD.", "campo": "fecha" }`.

## 3. Ingresos por periodo — `GET /api/reportes/ingresos?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` (HU-09 CA1)

`desde` y `hasta` son obligatorios e **inclusivos**.

```json
{
  "desde": "2026-10-15",
  "hasta": "2026-12-03",
  "numero_ventas": 42,
  "monto_total_centimos": 125430,
  "meses": [
    { "mes": "2026-10", "numero_ventas": 0, "monto_total_centimos": 0 },
    { "mes": "2026-11", "numero_ventas": 40, "monto_total_centimos": 120000 },
    { "mes": "2026-12", "numero_ventas": 2, "monto_total_centimos": 5430 }
  ]
}
```

- `meses` trae **una fila por cada mes del rango**, en orden, aunque no tenga ventas (con 0), para que se note el hueco.
- `monto_total_centimos` es la suma de los meses y coincide con la suma de los reportes diarios de esos días (HU-09 CA1).
- Sin ventas en el rango: `200` con totales en 0 y los meses del rango en 0 (HU-09 CA3).

## 4. Productos más vendidos — `GET /api/reportes/mas-vendidos?desde=AAAA-MM-DD&hasta=AAAA-MM-DD` (HU-09 CA2)

```json
{
  "desde": "2026-11-01",
  "hasta": "2026-11-30",
  "productos": [
    { "producto_id": 1, "nombre": "Paracetamol 500 mg", "unidades": 120, "monto_centimos": 6000 },
    { "producto_id": 2, "nombre": "Ibuprofeno 400 mg", "unidades": 40, "monto_centimos": 4800 }
  ]
}
```

- Todos los productos vendidos en el rango, de **mayor a menor por unidades**; en empate, por nombre. La API no limita la lista; W5 muestra los 10 primeros.
- Sin ventas: `200` con `productos: []` (HU-09 CA3).

## Errores comunes de los reportes por periodo

| Código | Cuándo | Cuerpo |
|---|---|---|
| `400` | Falta `desde` o `hasta` | `{ "error": "Elija la fecha de inicio y la de fin.", "campo": "desde" }` (o `"hasta"`) |
| `400` | Fecha con formato inválido o inexistente | `{ "error": "La fecha debe tener el formato AAAA-MM-DD.", "campo": "desde" }` |
| `400` | `desde` posterior a `hasta` | `{ "error": "La fecha de inicio no puede ser posterior a la de fin.", "campo": "desde" }` |
