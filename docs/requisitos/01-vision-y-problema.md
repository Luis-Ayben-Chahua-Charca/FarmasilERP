# 01 — Visión y problema

## Contexto del negocio

Farmasil es una farmacia que atiende al público de 9:00 a 21:00. La administra su propietaria, quien autoriza el ingreso de nuevos productos, y en el local atienden hasta dos personas (técnicas farmacéuticas).

- La mayoría de productos requiere receta médica. Los precios los define la farmacia y **todo se cobra por unidad**: una caja de 30 unidades se cobra como 30 unidades (no hay precio por caja ni por conjunto).
- Los productos se clasifican en **genéricos**, ordenados alfabéticamente, y **comerciales**, organizados por acción terapéutica (digestivos, respiratorios, cardíacos, higiene bucal, entre otros).
- Cada medicamento se identifica por su nombre comercial y su composición.
- La mercadería se repone **por lotes**, en promedio cada 15 días.
- Equipamiento: **una laptop**, un teléfono celular y un POS (cobros con tarjeta, Yape o Plin, e impresión de boletas).
- No hay internet fijo; solo datos móviles intermitentes.

## Situación actual

| Proceso | Cómo se hace hoy |
|---|---|
| Ingreso de mercadería | Se anota a mano en un cuaderno contable al llegar el lote. |
| Ventas | No se registran. Solo queda constancia si el cliente pide boleta (emitida en el POS). |
| Control de stock | Revisión manual, producto por producto, una vez al mes. |

## Problema identificado

La información de ventas e inventario depende de cuadernos y conteos manuales, lo que provoca:

1. **No hay registro de ventas**: no se sabe cuánto se vende ni qué productos rotan más, y no hay sustento para cuadrar la caja.
2. **Riesgo de pérdida total de información**: ya ocurrió; robaron los cuadernos y se perdió todo el registro.
3. **Stock real desconocido entre revisiones**: con frecuencia se descubre que un producto se agotó en plena venta. Es la principal causa de pérdidas económicas.
4. **El conteo manual del inventario** es la tarea más pesada de la operación.
5. **El ingreso de lotes no está sistematizado**: no se conserva de forma ordenada el número de lote, la fecha de vencimiento ni la cantidad. Es el primer problema que la propietaria quiere resolver.

## Cuellos de botella del proceso actual (AS-IS)

| ID | Actividad | Efecto |
|---|---|---|
| C1 | Anotar ingreso de lote en cuaderno | Información incompleta y expuesta a pérdida |
| C2 | Buscar producto en estante para saber si hay | Demora en la atención; no da el stock real |
| C3 | Faltante descubierto durante la venta | Venta perdida |
| C4 | Venta sin registro | Sin datos de ventas ni cierre de caja |
| C5 | Conteo manual mensual | Tarea más demandante |
| C6 | Inventario en papel | Desactualizado hasta 30 días; riesgo de pérdida |

## Objetivo de la solución

**Objetivo general:** desarrollar un sistema que registre las ventas y el inventario de Farmasil por producto y por lote, para conocer en todo momento el stock disponible y el volumen de ventas, sin depender de registros en papel ni de conteos manuales.

**Objetivos específicos:**

1. Registrar cada venta con fecha, productos, cantidades y monto, y descontar automáticamente el stock.
2. Registrar el ingreso de cada lote con su número, fecha de vencimiento y cantidad.
3. Mantener el catálogo de productos (base del inventario) con edición simple del precio unitario, clasificado en genéricos y comerciales.
4. Consultar el stock por producto y por lote en cualquier momento.
5. Generar el reporte diario de ventas y reportes periódicos de ingresos y productos más vendidos.
6. Operar sin conexión a internet y ser utilizable sin capacitación previa.

## Proceso propuesto (TO-BE), en resumen

- **Ingreso de lote:** la propietaria registra cada lote en el sistema; el sistema valida que no esté duplicado, lo guarda y actualiza el stock.
- **Venta:** la técnica busca el producto en el sistema (precio y stock en pantalla), confirma la venta y el sistema descuenta el stock desde el lote que vence primero. El cobro y la boleta siguen en el POS.
- **Cierre del día:** la propietaria consulta el reporte diario y cuadra la caja. El conteo mensual deja de ser necesario para conocer el stock.
