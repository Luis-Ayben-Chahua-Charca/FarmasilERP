# Plan de sprints

## Parámetros

| Parámetro | Valor |
|---|---|
| Marco de trabajo | Scrum |
| Equipo | 4 integrantes. **Los roles rotan en cada sprint**; la asignación vigente está en el [README](../../README.md#equipo-sprint-1) |
| Dedicación | 6 h/semana por integrante |
| Capacidad neta por sprint de 2 semanas | 38.4 h-h (20 % reservado para eventos Scrum y documentación) |
| Velocidad estimada | 13 puntos por sprint de 2 semanas; **~6.5 puntos en el Sprint 1** (1 semana) |
| Inicio | Jueves 15 de octubre de 2026 |
| **Entrega del PMV** | **Jueves 3 de diciembre de 2026** |

## Sprints

El **Sprint 1 es el acortado** (1 semana). Los Sprints 2, 3 y 4 duran 2 semanas cada uno y empiezan en jueves.

| Sprint | Fechas | Historias | Pts. | Incremento |
|---|---|---|---|---|
| 1 | jue 15 oct – mié 21 oct (1 semana) | HT-01 | 5 | Aplicación base instalada en la laptop, con menú y persistencia local |
| 2 | jue 22 oct – mié 4 nov (2 semanas) | HU-04, HU-05, HU-08 | 12 | Ingreso de lotes (con alta rápida de producto), validación de duplicidad y consulta de stock |
| 3 | jue 5 nov – mié 18 nov (2 semanas) | HU-01, HU-02 | 11 | Registro de ventas con descuento por lote más próximo a vencer |
| 4 | jue 19 nov – jue 3 dic (2 semanas) | HU-06, HU-03, HU-09 | 13 | Catálogo con edición de precios, reporte diario y reportes gerenciales; **entrega del PMV** |
| — | Condicional | HU-07 | 3 | Clasificación genérico/comercial; entra al Sprint 3 solo si el Sprint 2 cumple su velocidad |

Total comprometido: 41 pts frente a una capacidad aproximada de 45 pts.

### Criterios de la distribución

- **Sprint 1 (1 semana):** solo la base técnica (HT-01), que bloquea todo lo demás. El resto de la capacidad se usa en preparar el Sprint 2: aprobar el ADR-001 (plazo: viernes 16/10), escribir el plan de pruebas y hacer los bocetos W2 y W3 para cumplir la DoR.
- **Sprint 2:** primero el **problema #1** de la propietaria (ingreso de lotes) y el **stock**, dos de sus tres prioridades. El alta de productos se hace dentro del ingreso de lote (HU-04 CA2), así que el inventario funciona sin esperar la pantalla de catálogo.
- **Sprint 3:** HU-01 y HU-02 van juntas porque el descuento de stock de la venta depende de la regla del lote más próximo a vencer.
- **Sprint 4:** HU-06 (pantalla de catálogo y edición de precios) se reestima a la baja en su Sprint Planning, porque el alta y la validación de productos ya existen desde HU-04. **Congelamiento de código: martes 1 de diciembre.** El 1 y 2 de diciembre se dedican a pruebas finales e instalación en la laptop. El 3 de diciembre se hace la Sprint Review con la propietaria y se entrega el PMV.
- Con la reducción del alcance a ventas, inventario y reportes (15/10/2026), **HU-10** (respaldo) sale del PMV y RNF-03 se cubre con un procedimiento manual de copia del archivo de datos, verificado en TQ-S4. **HU-11** se retira porque no hay productos con precio regulado.

### Orden de recorte si la velocidad real es menor

1. Si HT-01 no está Hecha al cierre del Sprint 1 (21/10), se termina al inicio del Sprint 2 y **HU-05** (2 pts) pasa al Sprint 3, que tiene holgura.
2. **HU-07** no entra.
3. **HU-09** se reduce al reporte de ingresos; el de más vendidos pasa a una fase posterior.
4. Las historias **Must** no se recortan.

## Eventos de cada sprint

| Evento | Momento | Duración |
|---|---|---|
| Sprint Planning | Primer día del sprint | 2 h |
| Daily Scrum | Tres veces por semana | 15 min |
| Sprint Review | Último día del sprint, con la propietaria | 45 min |
| Sprint Retrospective | Último día del sprint | 30 min |

## Pruebas

El plan de pruebas se documenta en `docs/pruebas/plan-de-pruebas.md` (issue TQ-01, rol QA, Sprint 1). En cada sprint, el rol QA ejecuta las pruebas de aceptación del sprint (TQ-S1 a TQ-S3). El 1 y 2 de diciembre se hacen las pruebas finales, la prueba de usabilidad con la propietaria y la instalación (TQ-S4). Estas actividades no suman puntos: salen del 20 % de capacidad reservado.

La asignación de personas por rol en cada sprint está en [`asignacion-roles.md`](asignacion-roles.md).

## Definition of Ready (DoR)

Una historia entra a un sprint solo si:

- [ ] Está redactada como *Como / Quiero / Para*.
- [ ] Tiene criterios de aceptación Dado-Cuando-Entonces.
- [ ] Está estimada en puntos de historia.
- [ ] Tiene identificadas sus dependencias e interesados.
- [ ] Tiene boceto de la pantalla correspondiente (si aplica).

## Definition of Done (DoD)

Una tarea o historia está terminada cuando:

- [ ] El código está integrado en `main` mediante un PR aprobado por otra integrante.
- [ ] Los criterios de aceptación fueron verificados.
- [ ] Funciona en la laptop **sin conexión a internet**.
- [ ] No deja errores conocidos abiertos.
- [ ] El `CHANGELOG.md` está actualizado en la sección `[Unreleased]`.

## Flujo de trabajo (Kanban)

`Backlog → Todo → In Progress (WIP 4) → Done`

- **Backlog:** historias y tareas de sprints futuros.
- **Todo:** comprometidas en el sprint actual (se mueven aquí en el Sprint Planning).
- **In Progress:** su responsable la inició y sus dependencias están terminadas. Sigue aquí mientras su PR está abierto y en revisión; el PR enlazado se ve en la tarjeta.
- **Done:** automático al cerrar el issue (lo cierra el PR fusionado con `Closes #n`), cumpliendo la DoD.

## Versiones

| Versión | Al cierre de |
|---|---|
| `v0.1.0` | Sprint 1 |
| `v0.2.0` | Sprint 2 |
| `v0.3.0` | Sprint 3 |
| `v1.0.0` | Sprint 4 — PMV (3 de diciembre de 2026) |
