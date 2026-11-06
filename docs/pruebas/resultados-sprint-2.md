# Resultados de las pruebas de aceptación — Sprint 2

Pruebas de aceptación de **HU-04 Registrar ingreso de lote** (#10), **HU-05 Validar duplicidad de lote** (#11) y **HU-08 Consultar stock** (#12), según los casos de [`casos-sprint-2.md`](casos-sprint-2.md) y el [plan de pruebas](plan-de-pruebas.md). Las capturas están en [`evidencias-s2/`](evidencias-s2/). Las pruebas son del issue #13.

Estados posibles: **Pendiente** (aún no se ejecuta), **Pasa**, **Falla** y **No verificado** (con el motivo).

## Datos de la prueba

Los 8 casos se ejecutaron el 06/11/2026 en la laptop de pruebas, **sin internet** (Wi-Fi apagado), con F12 abierto. Antes, un agente de QA los había ejecutado una vez con internet y también pasaron; esa ejecución no se usa como evidencia.

| Campo | HU-04 | HU-05 | HU-08 |
|---|---|---|---|
| Fecha | 06/11/2026 | 06/11/2026 | 06/11/2026 |
| Probado por | Luis | Luis | Luis |
| Rama o commit probado | `main` en el commit `aff993b`; el código de `app/`, `test/` y `scripts/` de la rama de pruebas es idéntico | Igual que HU-04 | Igual que HU-04 |
| Equipo y sistema operativo | Laptop de pruebas, Windows 11 Home (10.0.26200) | Igual que HU-04 | Igual que HU-04 |
| Node.js | v24.18.0 instalado en el equipo (no se usó el Node portátil: la carpeta `node/` no existe en esta laptop) | Igual que HU-04 | Igual que HU-04 |
| Navegador | Brave 1.99.55 (Chromium 157.0.8103.39, 64 bits) | Igual que HU-04 | Igual que HU-04 |
| Internet | Sin conexión (Wi-Fi apagado) | Igual que HU-04 | Igual que HU-04 |
| Base de datos | Base nueva con Paracetamol 500 mg y Amoxicilina 500 mg, sin lotes | Base nueva, igual que HU-04 | `datos/prueba-stock.db` de `npm run datos-prueba-stock` (300 productos, 904 lotes) |

Cada base se levantó con una ayuda temporal local (`datos/lanzar-prueba.js`, ignorada por Git) que inicia la app real en `http://localhost:3000` con la base de la historia. No se tocó `datos/farmasil.db`.

## Resultados por criterio de aceptación

### HU-04 — Registrar ingreso de lote

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU04-1 | CA1 — Ingreso de un lote de un producto existente | El lote se guarda y el stock aumenta en esa cantidad | Base de arranque sin lotes (stock 0). Aviso «Ingreso registrado: lote L-2411 de Paracetamol 500 mg, 100 unidades.» y formulario limpio. En *Consultar stock*, Paracetamol 500 mg a S/ 0.50 con stock 100 (0 + 100) y el lote L-2411, vence 10/12/2026, 100 u. | **Pasa** | `evidencias-s2/CP-HU04-1.png`, `evidencias-s2/CP-HU04-1-stock.png` |
| CP-HU04-2 | CA2 — «+ Nuevo producto» sin salir del flujo | El producto se registra y queda seleccionado | El alta se hizo en la misma pantalla *Ingreso de lotes*. Aviso «Producto «Micodin» guardado y seleccionado.» y el producto queda elegido en el selector. En una segunda alta, «Ibuprofeno 400ml» a S/ 0.80, se registró el lote L-2312 (vence 01/02/2027, 50 u.) y *Consultar stock* lo muestra a S/ 0.80 con stock 50 | **Pasa** | `evidencias-s2/CP-HU04-2.png`, `evidencias-s2/CP-HU04-2-stock.png` |
| CP-HU04-3 | CA3 — Dato faltante o cantidad no mayor que cero | No se registra y se indica el dato inválido | Según quien probó, las cinco variantes (a a e) se rechazaron sin registrar nada. La captura muestra la variante (d), cantidad 0: «La cantidad debe ser mayor que cero.» junto al campo. Stock de Paracetamol 500 mg sin cambio: 100 | **Pasa** | `evidencias-s2/CP-HU04-3.png`, `evidencias-s2/CP-HU04-3-stock.png` |

### HU-05 — Validar duplicidad de lote

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU05-1 | CA1 — Lote duplicado en el mismo producto | Se rechaza con aviso y el stock no cambia | Con Amoxicilina 500 mg, que ya tenía el lote L-2309 (10 u.), un segundo ingreso del mismo número se rechaza con «El lote L-2309 ya está registrado para este producto.» junto al campo. El stock sigue en 10 y hay un solo lote L-2309 | **Pasa** | `evidencias-s2/CP-HU05-1.png`, `evidencias-s2/CP-HU05-1-stock.png` |
| CP-HU05-2 | CA2 — Mismo lote en otro producto | Se acepta | Con L-2309 ya registrado en Amoxicilina (10 u.), el mismo número en Paracetamol 500 mg se acepta: «Ingreso registrado: lote L-2309 de Paracetamol 500 mg, 4 unidades.». Paracetamol queda en 4 (0 + 4) y Amoxicilina sigue en 10 | **Pasa** | `evidencias-s2/CP-HU05-2.png`, `evidencias-s2/CP-HU05-2-stock.png` |

**Cómo se ejecutó HU-04 y HU-05.** En la pantalla *Ingreso de lotes* con una base nueva que solo tenía los productos Paracetamol 500 mg (S/ 0.50, Analgésico, genérico) y Amoxicilina 500 mg (S/ 1.20, Antibiótico, genérico), sin lotes. Se partió de una base limpia para cada historia. Los stocks finales se leyeron en la pantalla *Consultar stock*.

**Observaciones.**
- Los datos usados no son los de los casos: en CP-HU04-1 el lote vence el 10/12/2026 (el caso decía 30/11/2027); en CP-HU04-2 se dieron de alta «Micodin» e «Ibuprofeno 400ml» y el lote fue L-2312 (el caso decía «Ibuprofeno 400 mg» y L-3001); en CP-HU04-3 la variante (d) se probó con Ibuprofeno 400ml; y en CP-HU05-1 y CP-HU05-2 los productos están invertidos respecto al caso (duplicado en Amoxicilina con 10 u., lote aceptado en Paracetamol con 4 u.). Cada criterio se verificó igual con esos datos.
- La captura `CP-HU04-1-stock.png` también muestra Amoxicilina 500 mg con stock 100, dato que no pertenece al caso.
- En la captura de CP-HU04-3 la fecha de vencimiento es `10/12/1212` y el formulario no marca error en ese campo. El criterio CA3 no pide validar fechas absurdas, así que no cuenta como fallo, pero conviene valorar si merece un issue.
- Los textos finales difieren del boceto con el mismo sentido: el aviso de duplicado no añade «No se modificó el stock» y la confirmación es «Ingreso registrado: lote L-xxxx de <producto>, <n> unidades.».
- De CP-HU04-3 solo hay captura de la variante (d); las variantes a, b, c y e las confirma quien probó, sin captura.

### HU-08 — Consultar stock

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU08-1 | CA1 — Búsqueda por nombre | Precio y stock total en menos de 2 segundos | Al buscar `parac` aparecen 12 productos; «Paracetamol 500 mg» figura a S/ 8.15 con stock total 131. La petición `GET /api/stock?nombre=paracetamol` tardó 22 ms (ver tiempo de respuesta). El paso de la búsqueda sin resultados (`zzz`) no tiene captura | **Pasa** | `evidencias-s2/CP-HU08-1.png`, `evidencias-s2/F12-red-busqueda-paracetamol.png` |
| CP-HU08-2 | CA2 — Detalle por lote | Lotes con vencimiento y cantidad, del más próximo al más lejano | Paracetamol 500 mg: L-3-2 (06/06/2027, 115) y luego L-3-1 (16/05/2028, 16), suman 131. Amoxicilina 500 mg (S/ 33.59): L-63-2 (12/08/2028, 49) y luego L-63-1 (23/11/2029, 151), suman 200. Los lotes se despliegan al hacer clic en el nombre | **Pasa** | `evidencias-s2/CP-HU08-2.png` |
| CP-HU08-3 | CA3 — Filtros de categoría y tipo | Solo se muestran los productos que cumplen el filtro | Con Analgésico y Comercial a la vez aparecen 11 productos (5 Metamizol y 6 Paracetamol), todos analgésicos comerciales. Las demás combinaciones del caso (24, 48, 150, 150 y 300) no tienen captura | **Pasa** | `evidencias-s2/CP-HU08-3.png` |

### Tiempo de respuesta de la búsqueda (HU-08 CA1)

La medición en pantalla se hizo con F12 → Red al buscar `paracetamol` en *Consultar stock*, con la base de 300 productos y 904 lotes. Además, `npm run datos-prueba-stock` midió la API (`GET /api/stock`), el peor de 5 intentos por búsqueda:

| Búsqueda | Tiempo | ¿Menos de 2 s? | Evidencia |
|---|---|---|---|
| `paracetamol` en pantalla (F12 → Red) | 22 ms la petición `GET /api/stock?nombre=paracetamol` (estado 200, 4.5 kB) | Sí | `evidencias-s2/F12-red-busqueda-paracetamol.png` |
| API: listado completo (300 productos) | 52.7 ms | Sí | Salida de `npm run datos-prueba-stock` |
| API: nombre «para» (12 productos) | 16.1 ms | Sí | Ídem |
| API: categoría Antibiótico (48 productos) | 19.6 ms | Sí | Ídem |
| API: nombre, categoría y tipo a la vez (4 productos) | 16.5 ms | Sí | Ídem |

El buscador espera 300 ms tras la última tecla antes de enviar la petición, así que la lista cambia unos 320 ms después de dejar de escribir (300 ms + 22 ms). Ese total es una estimación, no un cronometraje; en una prueba anterior con un script de la página se midieron unos 314 ms. Con cualquiera de los dos queda muy por debajo de los 2 s.

### Revisión con F12 (Consola y Red)

| Revisión | Resultado | Evidencia |
|---|---|---|
| Consola | Sin mensajes ni errores en la captura | `evidencias-s2/F12-consola-limpia.png` |
| Pestaña Issues del navegador | Un aviso informativo: «A form field element has neither an `id` nor a `name` attribute» (afecta solo al autocompletado). Sin errores ni advertencias | Revisado por quien probó, sin captura archivada |
| Red | La petición de búsqueda va a la API local y responde 200. La captura de Red solo muestra esa petición | `evidencias-s2/F12-red-busqueda-paracetamol.png` |

No se capturó la consola durante cada caso ni el `409` del lote duplicado de CP-HU05-1.

### Stock = ingresos − ventas

| Comprobación | Resultado | Estado |
|---|---|---|
| El stock mostrado es la suma exacta de los ingresos de lotes en todos los casos (en este sprint no hay ventas) | 0 + 100 = 100 (CP-HU04-1), 50 (CP-HU04-2), 100 sin cambio (CP-HU04-3), 10 sin cambio (CP-HU05-1), 0 + 4 = 4 y Amoxicilina 10 (CP-HU05-2), 115 + 16 = 131 y 49 + 151 = 200 (CP-HU08-2). Sin diferencias. La parte «− ventas» se comprueba en el Sprint 3 | **Pasa** |

## Defectos encontrados

En los 8 casos ejecutados no apareció ningún defecto, y el repositorio no tiene issues `bug` abiertos ni cerrados. El aviso de F12 sobre el campo sin `id` ni `name` y la fecha `10/12/1212` sin marcar son observaciones, no defectos de los criterios de aceptación.

| Issue | Caso | Severidad | Descripción | Estado |
|---|---|---|---|---|
| — | — | — | Sin defectos | — |

## Revisión de los PR del sprint

Cada PR se revisa contra los criterios de aceptación de su historia.

| PR | Historia | Revisado por | Resultado |
|---|---|---|---|
| #53 API de ingreso de lote | HU-04 | kevinPedroYare (aprobó) | Fusionado. Su comportamiento queda cubierto por CP-HU04-1 y CP-HU04-3 |
| #54 Validaciones del servidor | HU-04 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado. Cubierto por CP-HU04-3 |
| #57 API de productos | HU-04 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado. Cubierto por CP-HU04-2 |
| #60 Pantalla W2 | HU-04 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado. Cubierto por CP-HU04-1 |
| #62 Avisos junto al campo en W2 | HU-04 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado. Cubierto por CP-HU04-3 y CP-HU05-1 |
| #64 Alta rápida de producto en W2 | HU-04 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado. Cubierto por CP-HU04-2 |
| #58 Rechazo de lote duplicado | HU-05 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado. Cubierto por CP-HU05-1 y CP-HU05-2 |
| #65 Pruebas de la API de lote duplicado | HU-05 | kevinPedroYare (aprobó) | Fusionado. `npm test`: 35 pruebas, 35 pasan |
| #67 Cierre de HU-04 y HU-05 en el changelog | HU-04 y HU-05 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado el 06/11/2026 (4428aac). `npm test`: 35 pruebas, 35 pasan |
| #55 Datos de prueba de la búsqueda | HU-08 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado. Su script generó la base de CP-HU08-1 a 3 |
| #56 API de consulta de stock | HU-08 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado. Cubierto por CP-HU08-1 a 3 |
| #59 Medición de la búsqueda con la base de prueba | HU-08 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado. Repetida: peor caso 52.7 ms |
| #61 Pantalla W3 de consulta de stock | HU-08 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado. Cubierto por CP-HU08-1 |
| #63 Detalle por lote desplegable en W3 | HU-08 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado. Cubierto por CP-HU08-2 |
| #66 Filtros por categoría y tipo en W3 | HU-08 | Luis-Ayben-Chahua-Charca (aprobó) | Fusionado. Cubierto por CP-HU08-3 |

## Conclusión

Se ejecutaron los 8 casos de HU-04, HU-05 y HU-08 el 06/11/2026 en la laptop de pruebas, sin internet, con Brave 1.99.55: los 8 **pasan** y no se registró ningún defecto. Se cumplen los criterios de aceptación de las tres historias, y el stock mostrado coincidió siempre con la suma de los ingresos; la parte «− ventas» queda para el Sprint 3. La búsqueda respondió en 22 ms, muy por debajo de los 2 s.

Las pruebas se ejecutaron después de la Review del miércoles 4/11, y antes de ella no se registró ningún defecto. Limitaciones: se usó el Node instalado y no el portátil; algunos datos difieren de los de los casos (ver observaciones); y varios pasos no tienen captura (variantes a, b, c y e de CP-HU04-3, la búsqueda `zzz` de CP-HU08-1 y las demás combinaciones de filtros de CP-HU08-3).
