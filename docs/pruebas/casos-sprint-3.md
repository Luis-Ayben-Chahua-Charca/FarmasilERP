# Casos de prueba — Sprint 3

Casos de aceptación de **HU-01 Registrar venta** (#14), **HU-02 Descuento por lote más próximo a vencer** (#15) y **HU-07 Clasificar productos** (#21), redactados con la plantilla del [plan de pruebas](plan-de-pruebas.md). Cada caso prueba un criterio de aceptación de [`07-historias-de-usuario.md`](../requisitos/07-historias-de-usuario.md), y su número coincide con el del criterio (CP-HU02-2 prueba HU-02 CA2). Los resultados se registran en [`resultados-sprint-3.md`](resultados-sprint-3.md). Las pruebas son del issue #16.

Los textos de pantalla salen de las fichas del Sprint 3 y del boceto W1 (#71); las respuestas de la API, del contrato [`api-ventas.md`](../arquitectura/api-ventas.md). Si la pantalla final muestra otro texto con el mismo sentido, el caso pasa y se anota la diferencia en las observaciones.

## Condiciones de todas las pruebas

- Se ejecutan en la laptop, **sin internet** (modo avión o Wi-Fi apagado), con el **Node portátil** de `iniciar.bat`, sobre la rama o el commit del PR de la historia que se prueba. Se anota cuál.
- Con F12 abierto (pestañas Consola y Red) durante toda la prueba: no debe haber errores en la consola ni peticiones fuera de `localhost`.
- Se usa una base de prueba, nunca la base real de la farmacia (`datos/farmasil.db`).
- Todo precio y cantidad va **por unidad**. Desde este sprint, el stock de un lote es su cantidad recibida **menos lo vendido** de ese lote.
- Los casos de HU-01 y HU-02 **cambian el stock**: se ejecutan en el orden de la sección «Orden de ejecución», y antes de cada uno se anota el stock esperado de esa tabla.
- Cada caso se documenta con una captura en `evidencias-s3/`; en los rechazos, también la captura del aviso.

## Datos de prueba

### Base «ventas» (HU-01 y HU-02)

Base limpia con estos productos. Los lotes se ingresan desde *Ingreso de lotes* **en el orden de la tabla**, porque el orden de registro decide el desempate de HU-02.

| Producto | Precio por unidad | Categoría | Tipo | Lotes, en orden de registro | Stock inicial |
|---|---|---|---|---|---|
| Paracetamol 500 mg | S/ 0.50 | Analgésico | Genérico | A: `L-2309` (vence 31/03/2027, 4 u.) · B: `L-2411` (vence 30/11/2027, 100 u.) | 104 |
| Amoxicilina 500 mg | S/ 1.20 | Antibiótico | Genérico | `L-3001` (vence 30/06/2027, 60 u.) | 60 |
| Ibuprofeno 400 mg | S/ 0.80 | Antiinflamatorio | Comercial | `L-5001` (vence 31/12/2027, 4 u.) | 4 |
| Loratadina 10 mg | S/ 0.30 | Antihistamínico | Comercial | `L-6002` (vence 30/09/2028, 20 u.) · `L-6001` (vence 31/05/2027, 20 u.) | 40 |
| Omeprazol 20 mg | S/ 0.40 | Antiácido | Genérico | `L-7001` (vence 31/10/2027, 10 u.) · `L-7002` (vence 31/10/2027, 10 u.) | 20 |

Loratadina tiene un lote registrado **después** que vence **antes** (`L-6001`), y Omeprazol dos lotes que vencen **el mismo día**: sirven para comprobar la regla completa del contrato.

### Base de `npm run datos-prueba-stock` (HU-07 y regresión de búsqueda)

`datos/prueba-stock.db`: 300 productos y 904 lotes, **150 genéricos y 150 comerciales** en 12 categorías. Valores de referencia:

- Genéricos en orden alfabético: el primero es **Albendazol 1 g** y el último **Salbutamol 500 mg**.
- Comerciales por acción terapéutica, en orden alfabético español: Analgésico (11), Antiácido (13), Antibiótico (23), Antidiabético (12), Antidiarreico (7), Antiespasmódico (8), Antihipertensivo (11), Antihistamínico (17), Antiinflamatorio (16), Antiparasitario (14), Broncodilatador (7) y Corticoide (11). Suman 150.
- El primer comercial del grupo Analgésico es **Metamizol 10 mg**.

## Orden de ejecución y stock esperado

| Paso | Caso | Venta | Paracetamol (A / B) | Amoxicilina | Ibuprofeno | Loratadina (L-6001 / L-6002) | Omeprazol (L-7001 / L-7002) |
|---|---|---|---|---|---|---|---|
| 0 | Base inicial | — | 104 (4 / 100) | 60 | 4 | 40 (20 / 20) | 20 (10 / 10) |
| 1 | CP-HU01-4 | Se cancela | 104 (4 / 100) | 60 | 4 | 40 | 20 |
| 2 | CP-HU02-1 (a) | 6 Paracetamol | 98 (0 / 98) | 60 | 4 | 40 | 20 |
| 3 | CP-HU02-2 | 3 Paracetamol | 95 (0 / 95) | 60 | 4 | 40 | 20 |
| 4 | CP-HU02-1 (b) | 5 Loratadina | 95 | 60 | 4 | 35 (15 / 20) | 20 |
| 5 | CP-HU02-1 (c) | 3 Omeprazol | 95 | 60 | 4 | 35 | 17 (7 / 10) |
| 6 | CP-HU01-3 | 10 Paracetamol + 4 Amoxicilina | 85 (0 / 85) | 56 | 4 | 35 | 17 |
| 7 | CP-HU01-1 | 5 Amoxicilina | 85 | 51 | 4 | 35 | 17 |
| 8 | CP-HU01-2 | No se agrega | 85 | 51 | 4 | 35 | 17 |
| 9 | R-2 (regresión) | Ingreso de 10 u. de Amoxicilina | 85 | 61 | 4 | 35 | 17 |

Cualquier diferencia con esta tabla se registra como `bug`, aunque el caso en sí pase.

## HU-01 — Registrar venta

### CP-HU01-1 — Venta confirmada que se registra y descuenta el stock (HU-01 CA1)

| Campo | Contenido |
|---|---|
| Precondición | Paso 7 del orden: Amoxicilina 500 mg con stock **56**. *Registrar venta* abierta, carrito vacío, F12 → Red abierto |
| Pasos | 1. Buscar «Amoxicilina», cantidad `5`, presionar **Agregar**. 2. Presionar **Confirmar venta** con un **doble clic** rápido. 3. En F12 → Red, abrir la respuesta de `POST /api/ventas`. 4. Ir a *Consultar stock* y buscar «Amoxicilina 500 mg» |
| Resultado esperado | Aparece «Venta registrada: S/ 6.00.» y el carrito queda vacío. Hay **una sola** petición `POST /api/ventas` con respuesta `201` que trae `fecha_hora` en la hora local de la laptop (formato `AAAA-MM-DD HH:MM:SS`, no 5 horas adelantada), una línea de Amoxicilina con 5 unidades del lote `L-3001` y `monto_total_centimos: 600`. En *Consultar stock* el stock es **51** (56 − 5), no 46 |

### CP-HU01-2 — Cantidad mayor que el stock disponible (HU-01 CA2)

| Campo | Contenido |
|---|---|
| Precondición | Paso 8 del orden: Ibuprofeno 400 mg con **4** unidades. *Registrar venta* abierta, carrito vacío |
| Pasos | (a) Buscar «Ibuprofeno», cantidad `5`, presionar **Agregar**. (b) Cantidad `3`, **Agregar**; luego cantidad `2`, **Agregar**. (c) Probar cantidad vacía, `0`, `-1` y `2.5`. (d) Presionar **Cancelar venta** |
| Resultado esperado | (a) Bajo el campo aparece «Solo hay 4 unidades disponibles.», **no se agrega** la línea y el `5` sigue escrito. (b) La línea de 3 se agrega; al intentar 2 más aparece el aviso de que solo queda **1** unidad y la línea sigue en 3. (c) En los cuatro casos aparece «La cantidad debe ser mayor que cero.» y no se agrega nada. (d) El carrito se vacía. El stock de Ibuprofeno sigue en **4** |

### CP-HU01-3 — Total de la venta (HU-01 CA3)

| Campo | Contenido |
|---|---|
| Precondición | Paso 6 del orden: Paracetamol 500 mg (S/ 0.50) con 95 u. y Amoxicilina 500 mg (S/ 1.20) con 60 u. Carrito vacío |
| Pasos | 1. Agregar `10` unidades de Paracetamol. 2. Agregar `4` de Amoxicilina. 3. Anotar subtotales y total. 4. Presionar **Quitar** en Amoxicilina, anotar el total y volver a agregar 4. 5. Presionar **Confirmar venta** |
| Resultado esperado | Subtotales **S/ 5.00** y **S/ 4.80**; total **S/ 9.80** (10 × 0.50 + 4 × 1.20). Al quitar Amoxicilina el total baja a S/ 5.00 y vuelve a S/ 9.80 al agregarla. Al confirmar: «Venta registrada: S/ 9.80.» y `monto_total_centimos: 980` en la respuesta. Stock: Paracetamol **85**, Amoxicilina **56** |

### CP-HU01-4 — Cancelar una venta en curso (HU-01 CA4)

| Campo | Contenido |
|---|---|
| Precondición | Paso 1 del orden: base inicial (Paracetamol 104, Amoxicilina 60). *Registrar venta* abierta, carrito vacío, F12 → Red abierto y limpio |
| Pasos | 1. Comprobar que **Confirmar venta** y **Cancelar venta** están deshabilitados y que se lee «Agregue productos para iniciar la venta.». 2. Agregar `10` de Paracetamol y `4` de Amoxicilina. 3. Presionar **Cancelar venta**. 4. Revisar F12 → Red y *Consultar stock* |
| Resultado esperado | El carrito se vacía y vuelve el estado inicial. En F12 → Red **no hay ninguna** petición a `/api/ventas`. El stock sigue en Paracetamol **104** y Amoxicilina **60** |

## HU-02 — Descuento por lote más próximo a vencer

### CP-HU02-1 — Descuento repartido entre lotes por vencimiento (HU-02 CA1)

| Campo | Contenido |
|---|---|
| Precondición | Pasos 2, 4 y 5 del orden. Paracetamol con lote A `L-2309` (31/03/2027, 4 u.) y B `L-2411` (30/11/2027, 100 u.) |
| Pasos | (a) Vender `6` unidades de Paracetamol y revisar la respuesta de `POST /api/ventas` y el detalle de lotes en *Consultar stock*. (b) Vender `5` de Loratadina. (c) Vender `3` de Omeprazol |
| Resultado esperado | (a) La respuesta trae **dos líneas**: `L-2309` con **4** y `L-2411` con **2**; monto **S/ 3.00**. En *Consultar stock*: A en **0**, B en **98**, total **98**. (b) Se usa solo `L-6001` (vence antes, aunque se registró después): queda en **15** y `L-6002` sigue en **20**. (c) Los dos lotes vencen el mismo día: se usa `L-7001` (registrado primero), que queda en **7**; `L-7002` sigue en **10** |

### CP-HU02-2 — Un lote en cero no se usa (HU-02 CA2)

| Campo | Contenido |
|---|---|
| Precondición | Paso 3 del orden: después de CP-HU02-1 (a), el lote A `L-2309` de Paracetamol está en **0** y B en **98** |
| Pasos | 1. Vender `3` unidades de Paracetamol. 2. Revisar la respuesta de `POST /api/ventas` y el detalle de lotes |
| Resultado esperado | La respuesta trae **una sola línea**, de `L-2411` con **3**, y ninguna de `L-2309`. B queda en **95**, A sigue en **0** y el total es **95**. Si W3 sigue listando el lote A con 0, no es un defecto (diferencia aceptada en el Sprint 2) |

## HU-07 — Clasificar productos

Si en la revisión del jueves 12/11 se recorta HU-07 (o solo #82), los casos afectados se marcan **No verificado** con el motivo «recortado en el Sprint 3».

### CP-HU07-1 — Genéricos en orden alfabético (HU-07 CA1)

| Campo | Contenido |
|---|---|
| Precondición | Base de `npm run datos-prueba-stock`. *Consultar stock* abierta, F12 → Red abierto |
| Pasos | 1. Elegir Tipo **Genérico**. 2. Revisar el primero, el último y el orden de la lista. 3. Anotar el tiempo de la petición |
| Resultado esperado | Aparecen **150** productos, todos genéricos, de la A a la Z: el primero **Albendazol 1 g** y el último **Salbutamol 500 mg**. Responde en **menos de 2 s** |

### CP-HU07-2 — Comerciales agrupados por acción terapéutica (HU-07 CA2)

| Campo | Contenido |
|---|---|
| Precondición | La misma base. *Consultar stock* abierta |
| Pasos | 1. Elegir Tipo **Comercial**. 2. Revisar los títulos de grupo, su orden y la cantidad de productos de cada uno. 3. Desplegar los lotes de un producto. 4. Volver a Tipo **Todos** |
| Resultado esperado | **150** productos en **12 grupos** con una fila de título por acción terapéutica, en orden alfabético: Analgésico (11), **Antiácido (13)**, Antibiótico (23) y siguientes, como en «Datos de prueba». Dentro de cada grupo, orden alfabético: Analgésico empieza por **Metamizol 10 mg**. El detalle por lote se abre y se cierra. Con **Todos**, la lista vuelve a ser la del Sprint 2 (300 productos, sin títulos). Punto de control: si «Antiácido» aparece al final, después de «Antiparasitario», es orden por bytes y no alfabético: se registra como `bug` |

### CP-HU07-3 — Alta de producto sin tipo (HU-07 CA3)

| Campo | Contenido |
|---|---|
| Precondición | Base «ventas». *Ingreso de lotes* abierta, F12 → Red abierto |
| Pasos | 1. Elegir **+ Nuevo producto**: nombre `Cetirizina 10 mg`, acción terapéutica `Antihistamínico`, precio `0.60`, **sin elegir tipo**. 2. Presionar **Guardar producto**. 3. Elegir tipo **Comercial** y guardar. 4. En *Consultar stock*, filtrar Tipo **Comercial** |
| Resultado esperado | (2) No se envía nada (ninguna petición `POST /api/productos` en F12 → Red) y bajo el selector aparece «Elija si el producto es genérico o comercial.»; lo escrito se conserva. (3) El producto se guarda y queda seleccionado. (4) «Cetirizina 10 mg» aparece entre los comerciales, en el grupo Antihistamínico |

## Regresión de los Sprints 1 y 2

Se ejecuta sobre la base «ventas» al terminar los casos de HU-01 y HU-02 (pasos 8 y 9), salvo R-5.

| ID | Qué se repite | Pasos | Resultado esperado |
|---|---|---|---|
| R-1 | HT-01 CA1 y CA3: menú y tiempo de pantallas | Sin internet, abrir con `iniciar.bat` y recorrer las cinco opciones del menú | Se ven las cinco opciones; cada pantalla aparece en menos de 2 s; F12 → Consola sin errores |
| R-2 | HU-04 CA1: ingreso de lote con ventas previas | Ingresar `L-3002` de Amoxicilina (vence 31/12/2027, 10 u.) | Ingreso registrado; stock de Amoxicilina **61** (51 + 10) |
| R-3 | HU-05 CA1: lote duplicado | Ingresar otra vez `L-2309` en Paracetamol (lote ya en 0) | Se rechaza con «El lote L-2309 ya está registrado para este producto.»; el stock sigue en **85** |
| R-4 | HU-08 CA2: detalle por lote con ventas | Desplegar los lotes de Paracetamol, Loratadina y Omeprazol | Cantidades = recibido − vendido, en orden de vencimiento: Paracetamol A 0 y B 85; Loratadina `L-6001` 15 y `L-6002` 20; Omeprazol 7 y 10 |
| R-5 | HU-08 CA1 y CA3: búsqueda y filtros | Con la base de `npm run datos-prueba-stock`: buscar «Paracetamol» y filtrar Analgésico + Comercial | Resultado en menos de 2 s; 11 productos con el filtro combinado, igual que en el Sprint 2 |

## Verificación transversal: stock = ingresos − ventas

Al terminar el paso 9, el stock de cada producto en *Consultar stock* debe coincidir con la última fila de «Orden de ejecución»: Paracetamol **85**, Amoxicilina **61**, Ibuprofeno **4**, Loratadina **35** y Omeprazol **17**. Es la parte «− ventas» que quedó pendiente en el Sprint 2.

## Pruebas automáticas relacionadas

Complementan estos casos y deben estar en verde (`npm test`) antes de ejecutarlos:

| Historia | Prueba | Issue |
|---|---|---|
| HU-02 | Regla de asignación de lotes en `test/asignar-lotes.test.js` | #72 |
| HU-01 | API de ventas: CA1, CA2 (`409`), CA3 (980), transacción y precio, en `test/ventas-aceptacion.test.js` | #78 |
| HU-02 | Descuento por vencimiento dentro de la venta, en `test/ventas-lotes.test.js` | #79 |
| HU-07 | Tipo obligatorio en `POST /api/productos`, en `test/productos.test.js` | #81 |

## Defectos

Los errores se registran como issues con la etiqueta `bug`, con el formato de la sección 8 del [plan de pruebas](plan-de-pruebas.md), y se priorizan antes de la Review del miércoles 18/11. Una observación que no rompe un criterio también termina en un issue `bug` o en una decisión escrita en #16.
