# FarmasilERP — Sistema de Control de Ventas e Inventario

Sistema para la farmacia **Farmasil** que registra las ventas y lleva el inventario por producto y por lote, para conocer en todo momento el stock disponible y lo vendido, sin depender de cuadernos ni conteos manuales.

> Proyecto del curso **Gestión de Proyectos de Software** — Universidad Nacional de San Agustín de Arequipa, semestre 2026-B.

## Estado

🚧 En desarrollo — Sprint 1 (15 – 28 de octubre de 2026). Entrega del **PMV: jueves 3 de diciembre de 2026**.

## Qué hace (alcance)

- Catálogo de productos: registro, edición de precios y clasificación en genéricos y comerciales.
- Inventario: ingreso de lotes (número, vencimiento, cantidad), validación de duplicados y consulta de stock por producto y lote.
- Ventas: registro de ventas con descuento automático de stock, empezando por el lote que vence primero.
- Reportes: reporte diario de ventas.
- Respaldo: copia y restauración de los datos.

Fuera de alcance: proveedores, alertas, devoluciones, comprobantes, clientes e inicio de sesión. Detalle en [`docs/requisitos/02-alcance.md`](docs/requisitos/02-alcance.md).

## Restricciones clave

| Restricción | Implicancia |
|---|---|
| Sin internet en la farmacia | Todo funciona offline: nada de CDN, APIs externas ni servicios en la nube. |
| Un único equipo (laptop) | La app corre localmente; hasta dos personas la usan por turnos. |
| Tecnologías web | Interfaz en HTML, CSS y JavaScript, ejecutada en el navegador de la laptop. |
| Usuarias sin experiencia en sistemas | Interfaz simple, en español, sin necesidad de capacitación. |

El stack concreto (framework, base de datos local, empaquetado) está **pendiente de definición** por el equipo.

## Estructura del repositorio

```
FarmasilERP/
├── docs/
│   ├── requisitos/        # Requisitos elicitados, alcance, casos de uso, historias
│   └── planificacion/     # Plan de sprints, DoR, DoD, versiones
├── CHANGELOG.md           # Registro de cambios
├── CONTRIBUTING.md        # Flujo de trabajo, ramas, commits y PR
└── README.md
```

## Documentación

- [Requisitos](docs/requisitos/README.md)
- [Plan de sprints](docs/planificacion/plan-de-sprints.md)
- [Cómo contribuir](CONTRIBUTING.md)
- [Registro de cambios](CHANGELOG.md)

## Equipo Sprint 1

| Integrante | Rol |
|---|---|
| [Chahua Charca, Luis Ayben] | Scrum Master |
| [Chilo Huillca, Oscar Raul] | QA |
| [Jaita Chura, Jose Manuel] | Desarrollador back-end |
| [Yare Chulunquia, Kevin Pedro] | Diseñador front-end |

> Los roles rotan en cada sprint; esta tabla se actualiza al inicio de cada uno.
