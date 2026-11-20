# Resultados de las pruebas de aceptación — Sprint 3

Pruebas de aceptación de **HU-01 Registrar venta** (#14), **HU-02 Descuento por lote más próximo a vencer** (#15) y **HU-07 Clasificar productos** (#21), según los casos de [`casos-sprint-3.md`](casos-sprint-3.md) y el [plan de pruebas](plan-de-pruebas.md). Las capturas y las salidas de la ejecución están en [`evidencias-s3/`](evidencias-s3/). Las pruebas son del issue #16.

Estados posibles: **Pendiente** (aún no se ejecuta), **Pasa**, **Falla** y **No verificado** (con el motivo).

**Resumen:** los 9 casos de aceptación y los 5 de regresión **pasan**; el stock final coincide con lo esperado en los 5 productos y no se encontró ningún defecto en los criterios. Quedan 3 observaciones (O-1 a O-3), ninguna bloquea el cierre.

## Datos de la prueba

Los casos se ejecutaron el 20/11/2026 con los PR de cierre de las tres historias abiertos (#99, #100 y #101), sobre `main` en el commit `19caa0e`, que ya contiene todo su código: esos tres PR solo cambian el `CHANGELOG.md`.

| Campo | HU-01 | HU-02 | HU-07 |
|---|---|---|---|
| Fecha | 20/11/2026 | 20/11/2026 | 20/11/2026 |
| Probado por | Kevin | Kevin | Kevin |
| Rama o commit probado | `main` en `19caa0e` (PR #99 abierto) | `main` en `19caa0e` (PR #100 abierto) | `main` en `19caa0e` (PR #101 abierto) |
| Equipo y sistema operativo | Laptop de desarrollo, Windows 11 Pro | Igual que HU-01 | Igual que HU-01 |
| Node.js | v24.19.0 instalado (la carpeta `node/` del Node portátil no existe en este equipo; `iniciar.bat` usa el instalado en ese caso) | Igual que HU-01 | Igual que HU-01 |
| Navegador | Google Chrome, sin cabecera, con un script de pruebas que maneja las pantallas reales | Igual que HU-01 | Igual que HU-01 |
| Internet | Solo `127.0.0.1`: 0 peticiones fuera de `localhost` en 40 peticiones de las pantallas | Igual que HU-01 | Igual que HU-01 |
| Base de datos | Base «ventas» de `casos-sprint-3.md`, en memoria, cargada por la API en el orden de registro | Igual que HU-01 | `datos/prueba-stock.db` (CP-HU07-1 y 2) y base «ventas» (CP-HU07-3) |

No se tocó `datos/farmasil.db`. La ejecución siguió el «Orden de ejecución» de los casos, pasos 0 a 9, en un solo recorrido.

## Resultados por criterio de aceptación

### HU-01 — Registrar venta

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU01-1 | CA1 — Venta confirmada | `201` con fecha y hora local, líneas y monto S/ 6.00; una sola venta con doble clic; stock 56 → 51 | Con doble clic en **Confirmar venta** salió **una sola** petición `POST /api/ventas`: `201`, `fecha_hora` `2026-11-20 13:17:45` (hora local), línea `L-3001` × 5, `monto_total_centimos` 600. Aviso «Venta registrada: S/ 6.00.» y carrito vacío. Stock de Amoxicilina **51** | **Pasa** | `ejecucion-ventas.txt`, paso 7 |
| CP-HU01-2 | CA2 — Cantidad mayor que el stock | «Solo hay 4 unidades disponibles.»; la línea no se agrega; stock sigue en 4 | (a) 5 u. → «Solo hay 4 unidades disponibles.», sin línea y con el 5 escrito. (b) Con 3 en el carrito, 2 más → «Solo hay 1 unidad disponible.». (c) Vacío, 0, −1 y 2.5 → «La cantidad debe ser mayor que cero.». Stock de Ibuprofeno **4** | **Pasa** | `CP-HU01-2-aviso.png`, `ejecucion-ventas.txt`, paso 8 |
| CP-HU01-3 | CA3 — Total de la venta | Total S/ 9.80 en pantalla y `monto_total_centimos: 980` | Subtotales S/ 5.00 y S/ 4.80, **Total: S/ 9.80**. Al quitar Amoxicilina, S/ 5.00; al volver a agregarla, S/ 9.80. Al confirmar, «Venta registrada: S/ 9.80.» y monto **980**. Stock Paracetamol 85 y Amoxicilina 56 | **Pasa** | `CP-HU01-3-total.png`, `ejecucion-ventas.txt`, paso 6 |
| CP-HU01-4 | CA4 — Cancelar la venta | Carrito vacío, ninguna petición a `/api/ventas`, stock sin cambio | Al inicio, Confirmar y Cancelar deshabilitados y «Agregue productos para iniciar la venta.». Con el carrito en S/ 9.80, **Cancelar venta** lo vacía, **0** peticiones a `/api/ventas`, stock Paracetamol **104** y Amoxicilina **60** | **Pasa** | `ejecucion-ventas.txt`, paso 1 |

### HU-02 — Descuento por lote más próximo a vencer

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU02-1 | CA1 — Descuento entre lotes | 6 u. = 4 de `L-2309` + 2 de `L-2411`; desempates de Loratadina y Omeprazol según el caso | (a) 6 de Paracetamol → líneas **`L-2309`:4 + `L-2411`:2**, S/ 3.00; lotes 0 y 98. (b) 5 de Loratadina → solo **`L-6001`** (vence antes, registrado después): 15 y 20. (c) 3 de Omeprazol, mismo vencimiento → **`L-7001`** (registrado primero): 7 y 10 | **Pasa** | `CP-HU02-lotes.png`, `ejecucion-ventas.txt`, pasos 2, 4 y 5 |
| CP-HU02-2 | CA2 — Lote en cero | 3 u. solo de `L-2411`; `L-2309` sigue en 0 | Una sola línea, **`L-2411`:3**, ninguna de `L-2309`. Lotes 0 y 95, total 95 | **Pasa** | `ejecucion-ventas.txt`, paso 3 |

### HU-07 — Clasificar productos

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU07-1 | CA1 — Genéricos en orden alfabético | 150 genéricos, de Albendazol 1 g a Salbutamol 500 mg, en menos de 2 s | **150** productos de **Albendazol 1 g** a **Salbutamol 500 mg**, en orden alfabético y sin filas de grupo. Respuesta en 10 ms | **Pasa** | `CP-HU07-1-genericos.png`, `ejecucion-hu07-busqueda.txt` |
| CP-HU07-2 | CA2 — Comerciales por acción terapéutica | 150 productos en 12 grupos en orden alfabético (Antiácido segundo) | **150** productos en **12** grupos: Analgésico (11), **Antiácido (13)**, Antibiótico (23)… Corticoide (11), igual que en los datos de prueba. Productos ordenados dentro de cada grupo; Analgésico empieza por **Metamizol 10 mg**. El detalle por lote abre y cierra. Con Todos vuelven los 300, sin grupos | **Pasa** | `CP-HU07-2-comerciales.png`, `ejecucion-hu07-busqueda.txt` |
| CP-HU07-3 | CA3 — Alta sin tipo | Aviso bajo el selector y ninguna petición hasta elegir el tipo | Sin tipo: «Elija si el producto es genérico o comercial.» bajo el selector, **0** peticiones a `POST /api/productos` y lo escrito se conserva. Con Comercial: «Producto «Cetirizina 10 mg» guardado y seleccionado.» y aparece entre los comerciales. La API sin tipo responde `400` con `campo: "tipo"` | **Pasa** | `CP-HU07-3-sin-tipo.png`, `ejecucion-ventas.txt` |

## Regresión de los Sprints 1 y 2

| ID | Qué se repite | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| R-1 | Menú y tiempo de pantallas (HT-01) | Cinco opciones, cada pantalla en menos de 2 s | Menú con las cinco opciones (`R-1-menu.png`); las pantallas se abrieron en menos de 1 s durante toda la ejecución. Con Node instalado, no con el portátil (ver «Datos de la prueba») | **Pasa** |
| R-2 | Ingreso de lote con ventas previas (HU-04) | Amoxicilina 51 + 10 = 61 | `L-3002` registrado (`201`); stock **61** | **Pasa** |
| R-3 | Lote duplicado (HU-05) | Rechazo de `L-2309`; stock sigue en 85 | `409` «El lote L-2309 ya está registrado para este producto.»; stock **85** | **Pasa** |
| R-4 | Detalle por lote con ventas (HU-08) | Recibido − vendido en cada lote | Paracetamol 0 y 85; Loratadina `L-6001` 15 y `L-6002` 20; Omeprazol 7 y 10; Amoxicilina 51 y 10 (`CP-HU02-lotes.png`) | **Pasa** |
| R-5 | Búsqueda y filtros (HU-08) | Menos de 2 s; 11 productos con Analgésico + Comercial | «Paracetamol»: 12 productos en 10 ms. Analgésico + Comercial: **11** productos. Peor tiempo de la API con 300 productos: 38.1 ms | **Pasa** |

### Stock = ingresos − ventas

| Producto | Esperado al final (paso 9) | Obtenido | Estado |
|---|---|---|---|
| Paracetamol 500 mg | 85 (A 0, B 85) | 85 (`L-2309` 0, `L-2411` 85) | **Pasa** |
| Amoxicilina 500 mg | 61 | 61 (`L-3001` 51, `L-3002` 10) | **Pasa** |
| Ibuprofeno 400 mg | 4 | 4 | **Pasa** |
| Loratadina 10 mg | 35 (`L-6001` 15, `L-6002` 20) | 35 (`L-6001` 15, `L-6002` 20) | **Pasa** |
| Omeprazol 20 mg | 17 (`L-7001` 7, `L-7002` 10) | 17 (`L-7001` 7, `L-7002` 10) | **Pasa** |

## Pruebas automáticas

`npm test` en `main` (`19caa0e`): **72 pruebas, 72 pasan**.

| Prueba | Issue | Resultado de `npm test` | Estado |
|---|---|---|---|
| `test/asignar-lotes.test.js` | #72 | En verde | **Pasa** |
| `test/ventas-aceptacion.test.js` | #78 | 6 de 6 | **Pasa** |
| `test/ventas-lotes.test.js` | #79 | 4 de 4 | **Pasa** |
| `test/productos.test.js` (tipo obligatorio) | #81 | En verde | **Pasa** |

## Observaciones de QA

| N.º | Observación | Decisión |
|---|---|---|
| O-1 | La regla de asignación (`app/ventas/asignar-lotes.js`, #72) también vende lotes **ya vencidos**, y como van primero, saldrían antes que los vigentes. Ningún criterio lo prohíbe | Comentada en #15 el 10/11, sin respuesta. Pendiente de decidir en la Review del Sprint 3: excluirlos, avisar en W1 o crear una historia para el Sprint 4 |
| O-2 | En W1 el campo **Cantidad** es muy angosto (unos 60 px): el aviso «Solo hay 1 unidad disponible.» se parte en tres líneas (`CP-HU01-2-aviso.png`). Afecta la lectura (RNF-04), no los criterios | Mejora sugerida para el Sprint 4; no bloquea |
| O-3 | En W1, presionar **Agregar** sin haber elegido un producto de la lista no hace nada ni muestra aviso | Mejora sugerida: un aviso «Elija un producto de la lista.» |

## Defectos encontrados

En los 9 casos de aceptación y los 5 de regresión no apareció ningún defecto, y el repositorio no tiene issues `bug` abiertos. O-1 a O-3 son observaciones, no defectos de los criterios de aceptación.

| Issue | Caso | Severidad | Descripción | Estado |
|---|---|---|---|---|
| — | — | — | Sin defectos | — |

## Revisión de los PR del sprint

Cada PR se revisó contra los criterios de aceptación de su historia, con los casos de arriba.

| PR | Issue | Aprobado por | Resultado de QA |
|---|---|---|---|
| #85 | #84 Entorno del sprint | Oscar | Sin observaciones |
| #86 | #72 Asignación de lotes | Jose | Cumple HU-02 CA1 y CA2 (CP-HU02-1 y 2). Ver O-1 |
| #88 | #73 API de venta | Jose | Cumple HU-01 CA1 y CA3 (CP-HU01-1 y 3; `test/ventas-aceptacion.test.js`) |
| #89 | #82 Orden por tipo en W3 | Luis | Cumple HU-07 CA1 y CA2; Antiácido sale segundo (CP-HU07-1 y 2) |
| #90 | #74 Rechazo por stock insuficiente | Jose | Cumple HU-01 CA2 en la API (`409` con `disponible`) |
| #91 | #79 Pruebas del descuento en la venta | Luis | 4 de 4 en verde |
| #92 | #78 Pruebas de la API de ventas | Jose | 6 de 6 en verde |
| #93 | #71 Boceto W1 | Luis | Cumple el boceto. **Trazabilidad:** dice `Closes #37` (tarea del Sprint 2) y el título `Docs/37 boceto w1` no sigue el formato; #71 se cerró a mano |
| #94 | #75 Pantalla W1 | Kevin | Cumple CP-HU01-3. **Trazabilidad:** dice `Closes #41` (tarea del Sprint 2); #75 se cerró a mano. Ver O-2 y O-3 |
| #95 | #76 Aviso de stock en W1 | Kevin | Cumple CP-HU01-2 |
| #96 | #77 Confirmar y cancelar | Jose | Cumple CP-HU01-1 y 4; doble clic = una sola venta. **Trazabilidad:** título `Feat/43 confirmar venta` y rama `feat/43-…` |
| #97 | #81 Tipo obligatorio en la API | Kevin | Cumple HU-07 CA3 en la API (`400` con `campo: "tipo"`) |
| #98 | #80 Tipo en el alta rápida de W2 | Jose | Cumple CP-HU07-3 |
| #99 | #14 Cierre de HU-01 | Pendiente | CA1 a CA4 verificados: se puede aprobar |
| #100 | #15 Cierre de HU-02 | Pendiente | CA1 y CA2 verificados: se puede aprobar (O-1 queda para la Review) |
| #101 | #21 Cierre de HU-07 | Pendiente | CA1 a CA3 verificados: se puede aprobar |

## Traspaso al QA del Sprint 4 (Jose)

Casos para repetir en las pruebas finales del 1 y 2 de diciembre:

- **CP-HU01-3** (S/ 9.80) y **CP-HU02-1** (4 + 2 entre lotes): los casos numéricos del plan de pruebas.
- **CP-HU01-1** con doble clic: protege contra ventas duplicadas.
- **R-4 y el stock final**: comprueban stock = ingresos − ventas con varios lotes.
- **Con el Node portátil**: esta ejecución usó Node instalado. La instalación final en la laptop debe probarse con `iniciar.bat` y la carpeta `node/`.
