# Documentación de requisitos

Requisitos elicitados para el **Sistema de Control de Ventas e Inventario para la Farmacia Farmasil**. Estos documentos son la fuente de verdad del alcance: toda funcionalidad implementada debe poder rastrearse a un requisito de esta carpeta.

| Documento | Contenido |
|---|---|
| [01-vision-y-problema.md](01-vision-y-problema.md) | Contexto del negocio, problema identificado y objetivos de la solución |
| [02-alcance.md](02-alcance.md) | Qué entra y qué no entra en el proyecto; módulos y componentes |
| [03-actores.md](03-actores.md) | Usuarios del sistema, actores externos e interesados |
| [04-requisitos-funcionales.md](04-requisitos-funcionales.md) | Catálogo de requisitos funcionales (RF-01 a RF-11) |
| [05-requisitos-no-funcionales.md](05-requisitos-no-funcionales.md) | Catálogo de requisitos no funcionales (RNF-01 a RNF-08) |
| [06-casos-de-uso.md](06-casos-de-uso.md) | Casos de uso (CU-01 a CU-06) y ficha del caso de uso principal |
| [07-historias-de-usuario.md](07-historias-de-usuario.md) | Product Backlog: historias de usuario, prioridad MoSCoW, estimación y criterios de aceptación |
| [08-glosario.md](08-glosario.md) | Términos del dominio farmacéutico y del proyecto |

La planificación de sprints, la Definition of Ready y la Definition of Done están en [`../planificacion/plan-de-sprints.md`](../planificacion/plan-de-sprints.md).

## Trazabilidad

```
Problema (01) → Alcance (02) → RF / RNF (04, 05) → Casos de uso (06) → Historias de usuario (07) → Issues y commits
```

## Convenciones de identificadores

| Prefijo | Significado | Ejemplo |
|---|---|---|
| `RF-xx` | Requisito funcional | RF-05 |
| `RNF-xx` | Requisito no funcional | RNF-01 |
| `CU-xx` | Caso de uso | CU-01 |
| `HU-xx` | Historia de usuario | HU-06 |
| `HT-xx` | Historia técnica | HT-01 |
| `CAx` | Criterio de aceptación dentro de una historia | CA2 |

Cualquier cambio en estos documentos se trata como un cambio de alcance: se acuerda con el equipo, se registra en el [CHANGELOG](../../CHANGELOG.md) y se hace mediante un PR con commits de tipo `docs`.
