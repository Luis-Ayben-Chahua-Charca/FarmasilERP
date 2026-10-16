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

Es re-ejecutable: no duplica labels, milestones ni issues (compara por título).

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
- Los issues de Sprint 1 entran en **Todo**; los demás en **Backlog**.
- Las tareas de Sprints 2–4 se descomponen en el Sprint Planning de cada uno (la historia trae «tareas sugeridas»).
- `{{CÓDIGO}}` dentro de un cuerpo se reemplaza por `#n` al crear.
