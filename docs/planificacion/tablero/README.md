# Tablero Kanban — definición de issues

Fuente de verdad del backlog inicial en GitHub. Cada archivo de `issues/` es un issue (cabecera + cuerpo en Markdown); `crear-tablero.sh` los sube junto con labels, milestones (= sprints) y el proyecto.

## Cómo ejecutarlo (una vez)

Usar **Git Bash** (menú Inicio → «Git Bash»), no CMD ni PowerShell: en esas consolas `bash` llama a WSL. Si se prefiere CMD, reemplazar `bash` por `"C:\Program Files\Git\bin\bash.exe"`. No requiere `jq`.

```bash
winget install GitHub.cli          # si no está instalado
gh auth login
gh auth refresh -s project         # permiso para GitHub Projects
bash docs/planificacion/tablero/crear-tablero.sh --dry-run   # ensayo: lee GitHub (requiere gh autenticado) pero no crea nada
bash docs/planificacion/tablero/crear-tablero.sh
```

Es re-ejecutable: no duplica labels, milestones ni issues (compara por título). Los issues que ya existen no se modifican; para reescribir el cuerpo de alguno desde su archivo (por ejemplo, al agregar sus tareas en el Sprint Planning) se nombra en `--actualizar`:

```bash
bash docs/planificacion/tablero/crear-tablero.sh --actualizar=HU-04,HU-05,HU-08,TQ-S2
```

Las tareas nuevas se crean en **Todo**; las historias actualizadas conservan su columna y se mueven a mano.

## Después de ejecutar

1. En el proyecto, crear/ajustar la vista **Board** agrupada por **Status** (Backlog → Todo → In Progress → Done). Si el script avisó que no pudo renombrar las columnas, editar las opciones en *Settings → Status*.
2. Revisar las automatizaciones integradas (menú `…` → Workflows): *Item added to project → Backlog*, *Item closed → Done*, *Pull request merged → Done* e *Item reopened → In Progress*. Si se cambian las opciones de Status, hay que volver a elegirlas en cada workflow: GitHub no avisa cuando la opción destino desaparece.
3. Límite WIP (4 en In Progress): GitHub no lo fuerza; se respeta por convención.
4. Crear la vista **Tabla por sprint** (pestaña *+ New view → Table*):
   - Columnas visibles: Title, Assignees, Rol, Status, Sprint, Puntos, Horas, Labels.
   - *Group by*: **Sprint**. *Sort by*: Rol.
   - Filtro opcional para trabajar solo el sprint actual: `sprint:"Sprint 1"`.
   - Ahí se asignan las personas por sprint según [`../asignacion-roles.md`](../asignacion-roles.md): filtrar por `rol:Back-end`, seleccionar las filas y asignarlas a quien tenga ese rol en el sprint.
5. Agregar la vista **Por responsable** (Board agrupado por Assignees) si se quiere ver la carga de cada integrante.

## Convenciones

- **Sprint = milestone.** Puntos y horas están en campos numéricos del proyecto (`Puntos`, `Horas`).
- **Rol** es un campo fijo del issue (qué tipo de trabajo es); la **persona** se asigna en cada sprint, porque los roles rotan.
- Los issues del sprint actual entran en **Todo**; los demás en **Backlog**.
- Las tareas de Sprints 2–4 se descomponen en el Sprint Planning de cada uno: se agrega un archivo por tarea en `issues/` y se sube con el script.
- `{{CÓDIGO}}` dentro de un cuerpo se reemplaza por `#n` al crear.

## Decisiones sobre el manejo del tablero

Decisiones vigentes. Si alguna cambia, se actualiza esta sección en el mismo PR.

| Fecha | Decisión | Motivo |
|---|---|---|
| 15/10/2026 | El backlog se versiona como archivos en `issues/` y se sube con `crear-tablero.sh`. | Fuente única revisable por PR; evita crear issues a mano con datos distintos. |
| 21/10/2026 | Columnas **Backlog → Todo → In Progress → Done**, con los nombres en inglés de GitHub. Sin columna «En revisión»: el PR abierto se ve en la tarjeta (#1). | Las automatizaciones integradas de GitHub usan esas columnas. |
| 21/10/2026 | Automatizaciones activas (menú `…` → *Workflows*): *Item added to project → Backlog*, *Item closed → Done*, *Pull request merged → Done*, *Item reopened → In Progress*. | Un issue llega a **Done** solo cuando lo cierra un PR fusionado con `Closes #n`; nadie lo mueve a mano. |
| 21/10/2026 | WIP de 4 en **In Progress**, por convención (GitHub no lo fuerza). | Una tarea en curso por integrante. |
| 30/10/2026 | Las columnas de Status se configuran **una sola vez**, al crear el proyecto. El script no vuelve a escribir las opciones de Status en un proyecto existente; si falta una columna, avisa y se agrega a mano en *Settings → Status*. | Al reescribirlas, GitHub les asigna IDs nuevos: todos los items quedan en «No Status» y las automatizaciones pierden su columna destino (incidente del 30/10, ver abajo). |
| 30/10/2026 | Al volver a ejecutar `crear-tablero.sh`, los issues existentes no se modifican: ni el cuerpo ni sus campos del tablero. El cuerpo se reescribe solo con `--actualizar=COD,...`. | Evita borrar casillas marcadas y devolver a «Todo» lo que está en «Done». |
| 30/10/2026 | En el Sprint 2 las tareas se asignan con la tabla de `asignacion-roles.md` (sección 4), no filtrando por el campo Rol. | El Scrum Master toma tareas de back-end y front-end para equilibrar la carga. |
| 30/10/2026 | Las historias (HU/HT) no se cierran solas al cerrarse sus tareas: las cierra un PR de su dueña con `Closes #n`, después de que QA verifica sus criterios de aceptación. Plantilla única de PR en `.github/pull_request_template.md`, con evidencia obligatoria en todo PR (comprobaciones de F12 si cambia una pantalla, que prueba quien revisa; resultado de pruebas o de la API si no). | Precedente del PR #31 (HT-01); unifica títulos y descripciones de PR, que en el Sprint 1 variaban (#23, #24, #26, #34), y la evidencia que piden back-end y front-end. |

### Incidente del 30/10/2026: estados perdidos

Al subir las tareas del Sprint 2, `crear-tablero.sh` volvió a escribir las opciones de Status de un proyecto que ya existía. Los 22 items que ya existían quedaron en «No Status» (incluidos los cerrados del Sprint 1) y las automatizaciones quedaron sin columna destino. Se corrigió el script y se agregó `reparar-estados.sh`.

**Cómo recuperarse si vuelve a pasar:**

1. En el proyecto, menú `…` → *Workflows*: abrir cada automatización de la tabla anterior, volver a elegir su columna destino y verificar que esté **activada**.
2. En Git Bash, en la raíz del repo:
   ```bash
   bash docs/planificacion/tablero/reparar-estados.sh --dry-run
   bash docs/planificacion/tablero/reparar-estados.sh
   ```
   Solo mueve los items sin estado: cerrados → **Done**; abiertos del sprint actual → **Todo**; los demás → **Backlog**. El sprint actual se cambia con `SPRINT_ACTUAL="Sprint 3" bash ...`.
3. Lo que estaba en **In Progress** vuelve a **Todo**: su responsable lo mueve a mano.
