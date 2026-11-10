# Resultados de las pruebas de aceptación — Sprint 3

Pruebas de aceptación de **HU-01 Registrar venta** (#14), **HU-02 Descuento por lote más próximo a vencer** (#15) y **HU-07 Clasificar productos** (#21), según los casos de [`casos-sprint-3.md`](casos-sprint-3.md) y el [plan de pruebas](plan-de-pruebas.md). Las capturas van en [`evidencias-s3/`](evidencias-s3/). Las pruebas son del issue #16.

Estados posibles: **Pendiente** (aún no se ejecuta), **Pasa**, **Falla** y **No verificado** (con el motivo).

## Datos de la prueba

| Campo | HU-01 | HU-02 | HU-07 |
|---|---|---|---|
| Fecha | Pendiente | Pendiente | Pendiente |
| Probado por | Kevin | Kevin | Kevin |
| Rama o commit probado | Pendiente | Pendiente | Pendiente |
| Equipo y sistema operativo | Pendiente | Pendiente | Pendiente |
| Node.js | Node portátil de `iniciar.bat` (versión pendiente) | Igual que HU-01 | Igual que HU-01 |
| Navegador | Pendiente | Pendiente | Pendiente |
| Internet | Sin conexión | Sin conexión | Sin conexión |
| Base de datos | Base «ventas» de `casos-sprint-3.md` | Base «ventas» | `datos/prueba-stock.db` (CP-HU07-1 y 2) y base «ventas» (CP-HU07-3) |

## Resultados por criterio de aceptación

### HU-01 — Registrar venta

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU01-1 | CA1 — Venta confirmada | `201` con fecha y hora local, líneas y monto S/ 6.00; una sola venta con doble clic; stock 56 → 51 | | Pendiente | |
| CP-HU01-2 | CA2 — Cantidad mayor que el stock | «Solo hay 4 unidades disponibles.»; la línea no se agrega; stock sigue en 4 | | Pendiente | |
| CP-HU01-3 | CA3 — Total de la venta | Total S/ 9.80 en pantalla y `monto_total_centimos: 980` | | Pendiente | |
| CP-HU01-4 | CA4 — Cancelar la venta | Carrito vacío, ninguna petición a `/api/ventas`, stock sin cambio | | Pendiente | |

### HU-02 — Descuento por lote más próximo a vencer

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU02-1 | CA1 — Descuento entre lotes | 6 u. = 4 de `L-2309` + 2 de `L-2411`; desempates de Loratadina y Omeprazol según el caso | | Pendiente | |
| CP-HU02-2 | CA2 — Lote en cero | 3 u. solo de `L-2411`; `L-2309` sigue en 0 | | Pendiente | |

### HU-07 — Clasificar productos

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU07-1 | CA1 — Genéricos en orden alfabético | 150 genéricos, de Albendazol 1 g a Salbutamol 500 mg, en menos de 2 s | | Pendiente | |
| CP-HU07-2 | CA2 — Comerciales por acción terapéutica | 150 productos en 12 grupos en orden alfabético (Antiácido segundo) | | Pendiente | |
| CP-HU07-3 | CA3 — Alta sin tipo | Aviso bajo el selector y ninguna petición hasta elegir el tipo | | Pendiente | |

## Regresión de los Sprints 1 y 2

| ID | Qué se repite | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| R-1 | Menú y tiempo de pantallas (HT-01) | Cinco opciones, cada pantalla en menos de 2 s | | Pendiente |
| R-2 | Ingreso de lote con ventas previas (HU-04) | Amoxicilina 51 + 10 = 61 | | Pendiente |
| R-3 | Lote duplicado (HU-05) | Rechazo de `L-2309`; stock sigue en 85 | | Pendiente |
| R-4 | Detalle por lote con ventas (HU-08) | Recibido − vendido en cada lote | | Pendiente |
| R-5 | Búsqueda y filtros (HU-08) | Menos de 2 s; 11 productos con Analgésico + Comercial | | Pendiente |

### Stock = ingresos − ventas

| Producto | Esperado al final (paso 9) | Obtenido | Estado |
|---|---|---|---|
| Paracetamol 500 mg | 85 (A 0, B 85) | | Pendiente |
| Amoxicilina 500 mg | 61 | | Pendiente |
| Ibuprofeno 400 mg | 4 | | Pendiente |
| Loratadina 10 mg | 35 (`L-6001` 15, `L-6002` 20) | | Pendiente |
| Omeprazol 20 mg | 17 (`L-7001` 7, `L-7002` 10) | | Pendiente |

## Pruebas automáticas

| Prueba | Issue | Resultado de `npm test` | Estado |
|---|---|---|---|
| `test/asignar-lotes.test.js` | #72 | | Pendiente |
| `test/ventas-aceptacion.test.js` | #78 | | Pendiente |
| `test/ventas-lotes.test.js` | #79 | | Pendiente |
| `test/productos.test.js` (tipo obligatorio) | #81 | | Pendiente |

## Observaciones de QA

| N.º | Observación | Decisión |
|---|---|---|
| O-1 | La regla de asignación (`app/ventas/asignar-lotes.js`, #72) también vende lotes **ya vencidos**; ningún criterio lo prohíbe, pero la técnica podría vender un medicamento vencido sin aviso | Pendiente: decidir con la propietaria si se registra como `bug` o como historia nueva |

## Defectos encontrados

| Issue | Caso | Severidad | Descripción | Estado |
|---|---|---|---|---|
| — | — | — | Pendiente de ejecución | — |

## Revisión de los PR del sprint

Cada PR se revisa contra los criterios de aceptación de su historia.

| PR | Issue | Revisado por | Resultado |
|---|---|---|---|
| #86 | #72 Asignación de lotes por vencimiento | Jose (aprobado y fusionado el 9/11); revisión de QA pendiente | `npm test` en `main`: 42 de 42. Ver O-1 |
