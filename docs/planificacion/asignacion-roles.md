# Asignación de roles por sprint

Los roles **rotan en cada sprint** (regla del curso). En el tablero, cada issue tiene un campo **Rol** fijo, que indica qué tipo de trabajo es. La **persona** (*Assignee*) se asigna al inicio de cada sprint según la tabla de rotación. Este documento es una **propuesta**: se confirma en cada Sprint Planning y, si cambia, se actualiza aquí y en la tabla de equipo del `README.md`.

## 1. Rotación propuesta

Rotación circular: cada integrante pasa por los cuatro roles una vez.

| Integrante | Sprint 1 (15–21 oct, 1 semana) | Sprint 2 (22 oct–4 nov) | Sprint 3 (5–18 nov) | Sprint 4 (19 nov–3 dic) |
|---|---|---|---|---|
| Chahua Charca, Luis Ayben | Scrum Master | QA | Back-end | Front-end |
| Chilo Huillca, Oscar Raul | QA | Back-end | Front-end | Scrum Master |
| Jaita Chura, Jose Manuel | Back-end | Front-end | Scrum Master | QA |
| Yare Chulunquia, Kevin Pedro | Front-end | Scrum Master | QA | Back-end |

Por qué este orden:
- Quien entra a un rol de desarrollo **viene del rol vecino**. El QA del sprint anterior pasa a back-end y ya conoce los criterios de aceptación. El back-end pasa a front-end y ya conoce la API.
- El sprint más pesado en lógica (Sprint 3, ventas, 8 + 3 pts) lo toma en back-end alguien que ya hizo QA en el Sprint 2 y conoce los casos de prueba de stock.
- Los **puntos son del equipo**, no del rol: Scrum Master y QA también toman tareas de desarrollo cuando el rol dueño está saturado. El reparto fino se cierra en cada Sprint Planning.
- Cada integrante es QA una vez, así que todos escriben y ejecutan pruebas.

**Traspaso al cerrar cada sprint** (15 min, después de la Retrospective): quien deja un rol le explica a quien lo recibe el estado de su módulo, las decisiones tomadas y los pendientes. Se deja una nota corta en el issue de pruebas del sprint.

## 2. Qué asignar a cada rol

| Rol | Responsabilidad | Issues que recibe |
|---|---|---|
| Scrum Master | Facilitar eventos, cuidar el tablero y los WIP, eliminar bloqueos | CH-01 (solo Sprint 1); apoyo en tareas de desarrollo si sobra capacidad |
| QA | Plan y ejecución de pruebas, registro de `bug`, revisión de PR contra criterios de aceptación | TQ-01, TQ-S1 … TQ-S4 |
| Back-end | Modelo de datos, lógica, API, pruebas unitarias | Issues con Rol = Back-end |
| Front-end | Bocetos, pantallas, textos y usabilidad | Issues con Rol = Front-end |
| Equipo | Decisiones que aprueban las cuatro integrantes | HT-01.1 (ADR-001) |

La **historia** (HU/HT) se asigna a la persona del rol indicado en su campo Rol, que actúa como **dueña de la historia**: coordina sus tareas y abre o verifica el PR final. Las **tareas** se asignan a quien las ejecuta.

## 3. Sprint 1 (1 semana) — asignación detallada

| Issue | Rol | Persona | Horas |
|---|---|---|---|
| CH-01 Configurar tablero | Scrum Master | Luis | 2 |
| HT-01.1 Aprobar ADR-001 (**plazo: vie 16/10**) | Equipo | Las cuatro | 3 (en conjunto) |
| HT-01 Estructura base (dueña) | Back-end | Jose | — |
| HT-01.2 Esqueleto y menú | Front-end | Kevin | 4 |
| HT-01.3 Persistencia y esquema | Back-end | Jose | 4 |
| HT-01.4 Empaquetado e instalación | Back-end | **Luis** (balance) | 3 |
| TQ-01 Plan de pruebas | QA | Oscar | 4 |
| TQ-S1 Pruebas de aceptación S1 | QA | Oscar | 2 |
| DOR-S2 Bocetos W2 y W3 | Front-end | Kevin (W2) y Jose (W3) | 3 |

Carga aproximada en la semana: Luis ~6 h, Oscar ~7 h, Jose ~6 h, Kevin ~6 h, frente a 6 h nominales por persona. Jose hace el boceto W3 porque en el Sprint 2 será el front-end de HU-08 (Consultar stock).

## 4. Sprint 2 (2 semanas) — asignación detallada

Tareas creadas en el Sprint Planning del 22/10, con la carga equilibrada: el Scrum Master toma tareas de desarrollo para que back-end no supere su capacidad, y QA queda con holgura para corregir los defectos que salgan de TQ-S2. En este sprint **las tareas se asignan con esta tabla**, no filtrando por el campo Rol, porque Kevin hace trabajo de back-end y front-end.

| Issue | Rol (tipo de trabajo) | Persona | Horas |
|---|---|---|---|
| #10 HU-04 Ingreso de lote (dueña) | Back-end | Oscar | — |
| #36 HU-04.1 API de ingreso de lote | Back-end | Oscar | 3 |
| #37 HU-04.2 API de productos | Back-end | Oscar | 2 |
| #38 HU-04.3 Validaciones del servidor | Back-end | **Kevin** (apoyo) | 1.5 |
| #39 HU-04.4 Pantalla W2 | Front-end | Jose | 3 |
| #40 HU-04.5 Alta rápida de producto | Front-end | Jose | 2 |
| #41 HU-04.6 Mensajes de error en W2 (HU-04 y HU-05) | Front-end | **Kevin** (apoyo) | 2 |
| #11 HU-05 Lote duplicado (dueña) | Back-end | Oscar | — |
| #42 HU-05.1 Rechazo de duplicado en la API | Back-end | Oscar | 2 |
| #43 HU-05.2 Pruebas automatizadas de duplicado | QA | Luis | 2 |
| #12 HU-08 Consultar stock (dueña) | Front-end | Jose | — |
| #44 HU-08.1 API de consulta de stock | Back-end | Oscar | 3 |
| #45 HU-08.2 Pantalla W3 | Front-end | Jose | 3 |
| #46 HU-08.3 Detalle por lote | Front-end | Jose | 2 |
| #47 HU-08.4 Filtros por categoría y tipo | Front-end | **Kevin** (apoyo) | 2 |
| #48 HU-08.5 Datos de prueba y medición < 2 s | Front-end | **Kevin** (apoyo) | 2 |
| #13 TQ-S2 Pruebas de aceptación | QA | Luis | 7 |
| #49 SM-S2 Facilitación y cierre del sprint | Scrum Master | Kevin | 3 |

Carga: Oscar 10 h, Jose 10 h, Kevin 10.5 h, Luis 9 h (más holgura para defectos), frente a 9.6 h netas por persona.

**Orden de trabajo:** HU-04.1 y HU-04.2 no dependen de nada y desbloquean al resto; la ruta crítica es #36 → #44 → #45 → #48 → #13. HU-04.4 se integra antes que HU-04.5 y HU-04.6, que tocan el mismo archivo. Las dependencias de cada tarea están en su issue.

## 5. Sprints 2–4 — asignación por historia

Las tareas de estos sprints se crean en su Sprint Planning. Aquí va la dueña de cada historia según la rotación.

| Sprint | Issue | Rol | Persona |
|---|---|---|---|
| 2 | HU-04 Ingreso de lote (con alta rápida de producto) | Back-end | Oscar (pantalla W2: Jose) |
| 2 | HU-05 Lote duplicado | Back-end | Oscar |
| 2 | HU-08 Consultar stock | Front-end | Jose |
| 2 | TQ-S2 Pruebas S2 | QA | Luis |
| 2 | Scrum Master (apoya tareas de HU-04) | Scrum Master | Kevin |
| 3 | HU-01 Registrar venta | Back-end | Luis (pantalla W1: Oscar) |
| 3 | HU-02 Lote más próximo a vencer | Back-end | Luis |
| 3 | HU-07 Clasificación (solo si entra) | Front-end | Oscar |
| 3 | TQ-S3 Pruebas S3 | QA | Kevin |
| 3 | Scrum Master (apoya HU-02) | Scrum Master | Jose |
| 4 | HU-06 Catálogo y edición de precios | Front-end | Luis |
| 4 | HU-03 Reporte diario | Front-end | Luis (consulta: Kevin) |
| 4 | HU-09 Reportes gerenciales | Back-end | Kevin |
| 4 | TQ-S4 Pruebas S4 y finales (1–2 dic) | QA | Jose (con todo el equipo) |
| 4 | Scrum Master (apoya HU-03) | Scrum Master | Oscar |

## 6. Cómo aplicarlo en GitHub

1. Abrir la vista **Tabla por sprint** del proyecto (creación descrita en `tablero/README.md`).
2. Filtrar `sprint:"Sprint N" rol:Back-end`, seleccionar las filas y asignar (*Assignees*) a la persona de la tabla 1. Repetir con cada rol.
3. Actualizar la tabla *Equipo* del `README.md` con los roles del sprint.
