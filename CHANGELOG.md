# Changelog

Todos los cambios relevantes del proyecto se registran en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## Cómo registrar cambios

- Cada PR agrega sus cambios en la sección **[Unreleased]**, bajo la categoría que corresponda, indicando el issue: `- Registro de productos con validación de campos obligatorios (#12)`.
- Al cerrar cada sprint, **[Unreleased]** se convierte en una versión con fecha (`v0.1.0`, `v0.2.0`, `v0.3.0`; el PMV será `v1.0.0`).

Categorías: **Added** (nuevo), **Changed** (cambios en algo existente), **Deprecated** (por retirar), **Removed** (retirado), **Fixed** (correcciones), **Security** (seguridad).

## [Unreleased]

### Added
- Configuración inicial del repositorio: `.gitignore`, `.gitattributes`, `.editorconfig`.
- `README.md`, `CONTRIBUTING.md` y este `CHANGELOG.md`.
- Documentación de requisitos en `docs/requisitos/`: visión y problema, alcance, actores, requisitos funcionales y no funcionales, casos de uso, historias de usuario y glosario.
- Plan de sprints en `docs/planificacion/plan-de-sprints.md`.
- ADR-001 con el stack propuesto, definición del tablero Kanban y asignación de roles por sprint.

### Changed
- Alcance del PMV reducido a **ventas, inventario y reportes**; el catálogo de productos pasa a ser parte de Inventario (`02-alcance.md`).
- RF-03 (descuento por lote más próximo a vencer) confirmado; deja de ser supuesto.
- Precio y stock siempre por unidad (RF-05, RF-07, RN-05, glosario).
- HU-09 (reportes gerenciales) se compromete en el Sprint 4 con criterios de aceptación.
- Replanificación: Sprint 1 acortado a una semana (15–21 oct, solo HT-01); Sprints 2–4 de dos semanas (HU-04/05/08, HU-01/02, HU-06/03/09); HU-07 queda condicional.
- Columnas del tablero simplificadas a Backlog → Todo → In Progress → Done; se elimina «En revisión» (#1).

### Removed
- HU-10 (respaldo desde el sistema): RNF-03 se cubre con un procedimiento manual.
- RNF-05 y HU-11 (precios regulados por DIGEMID): no hay productos con precio regulado.
