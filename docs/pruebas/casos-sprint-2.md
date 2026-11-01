# Casos de prueba — Sprint 2

Casos de aceptación de **HU-04 Registrar ingreso de lote**, **HU-05 Validar duplicidad de lote** y **HU-08 Consultar stock**, redactados con la plantilla del [plan de pruebas](plan-de-pruebas.md). Cada caso prueba un criterio de aceptación de [`07-historias-de-usuario.md`](../requisitos/07-historias-de-usuario.md), y su número coincide con el del criterio (CP-HU05-2 prueba HU-05 CA2). Los resultados se registran en [`resultados-sprint-2.md`](resultados-sprint-2.md).

Los textos de pantalla, avisos y datos de ejemplo salen de los bocetos [W2](../diseno/w2-ingreso-lote.html) y [W3](../diseno/w3-consultar-stock.html). Si la pantalla final muestra otro texto con el mismo sentido, el caso pasa; se anota la diferencia en las observaciones.

## Condiciones de todas las pruebas

- Se ejecutan en la laptop, **sin internet** (modo avión o Wi-Fi apagado), con el Node portátil, sobre la rama o el commit del PR de la historia que se prueba. Se anota cuál.
- Con F12 abierto (pestañas Consola y Red) durante toda la prueba: no debe haber errores en la consola ni peticiones fuera de `localhost`.
- Se usa una base de prueba, nunca la base real de la farmacia. Antes de cada historia se parte de una base limpia, salvo que el caso diga lo contrario.
- Todo precio y cantidad va **por unidad**. En este sprint todavía no hay ventas (HU-01 es del Sprint 3), así que el stock de un producto es la suma de los ingresos de sus lotes.
- Se anota el stock inicial antes de cada caso que lo modifique, para comprobar el cambio exacto.

## Datos de prueba comunes

| Producto | Precio por unidad | Categoría | Tipo | Lotes |
|---|---|---|---|---|
| Paracetamol 500 mg | S/ 0.50 | Analgésico | Genérico | L-2309 (03/2027, 4 u.) y L-2411 (11/2027, 100 u.) |
| Amoxicilina 500 mg | S/ 1.20 | Antibiótico | Genérico | A-1002 (08/2027, 60 u.) |

Para HU-08 se usa esta carga (el issue #48 prepara los datos de prueba). Para HU-04 y HU-05 se parte de una base con solo los productos, sin lotes, y los lotes se ingresan durante las pruebas.

## HU-04 — Registrar ingreso de lote

### CP-HU04-1 — Ingreso de un lote de un producto existente (HU-04 CA1)

| Campo | Contenido |
|---|---|
| Precondición | Existe «Paracetamol 500 mg» sin lotes (stock 0). La pantalla *Ingreso de lotes* está abierta |
| Pasos | 1. Elegir el producto «Paracetamol 500 mg». 2. Número de lote `L-2411`, vencimiento `30/11/2027`, cantidad `100`. 3. Presionar **Registrar ingreso**. 4. Ir a *Consultar stock* y buscar el producto |
| Resultado esperado | Aparece un aviso de ingreso registrado. El formulario se limpia. En *Consultar stock* el stock del producto es **100** (0 + 100) y el lote L-2411 figura con vencimiento 11/2027 y 100 unidades |

### CP-HU04-2 — Alta rápida de un producto nuevo dentro del flujo (HU-04 CA2)

| Campo | Contenido |
|---|---|
| Precondición | No existe el producto «Ibuprofeno 400 mg». La pantalla *Ingreso de lotes* está abierta |
| Pasos | 1. En el selector de producto elegir **+ Nuevo producto**. 2. Nombre `Ibuprofeno 400 mg`, acción terapéutica `Analgésico`, precio por unidad `0.80`. 3. Presionar **Guardar producto**. 4. Sin cambiar de pantalla, número de lote `L-3001`, vencimiento `30/06/2027`, cantidad `50`. 5. Presionar **Registrar ingreso** |
| Resultado esperado | El producto se guarda sin salir de la pantalla y queda **seleccionado** en el selector. El lote se registra. En *Consultar stock* «Ibuprofeno 400 mg» aparece a S/ 0.80 con stock **50** |

### CP-HU04-3 — Dato faltante o cantidad no válida (HU-04 CA3)

| Campo | Contenido |
|---|---|
| Precondición | «Paracetamol 500 mg» existe. Anotar su stock antes de empezar (S) |
| Pasos | Con el producto elegido, probar cada caso y presionar **Registrar ingreso**: (a) fecha de vencimiento vacía, lote `L-4001`, cantidad `10`; (b) número de lote vacío, fecha `30/06/2027`, cantidad `10`; (c) cantidad vacía; (d) cantidad `0`; (e) cantidad `-5` |
| Resultado esperado | En los cinco casos **no se registra** nada y se indica cuál dato falta o no es válido (por ejemplo «Falta completar: fecha de vencimiento» o «La cantidad debe ser mayor que cero»). El stock sigue en **S** |

## HU-05 — Validar duplicidad de lote

### CP-HU05-1 — Lote duplicado en el mismo producto (HU-05 CA1)

| Campo | Contenido |
|---|---|
| Precondición | «Paracetamol 500 mg» tiene registrado el lote `L-2309` con 4 unidades (stock 4) |
| Pasos | 1. En *Ingreso de lotes* elegir «Paracetamol 500 mg». 2. Número de lote `L-2309`, vencimiento `31/03/2027`, cantidad `10`. 3. Presionar **Registrar ingreso**. 4. Revisar el stock en *Consultar stock* |
| Resultado esperado | Se **rechaza** con un aviso de que el lote ya está registrado para ese producto (por ejemplo «El lote L-2309 ya está registrado para Paracetamol 500 mg. No se modificó el stock»). El stock sigue en **4** y no aparece un segundo lote L-2309 |

### CP-HU05-2 — Mismo número de lote en otro producto (HU-05 CA2)

| Campo | Contenido |
|---|---|
| Precondición | `L-2309` existe para «Paracetamol 500 mg» (4 unidades). «Amoxicilina 500 mg» existe sin ese lote. Anotar el stock de Amoxicilina (A) |
| Pasos | 1. En *Ingreso de lotes* elegir «Amoxicilina 500 mg». 2. Número de lote `L-2309`, vencimiento `31/08/2027`, cantidad `20`. 3. Presionar **Registrar ingreso**. 4. Revisar el stock de ambos productos |
| Resultado esperado | El ingreso se **acepta**. El stock de Amoxicilina es **A + 20** y el de Paracetamol sigue en **4** |

## HU-08 — Consultar stock

### CP-HU08-1 — Búsqueda por nombre, precio y stock total (HU-08 CA1)

| Campo | Contenido |
|---|---|
| Precondición | Carga de datos de prueba: Paracetamol 500 mg (lotes de 4 y 100 unidades) y Amoxicilina 500 mg (60 unidades). F12 → Red abierto |
| Pasos | 1. Abrir *Consultar stock*. 2. Escribir `Paracetamol` en el buscador. 3. Anotar el tiempo de la petición y de la pantalla. 4. Buscar un nombre inexistente (por ejemplo `zzz`) |
| Resultado esperado | Se muestra «Paracetamol 500 mg» con precio **S/ 0.50** y stock total **104** unidades (4 + 100), y solo ese producto. Resultado en **menos de 2 segundos**. Con `zzz` aparece el mensaje de que no se encontraron productos |

### CP-HU08-2 — Detalle por lote ordenado por vencimiento (HU-08 CA2)

| Campo | Contenido |
|---|---|
| Precondición | La misma carga de datos. Paracetamol 500 mg tiene dos lotes |
| Pasos | 1. Buscar «Paracetamol». 2. Desplegar **Ver lotes** de «Paracetamol 500 mg». 3. Hacer lo mismo con «Amoxicilina 500 mg» |
| Resultado esperado | Paracetamol lista **L-2309 (03/2027, 4 u.)** primero y **L-2411 (11/2027, 100 u.)** después, del vencimiento más próximo al más lejano; las cantidades suman el stock total (104). Amoxicilina lista A-1002 (08/2027, 60 u.) |

### CP-HU08-3 — Filtros por categoría y tipo (HU-08 CA3)

| Campo | Contenido |
|---|---|
| Precondición | La misma carga de datos: Paracetamol (Analgésico, Genérico) y Amoxicilina (Antibiótico, Genérico) |
| Pasos | 1. Filtrar por categoría **Analgésico**. 2. Filtrar por categoría **Antibiótico**. 3. Filtrar por tipo **Comercial**. 4. Volver a **Todas las categorías** y **Todos los tipos** |
| Resultado esperado | Con Analgésico solo aparece Paracetamol; con Antibiótico solo Amoxicilina; con tipo Comercial no aparece ninguno (no hay productos comerciales en los datos). Al quitar los filtros vuelven a verse los dos productos |

## Verificación transversal: stock = ingresos − ventas

En este sprint no hay ventas, así que lo que se comprueba es que **el stock mostrado sea siempre la suma exacta de los ingresos de lotes**, en todos los casos de arriba: CP-HU04-1 (0 + 100), CP-HU04-2 (50), CP-HU05-1 (4, sin cambio), CP-HU05-2 (A + 20) y CP-HU08-1/2 (4 + 100 = 104). Cualquier diferencia se registra como `bug`. La parte «− ventas» se comprueba en el Sprint 3 con HU-01 y HU-02.

## Defectos

Los errores se registran como issues con la etiqueta `bug`, con el formato de la sección 8 del [plan de pruebas](plan-de-pruebas.md), y se priorizan antes de la Review del miércoles 4/11.
