# 02 — Alcance

El proyecto se limita a **control de ventas** y **control de inventario**, ajustado al tiempo de desarrollo disponible. Lo demás queda identificado para fases posteriores.

## Dentro y fuera del alcance

| Dentro del alcance | Fuera del alcance (fases posteriores) |
|---|---|
| Registro de ventas y descuento automático de stock | Gestión de proveedores y pedidos de compra |
| Reporte diario de ventas | Alertas automáticas de bajo stock y de vencimiento |
| Reportes de ingresos y productos más vendidos | Devoluciones de lotes a proveedores |
| Registro de ingreso de lotes | Emisión de boletas/facturas y cobros digitales (siguen en el POS) |
| Catálogo de productos: registro, edición de precios y categorías | Restricciones sanitarias de venta y descuentos por monto |
| Consulta de stock por producto y por lote | Registro de clientes e historial de compras |
| Copias de respaldo de los datos | Inicio de sesión y permisos por rol |

> **Regla para el equipo y para agentes:** no se implementa nada de la columna "Fuera del alcance" sin un cambio de alcance acordado y documentado.

## Módulos

| Módulo | Funciones | Requisitos |
|---|---|---|
| M1. Catálogo de productos | Registro, edición y clasificación de productos | RF-07, RF-08, RF-09 |
| M2. Inventario | Ingreso de lotes, validación de duplicidad, consulta de stock | RF-05, RF-06, RF-10 |
| M3. Ventas | Registro de ventas y descuento de stock por lote | RF-01, RF-02, RF-03 |
| M4. Reportes | Reporte diario, reportes de ingresos y más vendidos | RF-04, RF-11 |
| M5. Respaldo | Copia y restauración de la base de datos | RNF-03 |

## Restricciones de operación y diseño

- **Un único equipo:** el sistema corre en la laptop de la farmacia. Hasta dos personas lo usan **por turnos** (no hay uso simultáneo desde varios dispositivos).
- **Sin internet:** ninguna función depende de conexión a internet, servicios en la nube ni recursos externos (CDN, APIs, fuentes remotas).
- **Tecnologías web, ejecución local:** la interfaz se construye con HTML, CSS y JavaScript y se ejecuta en el navegador de la propia laptop. "Web" describe cómo se construye, no que dependa de internet.
- **Datos locales:** la base de datos vive en la laptop y se respalda en un medio externo (memoria USB).
- **Stack concreto:** pendiente de definición por el equipo. Cuando se decida, se documenta en `docs/` antes de implementar.

## Fecha objetivo

El **Producto Mínimo Viable** debe estar listo el **jueves 3 de diciembre de 2026**. Ver [`../planificacion/plan-de-sprints.md`](../planificacion/plan-de-sprints.md).
