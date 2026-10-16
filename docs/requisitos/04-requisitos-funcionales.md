# 04 — Requisitos funcionales

Escala de prioridad: **Máxima** (imprescindible) > **Alta** (primera versión) > **Media** (después del núcleo) > **Baja**.

## Resumen

| ID | Requisito | Módulo | Prioridad | CU | Historia |
|---|---|---|---|---|---|
| RF-01 | Registrar venta y descontar stock | Ventas | Alta | CU-01 | HU-01 |
| RF-02 | Datos mínimos de una venta | Ventas | Alta | CU-01 | HU-01 |
| RF-03 | Descontar stock por lote más próximo a vencer | Ventas / Inventario | Alta | CU-01 | HU-02 |
| RF-04 | Reporte diario de ventas | Reportes | Alta | CU-02 | HU-03 |
| RF-05 | Registrar ingreso de lote | Inventario | Máxima | CU-03 | HU-04 |
| RF-06 | Validar duplicidad de lote | Inventario | Alta | CU-03 | HU-05 |
| RF-07 | Registrar y editar producto | Inventario (catálogo) | Alta | CU-04 | HU-06 |
| RF-08 | Edición fácil de precios y datos | Inventario (catálogo) | Alta | CU-04 | HU-06 |
| RF-09 | Clasificar productos | Inventario (catálogo) | Alta | CU-04 | HU-07 |
| RF-10 | Consultar stock por producto y lote | Inventario | Máxima | CU-05 | HU-08 |
| RF-11 | Reportes gerenciales | Reportes | Media | CU-06 | HU-09 |

---

### RF-01 — Registrar venta
- **Descripción:** el sistema debe permitir registrar la venta de uno o más productos (producto y cantidad por línea) y descontar automáticamente del stock las cantidades vendidas.
- **Justificación:** hoy las ventas no se registran y el stock no se actualiza al vender, lo que provoca agotamientos no detectados.
- **Criterio de aceptación:** el 100 % de las ventas confirmadas queda registrado; el stock disminuye exactamente en la cantidad vendida.
- **Prioridad:** Alta

### RF-02 — Datos mínimos de una venta
- **Descripción:** cada venta se almacena con fecha, hora, productos, cantidades y monto total.
- **Justificación:** son los datos mínimos para cuadrar la caja y generar reportes, y evitan perder información como ocurrió con el robo de los cuadernos.
- **Criterio de aceptación:** cada venta registrada conserva esos datos y puede consultarse después sin pérdida.
- **Prioridad:** Alta

### RF-03 — Descuento por lote más próximo a vencer
- **Descripción:** al vender, el stock se descuenta primero del lote con la fecha de vencimiento más próxima.
- **Justificación:** evita que los lotes antiguos permanezcan en estante hasta vencerse.
- **Criterio de aceptación:** con dos o más lotes disponibles del mismo producto, siempre se descuenta primero del que vence antes.
- **Prioridad:** Alta
- **Nota:** regla **confirmada** el 15/10/2026 (antes era un supuesto del equipo).

### RF-04 — Reporte diario de ventas
- **Descripción:** para una fecha seleccionada, el sistema muestra el monto total, la cantidad de productos vendidos, el número de ventas y el detalle por transacción.
- **Justificación:** se requiere un reporte diario para el control contable del negocio.
- **Criterio de aceptación:** el reporte coincide con las ventas registradas de la fecha y es de solo lectura.
- **Prioridad:** Alta

### RF-05 — Registrar ingreso de lote
- **Descripción:** registrar el ingreso de un lote con número de lote, fecha de vencimiento y cantidad **en unidades**, seleccionando un producto existente o creándolo en el mismo flujo. El ingreso incrementa el stock.
- **Justificación:** es el primer problema que la propietaria quiere resolver; hoy se anota a mano.
- **Criterio de aceptación:** cualquier lote recibido puede registrarse en un solo flujo, incluida la creación del producto si es nuevo; el stock aumenta en la cantidad registrada.
- **Prioridad:** Máxima
- **Nota:** el proveedor de origen **no** se registra (proveedores fuera de alcance).

### RF-06 — Validar duplicidad de lote
- **Descripción:** impedir registrar dos veces el mismo número de lote para un mismo producto.
- **Justificación:** un lote duplicado inflaría el stock.
- **Criterio de aceptación:** el sistema rechaza el duplicado con un aviso y no modifica el stock. El mismo número de lote sí se acepta para un producto distinto.
- **Prioridad:** Alta

### RF-07 — Registrar y editar producto
- **Descripción:** crear y editar productos exigiendo como mínimo nombre, acción terapéutica y **precio unitario**. No existe precio por caja ni por conjunto: una caja de 30 se cobra como 30 unidades.
- **Justificación:** son los datos con los que la farmacia identifica y organiza cada medicamento. La fecha de vencimiento se registra por lote (RF-05).
- **Criterio de aceptación:** no se puede guardar un producto sin esos campos.
- **Prioridad:** Alta

### RF-08 — Edición fácil de precios y datos
- **Descripción:** editar el precio y los demás datos de un producto en pocos pasos.
- **Justificación:** necesidad expresa de la propietaria.
- **Criterio de aceptación:** una usuaria sin capacitación cambia un precio en un máximo de 3 acciones.
- **Prioridad:** Alta
- **Nota:** el nuevo precio rige solo para ventas posteriores; las ventas ya registradas conservan el precio con que se hicieron.

### RF-09 — Clasificar productos
- **Descripción:** clasificar cada producto como **Genérico** (listado alfabético) o **Comercial** (agrupado por acción terapéutica).
- **Justificación:** es la organización física que la farmacia ya usa.
- **Criterio de aceptación:** todo producto tiene tipo; los listados respetan el orden correspondiente.
- **Prioridad:** Alta

### RF-10 — Consultar stock por producto y lote
- **Descripción:** consultar el stock total por producto y su desglose por lote (cantidad y fecha de vencimiento), con filtros por nombre y categoría; lotes ordenados por vencimiento.
- **Justificación:** reemplaza la revisión manual mensual y evita descubrir faltantes en plena venta.
- **Criterio de aceptación:** las cantidades coinciden con los ingresos (RF-05) menos las ventas (RF-01).
- **Prioridad:** Máxima

### RF-11 — Reportes gerenciales
- **Descripción:** para un periodo seleccionado, generar el reporte de ingresos por ventas y el de productos más vendidos.
- **Justificación:** la propietaria revisa los resultados del negocio cada ~15 días.
- **Criterio de aceptación:** los reportes son consistentes con las ventas registradas.
- **Prioridad:** Media
- **Nota:** el **egreso** mensual no se incluye porque requiere el costo de compra (ligado a proveedores, fuera de alcance).
