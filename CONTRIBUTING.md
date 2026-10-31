# Cómo contribuir

Guía de trabajo del equipo para FarmasilERP. Idioma del proyecto: **español** (código y nombres técnicos pueden ir en inglés si el stack lo requiere, pero documentación, commits, issues y PR van en español).

## 1. Flujo general

```
Issue  →  rama  →  commits (Refs #n)  →  Pull Request (Closes #n)  →  revisión  →  merge a main
```

1. **Todo trabajo parte de un issue** de GitHub (historia, tarea o bug) del tablero del proyecto.
2. Se crea una **rama** desde `main` actualizada.
3. Cada **commit** referencia el issue con `Refs #<n>`.
4. Se abre un **Pull Request** hacia `main`; **solo el PR cierra el issue** (`Closes #<n>`).
5. Otra integrante revisa y aprueba; luego se fusiona.

`main` siempre debe funcionar. No se hacen commits directos en `main`.

## 2. Ramas

Formato: `<tipo>/<n-issue>-<descripcion-corta>`

```
feat/12-registro-productos
fix/31-total-venta-redondeo
docs/5-plan-de-sprints
chore/2-estructura-proyecto
```

- Minúsculas, palabras separadas por guiones, sin tildes ni ñ.
- Una rama por issue. Se elimina después del merge.

## 3. Commits — Conventional Commits

```
<tipo>(<ámbito opcional>): <descripción>

<cuerpo opcional: qué y por qué>

Refs #<n>
```

### Reglas

- **Todo commit en una rama lleva `Refs #<n>`** en el pie, con el número del issue.
- **Nunca** usar `Closes`, `Fixes` ni `Resolves` en commits: el cierre del issue se hace **solo en el PR**.
- Descripción en **imperativo**, minúscula inicial, sin punto final, máximo ~72 caracteres: `agrega validación de lote duplicado`.
- Un commit = un cambio lógico. Evitar commits gigantes o mezclar temas.
- Sin firmas de coautoría ni atribuciones automáticas (`Co-Authored-By`, "Generated with…", etc.).

### Tipos

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de un error |
| `docs` | Solo documentación |
| `style` | Formato, sin cambiar lógica |
| `refactor` | Cambio de código que no agrega funcionalidad ni corrige errores |
| `test` | Agrega o corrige pruebas |
| `build` | Dependencias, empaquetado, instalador |
| `ci` | Integración continua |
| `perf` | Mejora de rendimiento |
| `chore` | Mantenimiento y configuración |

### Ámbitos sugeridos

`catalogo`, `inventario`, `ventas`, `reportes`, `respaldo`, `ui`, `db`, `core`, `docs`.

### Ejemplos

```
feat(catalogo): agrega registro de productos con campos obligatorios

Valida nombre, acción terapéutica y precio antes de guardar.

Refs #12
```

```
fix(ventas): corrige redondeo del total con decimales

Refs #31
```

Cambio incompatible: agregar `!` tras el tipo (`feat(db)!: ...`) y explicar en el cuerpo con `BREAKING CHANGE:`.

## 4. Pull Requests

- **Título** en formato Conventional Commits (`feat(inventario): agrega API de ingreso de lote`), nunca el nombre de la rama: con *Squash and merge* el título queda como mensaje del commit en `main`.
- **Descripción:** GitHub la llena con la plantilla [`.github/pull_request_template.md`](.github/pull_request_template.md). Completar cada sección y borrar las opcionales que no apliquen.
- **Criterios de aceptación:** copiar todos los del issue y marcar los que se probaron.
- **Evidencia (todo PR):** si cambia una pantalla, comprobaciones de F12 (consola sin errores, red sin peticiones externas, menos de 2 s), que prueba quien revisa antes de aprobar; si no cambia pantallas (API, base de datos, scripts, documentos), el resultado de `npm test`, de la API o del script.
- **Cierre del issue:** `Closes #n` cuando el PR completa el issue; `Refs #n` cuando aporta a un issue que completa otro PR (por ejemplo, una parte de una tarea compartida).
- **Cierre de una historia (HU/HT):** cuando sus tareas están fusionadas y QA verificó sus criterios de aceptación, la dueña de la historia abre un PR corto con la línea de cierre en `CHANGELOG.md`, la lista de tareas integradas y `Closes #<historia>` (como el PR #31 cerró HT-01).
- Actualizar `CHANGELOG.md` en **[Unreleased]**.
- Requiere **1 aprobación** de otra integrante.
- Se fusiona con **Squash and merge**, usando el título del PR como mensaje.
- Antes de pedir revisión: la rama está actualizada con `main` y la app funciona **sin internet**.

## 5. Definition of Ready y Definition of Done

Ver [`docs/planificacion/plan-de-sprints.md`](docs/planificacion/plan-de-sprints.md). En resumen, una historia está **Hecha** cuando su PR está fusionado y aprobado, cumple sus criterios de aceptación, funciona offline en la laptop, no deja errores conocidos y actualizó el CHANGELOG.

## 6. Reglas técnicas del proyecto

- **Offline primero:** no agregar dependencias que requieran internet en tiempo de ejecución (CDN, fuentes remotas, APIs, servicios cloud).
- **Alcance:** no implementar funciones fuera de [`docs/requisitos/02-alcance.md`](docs/requisitos/02-alcance.md) sin acuerdo del equipo.
- **Datos:** nunca versionar bases de datos, respaldos ni archivos `.env` (ya están en `.gitignore`).
- **Requisitos:** si un cambio contradice un documento de `docs/requisitos/`, se actualiza el documento en el mismo PR o se discute antes.

## 7. Versiones

Versionado semántico. Al cierre de cada sprint se crea una etiqueta: `v0.1.0` (Sprint 1), `v0.2.0` (Sprint 2), `v0.3.0` (Sprint 3) y `v1.0.0` (PMV, 3 de diciembre de 2026).
