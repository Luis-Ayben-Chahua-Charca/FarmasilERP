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
- `package.json` y servidor Express mínimo en `app/server.js` (solo `127.0.0.1`), base común para HT-01 (#3).
- Esqueleto de la interfaz en `app/public/`: layout con menú lateral en español (Registrar venta, Consultar stock, Ingreso de lotes, Productos, Reportes), navegación sin recarga y una pantalla vacía por opción (W1–W5) (#4).
- Módulo común `js/api.js` para las llamadas a la API local (#4).
- `iniciar.bat` para abrir el sistema en la laptop, `empaquetar.bat` para armar la carpeta de instalación sin internet, `docs/instalacion.md` (instalación, copia de datos y pruebas) y sección de instalación en el `README.md` (#6).
- `scripts/prueba-persistencia.js` (`npm run prueba-persistencia`) para comprobar que un dato sobrevive al reinicio de la laptop (#6).
- Persistencia local: conexión a SQLite en `app/db/`, migraciones SQL numeradas, esquema inicial (producto, lote, venta y línea de venta) con lote único por producto y diagrama del modelo de datos (#5).
- Boceto W3 Consultar stock en `docs/diseno/w3-consultar-stock.html` (#9).
- Boceto W2 Ingreso de lotes en `docs/diseno/w2-ingreso-lote.html`, con alta rápida de producto y mensajes de error (#9).
- HT-01 verificada: aplicación base instalable sin internet, con menú principal de cinco opciones, persistencia local y empaquetado para la laptop; integra las tareas #4, #5 y #6 (#3).
- Resultados de las pruebas de aceptación del Sprint 1 en `docs/pruebas/resultados-sprint-1.md`: HT-01 cumple CA1, CA2 y CA3 sin internet, con evidencias (#8).

### Changed
- Alcance del PMV reducido a **ventas, inventario y reportes**; el catálogo de productos pasa a ser parte de Inventario (`02-alcance.md`).
- RF-03 (descuento por lote más próximo a vencer) confirmado; deja de ser supuesto.
- Precio y stock siempre por unidad (RF-05, RF-07, RN-05, glosario).
- HU-09 (reportes gerenciales) se compromete en el Sprint 4 con criterios de aceptación.
- `better-sqlite3` baja a la serie 12.11.x, que trae binario precompilado para Windows x64 y no exige compilador de C++ al instalar (#5).
- Replanificación: Sprint 1 acortado a una semana (15–21 oct, solo HT-01); Sprints 2–4 de dos semanas (HU-04/05/08, HU-01/02, HU-06/03/09); HU-07 queda condicional.
- Columnas del tablero simplificadas a Backlog → Todo → In Progress → Done; se elimina «En revisión» (#1).

### Removed
- HU-10 (respaldo desde el sistema): RNF-03 se cubre con un procedimiento manual.
- RNF-05 y HU-11 (precios regulados por DIGEMID): no hay productos con precio regulado.
