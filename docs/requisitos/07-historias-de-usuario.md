# 07 — Historias de usuario (Product Backlog)

Estimación en puntos de historia (Fibonacci: 1, 2, 3, 5, 8, 13). Historia de referencia: **HU-05 = 2 puntos**. Equivalencia de calibración: 1 punto ≈ 3 horas-hombre.

## Product Backlog priorizado

| ID | Historia | Requisitos | MoSCoW | Pts. | Sprint |
|---|---|---|---|---|---|
| HT-01 | Como equipo de desarrollo, quiero preparar la estructura base de la aplicación (interfaz, lógica y base de datos local) e instalarla en la laptop, para disponer del entorno sobre el que se construyen las demás historias. | RNF-01, RNF-07, RNF-08 | Must | 5 | 1 |
| HU-06 | Como propietaria, quiero registrar y editar productos con nombre, acción terapéutica, tipo y precio, para mantener el catálogo actualizado en pocos pasos. | RF-07, RF-08 | Must | 5 | 1 |
| HU-07 | Como propietaria, quiero clasificar los productos como genéricos o comerciales, para consultarlos con el mismo orden de los estantes. | RF-09 | Should | 3 | 1 |
| HU-04 | Como propietaria, quiero registrar el ingreso de un lote con número, fecha de vencimiento y cantidad, para que el stock se actualice al recibir la mercadería. | RF-05 | Must | 5 | 2 |
| HU-05 | Como propietaria, quiero que el sistema impida registrar dos veces el mismo lote de un producto, para evitar errores en el stock. | RF-06 | Must | 2 | 2 |
| HU-08 | Como técnica farmacéutica, quiero consultar el stock por producto y por lote, para saber qué hay disponible sin revisar los estantes. | RF-10 | Must | 5 | 2 |
| HU-01 | Como técnica farmacéutica, quiero registrar una venta con sus productos y cantidades, para que quede guardada y el stock se descuente automáticamente. | RF-01, RF-02 | Must | 8 | 3 |
| HU-02 | Como propietaria, quiero que al vender se descuente primero el lote con vencimiento más próximo, para que los lotes antiguos no se queden hasta vencerse. | RF-03 | Must | 3 | 3 |
| HU-03 | Como propietaria, quiero consultar el reporte de ventas de un día, para cuadrar la caja al cierre. | RF-04 | Must | 3 | 4 |
| HU-10 | Como propietaria, quiero generar y restaurar copias de respaldo de los datos, para no perder la información ante una falla o robo del equipo. | RNF-03 | Should | 3 | 4 |
| HU-09 | Como propietaria, quiero generar reportes de ingresos y de productos más vendidos por periodo, para revisar los resultados del negocio. | RF-11 | Should | 5 | Condicional (ver plan) |
| HU-11 | Como propietaria, quiero marcar los productos con precio regulado y que el sistema controle su edición, para cumplir la regulación. | RNF-05 | Could | 3 | Fuera del PMV |
| HU-12 | Como propietaria, quiero recibir alertas de bajo stock y de lotes próximos a vencer. | — | Won't | — | — |
| HU-13 | Como propietaria, quiero registrar devoluciones de lotes a proveedores. | — | Won't | — | — |
| HU-14 | Como técnica, quiero registrar clientes y su historial de compras. | — | Won't | — | — |
| HU-15 | Como técnica, quiero emitir comprobantes desde el sistema. | — | Won't | — | — |
| HU-16 | Como propietaria, quiero que cada usuaria inicie sesión con permisos según su rol. | — | Won't | — | — |

## Criterios de aceptación (Dado-Cuando-Entonces)

### HT-01 — Estructura base e instalación
- **CA1** — DADO QUE la aplicación está instalada y la laptop no tiene internet, CUANDO una usuaria la abre, ENTONCES se muestra el menú principal (Registrar venta, Consultar stock, Ingreso de lotes, Productos, Reportes).
- **CA2** — DADO QUE se registró un dato de prueba, CUANDO la laptop se reinicia y se abre la aplicación, ENTONCES el dato sigue disponible.
- **CA3** — DADO QUE la aplicación está en uso, CUANDO se navega entre opciones, ENTONCES cada pantalla se muestra en menos de 2 segundos.

### HU-06 — Registrar y editar productos
- **CA1** — DADO QUE la propietaria está en Productos, CUANDO registra nombre, acción terapéutica y precio y presiona Guardar, ENTONCES el producto se guarda y aparece en el listado.
- **CA2** — DADO QUE falta un campo obligatorio, CUANDO presiona Guardar, ENTONCES no se guarda y se indican los campos faltantes.
- **CA3** — DADO QUE existe un producto, CUANDO lo edita y cambia el precio, ENTONCES el nuevo precio queda vigente en máximo 3 acciones y se aplica a ventas posteriores.

### HU-07 — Clasificar productos
- **CA1** — DADO QUE existen genéricos, CUANDO se filtra por tipo Genérico, ENTONCES se muestran en orden alfabético.
- **CA2** — DADO QUE existen comerciales, CUANDO se filtra por tipo Comercial, ENTONCES se muestran agrupados por acción terapéutica.
- **CA3** — DADO QUE se registra un producto sin tipo, CUANDO se presiona Guardar, ENTONCES se solicita elegir Genérico o Comercial.

### HU-04 — Registrar ingreso de lote
- **CA1** — DADO QUE el producto existe, CUANDO se ingresa n.º de lote, vencimiento y cantidad y se presiona Registrar ingreso, ENTONCES el lote se guarda y el stock aumenta en esa cantidad.
- **CA2** — DADO QUE el producto no existe, CUANDO se elige «+ Nuevo producto», ENTONCES se registra sin salir del flujo y queda seleccionado.
- **CA3** — DADO QUE falta un campo o la cantidad no es mayor que cero, CUANDO se presiona Registrar ingreso, ENTONCES no se registra y se indica el dato inválido.

### HU-05 — Validar duplicidad de lote
- **CA1** — DADO QUE el lote L-2309 ya existe para un producto, CUANDO se intenta registrar de nuevo para ese producto, ENTONCES se rechaza con aviso y el stock no cambia.
- **CA2** — DADO QUE L-2309 existe para un producto, CUANDO se registra para otro producto, ENTONCES se acepta.

### HU-08 — Consultar stock
- **CA1** — DADO QUE hay productos con lotes, CUANDO se busca por nombre, ENTONCES se muestran precio y stock total en menos de 2 segundos.
- **CA2** — DADO QUE un producto tiene varios lotes, CUANDO se despliega su detalle, ENTONCES se listan lotes con vencimiento y cantidad, del más próximo al más lejano.
- **CA3** — DADO QUE se aplica un filtro de categoría o tipo, ENTONCES solo se muestran los productos que lo cumplen.

### HU-01 — Registrar venta
- **CA1** — DADO QUE hay productos agregados con stock suficiente, CUANDO se confirma la venta, ENTONCES se registra (fecha, hora, productos, cantidades, monto) y se descuenta el stock.
- **CA2** — DADO QUE un producto tiene 4 unidades, CUANDO se ingresan 5, ENTONCES se muestra la cantidad disponible y no se agrega la línea.
- **CA3** — DADO QUE la venta tiene 10 unidades a S/ 0.50 y 4 a S/ 1.20, CUANDO se agregan, ENTONCES el total es S/ 9.80.
- **CA4** — DADO QUE hay una venta en curso, CUANDO se cancela, ENTONCES se descarta y el stock no cambia.

### HU-02 — Descuento por lote más próximo a vencer
- **CA1** — DADO QUE hay un lote A (vence 03/2027, 4 u.) y un lote B (vence 11/2027, 100 u.), CUANDO se venden 6 unidades, ENTONCES se descuentan 4 de A y 2 de B.
- **CA2** — DADO QUE un lote queda en cero, CUANDO se registra otra venta del producto, ENTONCES ese lote no se usa.

### HU-03 — Reporte diario de ventas
- **CA1** — DADO QUE hay ventas en una fecha, CUANDO se consulta, ENTONCES se muestran monto total, productos vendidos, n.º de ventas y detalle.
- **CA2** — DADO QUE no hay ventas en la fecha, CUANDO se consulta, ENTONCES se indica que no hay ventas y los totales son cero.
- **CA3** — DADO QUE el reporte está en pantalla, ENTONCES no se puede modificar ninguna venta desde ahí.

### HU-10 — Respaldo y restauración
- **CA1** — DADO QUE hay datos registrados, CUANDO la propietaria genera una copia de respaldo, ENTONCES se crea un archivo de respaldo en la ubicación elegida (por ejemplo, la memoria USB).
- **CA2** — DADO QUE existe un archivo de respaldo, CUANDO se restaura, ENTONCES los datos quedan como estaban al momento de la copia.

## Bocetos de interfaz

Las pantallas de referencia (baja fidelidad) son: W1 Registrar venta, W2 Ingreso de lote, W3 Consultar stock, W4 Productos, W5 Reporte diario. Todas comparten un menú lateral con las cinco opciones del sistema.
