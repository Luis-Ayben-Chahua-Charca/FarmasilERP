# Changelog

Todos los cambios relevantes del proyecto se registran en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## Cómo registrar cambios

- Cada PR agrega sus cambios en la sección **[Unreleased]**, bajo la categoría que corresponda, indicando el issue: `- Registro de productos con validación de campos obligatorios (#12)`.
- Al cerrar cada sprint, **[Unreleased]** se convierte en una versión con fecha (`v0.1.0`, `v0.2.0`, `v0.3.0`; el PMV será `v1.0.0`).

Categorías: **Added** (nuevo), **Changed** (cambios en algo existente), **Deprecated** (por retirar), **Removed** (retirado), **Fixed** (correcciones), **Security** (seguridad).

## [Unreleased]

### Added
- Rechazo de ventas por stock insuficiente con mensaje en español, producto y cantidad disponible, sin alterar ventas ni stock; incluye pruebas de cantidades repetidas y límites (#74).
- API de registro de ventas en una sola transacción, con precios del servidor, agrupación de productos repetidos, fecha y hora local y descuento por lote; validaciones y pruebas de rollback (#73).
- Asignación pura de lotes para ventas por vencimiento más próximo y menor id en empate, sin modificar la entrada y con pruebas unitarias (HU-02 CA1 y CA2) (#72).
- Preparación del Sprint 3: tareas de HU-01, HU-02 y HU-07 en `docs/planificacion/tablero/issues/`, asignación detallada con dependencias, contrato de `POST /api/ventas` en `docs/arquitectura/api-ventas.md` y decisiones del sprint en el README del tablero (#84).
- Casos de prueba del Sprint 3 en `docs/pruebas/casos-sprint-3.md` (CP-HU01-1 a CP-HU07-3, regresión R-1 a R-5 y orden de ejecución con el stock esperado) y plantilla de resultados en `docs/pruebas/resultados-sprint-3.md` (#16).

## [0.2.0] - 2026-11-06

Cierre del Sprint 2: HU-04 (registrar ingreso de lote), HU-05 (validar duplicidad de lote) y HU-08 (consultar stock). Incluye también lo del Sprint 1 (HT-01, estructura base e instalación), porque al cerrarlo no se publicó `v0.1.0` (#49).

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
- Plan de pruebas en `docs/pruebas/plan-de-pruebas.md`: niveles, entorno, criterios para pasar a «Done», plantillas de caso de prueba y de defecto, y trazabilidad de las historias del PMV (#7).
- HT-01 verificada: aplicación base instalable sin internet, con menú principal de cinco opciones, persistencia local y empaquetado para la laptop; integra las tareas #4, #5 y #6 (#3).
- Resultados de las pruebas de aceptación del Sprint 1 en `docs/pruebas/resultados-sprint-1.md`: HT-01 cumple CA1, CA2 y CA3 sin internet, con evidencias (#8).
- Casos de prueba del Sprint 2 en `docs/pruebas/casos-sprint-2.md` (CP-HU04-1 a CP-HU08-3) y resultados de su ejecución sin internet en `docs/pruebas/resultados-sprint-2.md`, con capturas en `docs/pruebas/evidencias-s2/`: los 8 casos de HU-04, HU-05 y HU-08 pasan y no hay defectos (#13).
- Rotación de roles para el Sprint 2 en la tabla «Equipo Sprint 2» del `README.md`, según `docs/planificacion/asignacion-roles.md` (#33).
- Tareas del Sprint 2 en `docs/planificacion/tablero/issues/` (HU-04.1 a HU-04.6, HU-05.1, HU-05.2, HU-08.1 a HU-08.5 y SM-S2), con dependencias, responsable y estimación; asignación detallada del Sprint 2 en `asignacion-roles.md` (#50).
- Plantilla de pull request en `.github/pull_request_template.md` y reglas de título, cierre de issues y cierre de historias en `CONTRIBUTING.md` (#50).
- API de ingreso de lote `POST /api/lotes` en `app/rutas/lotes.js`: guarda el lote, responde `201` y el stock aumenta en la cantidad recibida; el servidor acepta JSON y monta la API bajo `/api` (#36).
- Validaciones del servidor en `POST /api/lotes`: responde `400` con `error` y `campo` si falta un dato, la cantidad no es un entero mayor que cero, la fecha no tiene formato `AAAA-MM-DD` o no existe, o el producto no existe; ningún dato inválido llega a la base (#38).
- `scripts/datos-prueba-stock.js` (`npm run datos-prueba-stock`): crea `datos/prueba-stock.db` con 300 productos y 2 a 4 lotes cada uno para medir la búsqueda de W3, sin tocar la base real (#48).
- Medición de `GET /api/stock` en `npm run datos-prueba-stock`: con 300 productos y 904 lotes cada búsqueda responde en menos de 2 s (peor caso medido: 38 ms) (#48).
- API de consulta de stock `GET /api/stock?nombre=&categoria=&tipo=` en `app/rutas/stock.js`: devuelve por producto el precio, el stock total (ingresos − ventas) y los lotes ordenados por vencimiento; busca por nombre sin distinguir mayúsculas y filtra por acción terapéutica y tipo (#44).
- API de productos en `app/rutas/productos.js`: `POST /api/productos` crea un producto con nombre, acción terapéutica y precio unitario obligatorios (el precio llega en soles y se guarda en céntimos; `tipo` opcional) y responde `400` con `error` y `campo` si falta un dato o el precio es negativo; `GET /api/productos` lista los productos ordenados por nombre para el selector de W2 (#37).
- Alta rápida de producto en W2: la opción «+ Nuevo producto» del selector despliega nombre, acción terapéutica y precio por unidad; al guardar, el producto queda seleccionado para registrar su lote. Ajustes al boceto: campos del lote en una fila, placeholders, nota de unidades y mensaje de ingreso con lote, producto y cantidad (#40).
- Detalle por lote desplegable en W3: al hacer clic en el nombre de un producto se abren sus lotes con número, vencimiento y cantidad; si no tiene lotes muestra «Sin lotes registrados» (#46).
- Filtros por categoría (acción terapéutica) y tipo en W3 Consultar stock, con la opción «Todos» para quitar cada filtro; se combinan con la búsqueda por nombre y se envían a `GET /api/stock` (#47).
- Pantalla W3 de consulta de stock: búsqueda por nombre con precio por unidad y stock total de cada producto (#45).
- Pantalla W2 de ingreso de lote: selector de producto, número de lote, vencimiento y cantidad (#39).
- Pruebas de la API para lote duplicado en `test/lotes.test.js`: el segundo ingreso del mismo lote responde `409` en JSON sin crear otro registro ni cambiar el stock, también con espacios en el número; el mismo número en otro producto responde `201` y suma solo a ese producto (#43).
- Rechazo de lote duplicado en `POST /api/lotes`: el mismo número de lote para el mismo producto responde `409` con `error` y `campo` («El lote L-2309 ya está registrado para este producto.») y el stock no cambia; el mismo número en otro producto se acepta (#42).
- Avisos junto al campo en W2: `api.js` conserva `status` y `campo` del error; dato faltante, cantidad menor o igual a cero y lote duplicado (`400` y `409`) se muestran bajo el campo afectado sin borrar lo escrito, y el formulario no se envía si falta un dato o la cantidad no es válida (#41).
- HU-04 Registrar ingreso de lote completa: la propietaria registra un lote con número, vencimiento y cantidad y el stock aumenta en esa cantidad, da de alta un producto sin salir de W2 y el sistema indica el dato inválido sin registrar; integra las tareas #36, #37, #38, #39, #40 y #41 (#10).
- HU-05 Validar duplicidad de lote completa: el mismo número de lote en el mismo producto se rechaza con aviso y sin cambiar el stock, y en otro producto se acepta; integra las tareas #41, #42 y #43 (#11).
- Orden por tipo en Consultar stock: genéricos de la A a la Z y comerciales agrupados por acción terapéutica, con «Sin tipo» para los productos antiguos (HU-07 CA1 y CA2) (#82).
- Pruebas de integración del descuento por vencimiento dentro de la venta: reparto entre lotes, lote en cero, lote registrado después que vence antes y venta de dos productos (HU-02 CA1 y CA2) (#79).

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

### Fixed
- `crear-tablero.sh` ya no reescribe el cuerpo ni los campos del tablero de los issues que ya existen al volver a ejecutarse; la opción `--actualizar=COD,...` reescribe solo el cuerpo de los indicados (#50).
- `crear-tablero.sh` ya no reescribe las columnas de Status de un proyecto existente: hacerlo dejaba todos los items en «No Status» y las automatizaciones sin columna destino. Se agrega `reparar-estados.sh` para devolver cada item a su columna, y las decisiones del tablero quedan registradas en `docs/planificacion/tablero/README.md` (#50).
