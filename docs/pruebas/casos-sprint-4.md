# Casos de prueba — Sprint 4

Casos de aceptación de **HU-06 Registrar y editar productos** (#17), **HU-03 Reporte diario de ventas** (#18) y **HU-09 Reportes gerenciales** (#19), redactados con la plantilla del [plan de pruebas](plan-de-pruebas.md). Cada caso prueba un criterio de aceptación de [`07-historias-de-usuario.md`](../requisitos/07-historias-de-usuario.md) y su número coincide con el del criterio (CP-HU03-2 prueba HU-03 CA2). Los resultados se registran en [`resultados-sprint-4.md`](resultados-sprint-4.md). Las pruebas son del issue #20.

Las respuestas de la API salen del contrato [`api-reportes.md`](../arquitectura/api-reportes.md) y los textos de pantalla, de los bocetos W4 y W5. Si la pantalla final muestra otro texto con el mismo sentido, el caso pasa y se anota la diferencia en las observaciones.

## Condiciones de todas las pruebas

- Se ejecutan en la laptop, **sin internet**, con el Node portátil de `iniciar.bat`, sobre la rama o el commit del PR de la historia que se prueba. Se anota cuál.
- Con F12 abierto (Consola y Red): sin errores en la consola ni peticiones fuera de `localhost`.
- Se usa una base de prueba, nunca la base real (`datos/farmasil.db`).
- Todo precio y monto va en céntimos enteros en la API y como `S/ 9.80` en pantalla; las cantidades, por unidad.
- Los reportes son de solo lectura.

## Datos de prueba: base «reportes»

Productos y lotes (el orden de registro decide el desempate):

| Producto | Precio por unidad | Tipo | Lotes |
|---|---|---|---|
| Paracetamol 500 mg | S/ 0.50 | Genérico | A `L-2309` (vence 31/03/2027, 24 u.) · B `L-2411` (vence 30/11/2027, 100 u.) |
| Amoxicilina 500 mg | S/ 1.20 | Genérico | `L-3001` (vence 30/06/2027, 60 u.) |
| Ibuprofeno 400 mg | S/ 0.80 | Comercial | `L-5001` (vence 31/12/2027, 20 u.) |

Ventas, con su fecha y hora local:

| Venta | Fecha y hora | Líneas | Monto |
|---|---|---|---|
| V1 | 2026-10-20 10:05 | 20 Paracetamol (del lote A) | S/ 10.00 |
| V2 | 2026-11-10 11:30 | 6 Ibuprofeno | S/ 4.80 |
| V3 | 2026-11-24 09:12 | 10 Paracetamol (4 del lote A y 6 del B) | S/ 5.00 |
| V4 | 2026-11-24 15:40 | 4 Amoxicilina + 2 Ibuprofeno | S/ 6.40 |
| V5 | 2026-12-01 16:20 | 5 Amoxicilina | S/ 6.00 |

Totales de referencia: periodo 15/10 a 3/12 = 5 ventas y **S/ 32.20**. Por mes: octubre S/ 10.00, noviembre S/ 16.20, diciembre S/ 6.00. El 23/11 no hay ventas.

## HU-06 — Registrar y editar productos

### CP-HU06-1 — Alta de producto (HU-06 CA1)

| Campo | Contenido |
|---|---|
| Precondición | Pantalla *Productos* abierta; no existe «Diclofenaco 50 mg» |
| Pasos | 1. Escribir nombre `Diclofenaco 50 mg`, acción terapéutica `Antiinflamatorio`, tipo **Genérico** y precio `0.70`. 2. Presionar **Guardar**. 3. Revisar el listado y buscar «diclo». 4. Abrir *Consultar stock* |
| Resultado esperado | El producto se guarda y aparece en el listado con **S/ 0.70**. En *Consultar stock* figura con stock 0 |

### CP-HU06-2 — Falta un campo obligatorio (HU-06 CA2)

| Campo | Contenido |
|---|---|
| Precondición | *Productos* abierta, F12 → Red abierto |
| Pasos | (a) Dejar todo vacío y presionar **Guardar**. (b) Escribir solo el nombre. (c) Escribir nombre, acción y tipo, sin precio |
| Resultado esperado | En los tres casos el producto **no se guarda** y el listado no cambia. Se indica cada campo faltante junto al campo, y lo ya escrito se conserva. Si el navegador llega a enviar la petición, el servidor responde `400` con `campo` |

### CP-HU06-3 — Cambio de precio en tres acciones y precio histórico (HU-06 CA3)

| Campo | Contenido |
|---|---|
| Precondición | Base «reportes»: Paracetamol 500 mg a S/ 0.50, con V3 del 24/11 ya registrada |
| Pasos | 1. En *Productos*, presionar **Editar** en Paracetamol (acción 1). 2. Cambiar el precio a `0.60` (acción 2). 3. Presionar **Guardar** (acción 3). 4. Registrar en *Registrar venta* una venta de 10 unidades de Paracetamol. 5. En *Reportes*, abrir el reporte de hoy y el del 24/11 |
| Resultado esperado | El cambio se completa en **3 acciones**. La venta nueva suma **S/ 6.00** (10 × 0.60) y su línea guarda `precio_unitario_centimos: 60`. La venta V3 sigue en **S/ 5.00** y el reporte del 24/11 no cambia (precio histórico) |

## HU-03 — Reporte diario de ventas

### CP-HU03-1 — Reporte de un día con ventas (HU-03 CA1)

| Campo | Contenido |
|---|---|
| Precondición | Base «reportes». *Reportes*, pestaña **Del día**, F12 → Red abierto |
| Pasos | 1. Elegir la fecha **24/11/2026**. 2. Anotar totales, productos y detalle. 3. En F12 → Red, abrir la respuesta de `GET /api/reportes/diario?fecha=2026-11-24` |
| Resultado esperado | **2 ventas, 16 unidades y S/ 11.40** (`monto_total_centimos: 1140`). Productos por nombre: Amoxicilina 500 mg 4 u. S/ 4.80, Ibuprofeno 400 mg 2 u. S/ 1.60 y Paracetamol 500 mg **10 u. S/ 5.00 en una sola fila**, aunque salió de dos lotes. Detalle: venta de las 09:12 por S/ 5.00 y venta de las 15:40 por S/ 6.40 |

### CP-HU03-2 — Día sin ventas (HU-03 CA2)

| Campo | Contenido |
|---|---|
| Precondición | Base «reportes»; el 23/11/2026 no hay ventas |
| Pasos | 1. Elegir la fecha **23/11/2026**. 2. Revisar la pantalla y la respuesta de la API |
| Resultado esperado | Un aviso de que no hay ventas ese día y totales en **S/ 0.00**, sin errores. La API responde `200` con `numero_ventas`, `unidades_vendidas` y `monto_total_centimos` en 0, y `productos` y `ventas` vacíos |

### CP-HU03-3 — El reporte no se puede modificar (HU-03 CA3)

| Campo | Contenido |
|---|---|
| Precondición | Reporte del 24/11 en pantalla, F12 → Red limpio |
| Pasos | 1. Buscar botones o campos para editar, anular o borrar una venta. 2. Cambiar de fecha varias veces y volver al 24/11. 3. Revisar F12 → Red |
| Resultado esperado | No hay ningún control de edición. Todas las peticiones son `GET`, y los montos de las ventas no cambian |

## HU-09 — Reportes gerenciales

Si en la revisión del viernes 27/11 se reduce HU-09, los casos afectados se marcan **No verificado** con el motivo «reducido en el Sprint 4».

### CP-HU09-1 — Ingresos del periodo, con desglose mensual (HU-09 CA1)

| Campo | Contenido |
|---|---|
| Precondición | Base «reportes». *Reportes*, pestaña **Por periodo** |
| Pasos | (a) Elegir desde **15/10/2026** hasta **03/12/2026** y generar. (b) Elegir desde **15/09/2026** hasta **31/10/2026** y generar. (c) Sumar los reportes diarios de 20/10, 10/11, 24/11 y 01/12 |
| Resultado esperado | (a) **5 ventas y S/ 32.20**; meses: 2026-10 con S/ 10.00, 2026-11 con S/ 16.20 y 2026-12 con S/ 6.00, que suman el total. (b) Aparecen 2026-09 con 0 ventas y S/ 0.00, y 2026-10 con S/ 10.00. (c) 10.00 + 4.80 + 11.40 + 6.00 = **S/ 32.20**, igual que el ingreso del periodo |

### CP-HU09-2 — Productos más vendidos (HU-09 CA2)

| Campo | Contenido |
|---|---|
| Precondición | Base «reportes». Mismo periodo del 15/10 al 03/12 |
| Pasos | 1. Abrir la sección de más vendidos. 2. Revisar el orden y los montos |
| Resultado esperado | De mayor a menor por unidades: Paracetamol 500 mg **30 u. S/ 15.00**, Amoxicilina 500 mg **9 u. S/ 10.80** e Ibuprofeno 400 mg **8 u. S/ 6.40**. Los montos suman S/ 32.20 |

### CP-HU09-3 — Periodo sin ventas (HU-09 CA3)

| Campo | Contenido |
|---|---|
| Precondición | Base «reportes»; en septiembre de 2026 no hay ventas |
| Pasos | 1. Elegir desde **01/09/2026** hasta **30/09/2026**. 2. Generar el reporte de ingresos y el de más vendidos |
| Resultado esperado | En ambos se indica que no hay datos y los totales son **S/ 0.00**. La API responde `200`: ingresos con el mes 2026-09 en 0 y más vendidos con `productos` vacío |

### CP-HU09-4 — Fechas inválidas (complementario, contrato de la API)

| Campo | Contenido |
|---|---|
| Precondición | *Por periodo* abierta |
| Pasos | (a) Elegir inicio 03/12/2026 y fin 15/10/2026. (b) Dejar una de las dos fechas vacía |
| Resultado esperado | (a) «La fecha de inicio no puede ser posterior a la de fin.» (b) «Elija la fecha de inicio y la de fin.» En ambos casos no se muestra ningún reporte |

## Pruebas finales (1–2/12)

La regresión de los Sprints 1–3, la instalación definitiva, la prueba de usabilidad y la copia en USB se redactan en una sección aparte antes del congelamiento.

## Defectos

Los errores se registran como issues con la etiqueta `bug`, con el formato de la sección 8 del [plan de pruebas](plan-de-pruebas.md).
