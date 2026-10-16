# 02 — Alcance

El PMV se limita a tres módulos: **ventas**, **inventario** y **reportes**, más lo estrictamente necesario para que funcionen (el catálogo de productos es parte del inventario). Lo demás queda identificado para fases posteriores.

## Dentro y fuera del alcance

| Dentro del alcance | Fuera del alcance (fases posteriores) |
|---|---|
| **Ventas:** registro de ventas y descuento automático de stock por lote | Gestión de proveedores y pedidos de compra |
| **Inventario:** catálogo de productos (registro, edición del precio unitario, clasificación) | Alertas automáticas de bajo stock y de vencimiento |
| **Inventario:** registro de ingreso de lotes y validación de duplicidad | Devoluciones de lotes a proveedores |
| **Inventario:** consulta de stock por producto y por lote | Emisión de boletas/facturas y cobros digitales (siguen en el POS) |
| **Reportes:** reporte diario de ventas | Restricciones sanitarias de venta y descuentos por monto |
| **Reportes:** reportes de ingresos y productos más vendidos por periodo | Registro de clientes e historial de compras |
| | Inicio de sesión y permisos por rol |
| | Función de respaldo y restauración dentro del sistema (se reemplaza por un procedimiento manual, RNF-03) |
| | Precios por caja o por conjunto, y control de precios regulados |

> **Regla para el equipo y para agentes:** no se implementa nada de la columna "Fuera del alcance" sin un cambio de alcance acordado y documentado.

## Módulos

| Módulo | Funciones | Requisitos |
|---|---|---|
| M1. Inventario | Catálogo de productos (registro, edición y clasificación), ingreso de lotes, validación de duplicidad, consulta de stock | RF-05, RF-06, RF-07, RF-08, RF-09, RF-10 |
| M2. Ventas | Registro de ventas y descuento de stock por lote | RF-01, RF-02, RF-03 |
| M3. Reportes | Reporte diario, reportes de ingresos y más vendidos | RF-04, RF-11 |

**Regla de unidades:** todo precio es **por unidad** y todo stock y venta se cuentan en **unidades**. Una caja de 30 se registra al ingresar como 30 unidades y, si se vende completa, se cobra como 30 unidades.

## Restricciones de operación y diseño

- **Un único equipo:** el sistema corre en la laptop de la farmacia. Hasta dos personas lo usan **por turnos** (no hay uso simultáneo desde varios dispositivos).
- **Sin internet:** ninguna función depende de conexión a internet, servicios en la nube ni recursos externos (CDN, APIs, fuentes remotas).
- **Tecnologías web, ejecución local:** la interfaz se construye con HTML, CSS y JavaScript y se ejecuta en el navegador de la propia laptop. "Web" describe cómo se construye, no que dependa de internet.
- **Datos locales:** la base de datos vive en la laptop como un único archivo. Su copia a una memoria USB se hace con un procedimiento manual documentado (RNF-03), no con una función del sistema.
- **Stack concreto:** pendiente de definición por el equipo. Cuando se decida, se documenta en `docs/` antes de implementar.

## Fecha objetivo

El **Producto Mínimo Viable** debe estar listo el **jueves 3 de diciembre de 2026**. Ver [`../planificacion/plan-de-sprints.md`](../planificacion/plan-de-sprints.md).
