# Resultados de las pruebas de aceptación — Sprint 2

Pruebas de aceptación de **HU-04 Registrar ingreso de lote** (#10), **HU-05 Validar duplicidad de lote** (#11) y **HU-08 Consultar stock** (#12), según los casos de [`casos-sprint-2.md`](casos-sprint-2.md) y el [plan de pruebas](plan-de-pruebas.md). Las capturas van en `evidencias-s2/` (se crea al agregar la primera captura). Las pruebas son del issue #13.

Estados posibles: **Pendiente** (aún no se ejecuta), **Pasa**, **Falla** y **No verificado** (con el motivo).

## Datos de la prueba

Se completa al ejecutar cada historia. Las pruebas de HU-04 y HU-05 las ejecutó un agente de QA de apoyo; Luis debe repetir en la laptop la parte que el agente no pudo verificar (sin internet, F12 y capturas) y ajustar el campo «Probado por».

| Campo | HU-04 | HU-05 | HU-08 |
|---|---|---|---|
| Fecha | 06/11/2026 | 06/11/2026 | Pendiente |
| Probado por | Agente de QA (revisado por Luis) | Agente de QA (revisado por Luis) | Pendiente |
| Rama o commit probado | `main` en el commit `aff993b` (con #36 a #48 y #64 a #66 fusionados) | `main` en el commit `aff993b` | Pendiente |
| Equipo y sistema operativo | Equipo de desarrollo, Windows 11 Pro (10.0.26200) | Igual que HU-04 | Pendiente |
| Node.js portátil | v24.18.0 instalado en el equipo (no se usó el Node portátil) | Igual que HU-04 | Pendiente |
| Navegador | Navegador integrado de la app de escritorio de Claude (versión no registrada) | Igual que HU-04 | Pendiente |
| Internet | Conectado: no se probó sin internet. Todo el tráfico fue a `localhost` | Igual que HU-04 | Pendiente |

## Resultados por criterio de aceptación

### HU-04 — Registrar ingreso de lote

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU04-1 | CA1 — Ingreso de un lote de un producto existente | El lote se guarda y el stock aumenta en esa cantidad | Stock inicial 0. Aviso «Ingreso registrado: lote L-2411 de Paracetamol 500 mg, 100 unidades.», formulario limpio. Stock final 100 (`GET /api/stock`), con el lote L-2411, vence 2027-11-30, 100 u. | **Pasa** | Pendiente de confirmar por Luis |
| CP-HU04-2 | CA2 — «+ Nuevo producto» sin salir del flujo | El producto se registra y queda seleccionado | El alta se despliega en la misma pantalla (`#/ingreso-lotes`). Aviso «Producto «Ibuprofeno 400 mg» guardado y seleccionado.» y queda seleccionado en el selector. Lote L-3001 (50 u.) registrado. Stock 50, precio 80 céntimos (S/ 0.80) | **Pasa** | Pendiente de confirmar por Luis |
| CP-HU04-3 | CA3 — Dato faltante o cantidad no mayor que cero | No se registra y se indica el dato inválido | Stock inicial 100. (a) sin fecha: «Ingrese la fecha de vencimiento.»; (b) sin lote: «Ingrese el número de lote.»; (c) sin cantidad: «Ingrese la cantidad.»; (d) cantidad 0 y (e) cantidad −5: «La cantidad debe ser mayor que cero.». Cada aviso sale junto al campo. Stock final 100 | **Pasa** | Pendiente de confirmar por Luis |

### HU-05 — Validar duplicidad de lote

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU05-1 | CA1 — Lote duplicado en el mismo producto | Se rechaza con aviso y el stock no cambia | Stock inicial 4 (L-2309). El segundo ingreso se rechaza (HTTP 409) con «El lote L-2309 ya está registrado para este producto.» junto al campo. Stock final 4 y un solo lote L-2309 | **Pasa** | Pendiente de confirmar por Luis |
| CP-HU05-2 | CA2 — Mismo lote en otro producto | Se acepta | Stock inicial de Amoxicilina 0. L-2309 en Amoxicilina se acepta: «Ingreso registrado: lote L-2309 de Amoxicilina 500 mg, 20 unidades.». Amoxicilina 20 (0 + 20); Paracetamol sigue en 4 | **Pasa** | Pendiente de confirmar por Luis |

**Cómo se ejecutó HU-04 y HU-05.** En la pantalla *Ingreso de lotes* con un servidor local en el puerto 3055 y una base **en memoria** con solo los productos Paracetamol 500 mg (S/ 0.50, Analgésico, genérico) y Amoxicilina 500 mg (S/ 1.20, Antibiótico, genérico), sin lotes; el servidor se reinició entre HU-04 y HU-05 para partir de una base limpia. Los pasos se hicieron en la pantalla con scripts de la página (se llenaron los campos y se presionó el botón); los stocks se leyeron con `GET /api/stock`, no desde la pantalla *Consultar stock*.

**Observaciones.** Los textos finales difieren del boceto con el mismo sentido: el aviso de duplicado no añade «No se modificó el stock», y la confirmación es «Ingreso registrado: lote L-xxxx de <producto>, <n> unidades.». En F12 → Consola el `409` esperado de CP-HU05-1 aparece como «Failed to load resource: … 409 (Conflict)»; lo escribe el navegador y no es un fallo del código.

### HU-08 — Consultar stock

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU08-1 | CA1 — Búsqueda por nombre | Precio y stock total en menos de 2 segundos | Pendiente | Pendiente | Pendiente |
| CP-HU08-2 | CA2 — Detalle por lote | Lotes con vencimiento y cantidad, del más próximo al más lejano | Pendiente | Pendiente | Pendiente |
| CP-HU08-3 | CA3 — Filtros de categoría y tipo | Solo se muestran los productos que cumplen el filtro | Pendiente | Pendiente | Pendiente |

### Tiempo de respuesta de la búsqueda (HU-08 CA1)

Se mide con F12 → Red al buscar por nombre.

| Búsqueda | Tiempo | ¿Menos de 2 s? | Evidencia |
|---|---|---|---|
| `Paracetamol` | Pendiente | Pendiente | Pendiente |

### Stock = ingresos − ventas

| Comprobación | Resultado | Estado |
|---|---|---|
| El stock mostrado es la suma exacta de los ingresos de lotes en todos los casos (en este sprint no hay ventas) | Pendiente | Pendiente |

## Defectos encontrados

Pendiente. Cada defecto se registra como issue `bug` y se lista aquí con su número, severidad y el caso donde apareció.

| Issue | Caso | Severidad | Descripción | Estado |
|---|---|---|---|---|
| — | — | — | Sin defectos registrados todavía | — |

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
| #67 Cierre de HU-04 y HU-05 en el changelog | HU-04 y HU-05 | Pendiente | Abierto, sin aprobación |
| Pendiente | HU-08 | Pendiente | Pendiente |

## Conclusión

Pendiente. Se redacta al terminar la ejecución de las tres historias y antes de la Review del miércoles 4/11.
