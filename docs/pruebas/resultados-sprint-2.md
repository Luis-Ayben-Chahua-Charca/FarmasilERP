# Resultados de las pruebas de aceptación — Sprint 2

Pruebas de aceptación de **HU-04 Registrar ingreso de lote** (#10), **HU-05 Validar duplicidad de lote** (#11) y **HU-08 Consultar stock** (#12), según los casos de [`casos-sprint-2.md`](casos-sprint-2.md) y el [plan de pruebas](plan-de-pruebas.md). Las capturas van en `evidencias-s2/` (se crea al agregar la primera captura). Las pruebas son del issue #13.

Estados posibles: **Pendiente** (aún no se ejecuta), **Pasa**, **Falla** y **No verificado** (con el motivo).

## Datos de la prueba

Se completa al ejecutar cada historia, porque cada una se prueba sobre su propio PR.

| Campo | HU-04 | HU-05 | HU-08 |
|---|---|---|---|
| Fecha | Pendiente | Pendiente | Pendiente |
| Probado por | Pendiente | Pendiente | Pendiente |
| Rama o commit probado | Pendiente | Pendiente | Pendiente |
| Equipo y sistema operativo | Pendiente | Pendiente | Pendiente |
| Node.js portátil | Pendiente | Pendiente | Pendiente |
| Navegador | Pendiente | Pendiente | Pendiente |
| Internet | Pendiente | Pendiente | Pendiente |

## Resultados por criterio de aceptación

### HU-04 — Registrar ingreso de lote

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU04-1 | CA1 — Ingreso de un lote de un producto existente | El lote se guarda y el stock aumenta en esa cantidad | Pendiente | Pendiente | Pendiente |
| CP-HU04-2 | CA2 — «+ Nuevo producto» sin salir del flujo | El producto se registra y queda seleccionado | Pendiente | Pendiente | Pendiente |
| CP-HU04-3 | CA3 — Dato faltante o cantidad no mayor que cero | No se registra y se indica el dato inválido | Pendiente | Pendiente | Pendiente |

### HU-05 — Validar duplicidad de lote

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU05-1 | CA1 — Lote duplicado en el mismo producto | Se rechaza con aviso y el stock no cambia | Pendiente | Pendiente | Pendiente |
| CP-HU05-2 | CA2 — Mismo lote en otro producto | Se acepta | Pendiente | Pendiente | Pendiente |

### HU-08 — Consultar stock

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU08-1 | CA1 — Búsqueda por nombre | Precio y stock total en menos de 2 segundos | Pendiente | Pendiente | Pendiente |
| CP-HU08-2 | CA2 — Detalle por lote | Lotes con vencimiento y cantidad, del más próximo al más lejano | Pendiente | Pendiente | Pendiente |
| CP-HU08-3 | CA3 — Filtros de categoría y tipo | Solo se muestran los productos que cumplen el filtro | Pendiente | Pendiente | Pendiente |

### Tiempo de respuesta de la búsqueda (HU-08 CA1)

Se mide con F12 → Red al buscar por nombre.

| Búsqueda | Tiempo | ¿Menos de 2 s? | Evidencia |
|---|---|---|---|
| `Paracetamol` | Pendiente | Pendiente | Pendiente |

### Stock = ingresos − ventas

| Comprobación | Resultado | Estado |
|---|---|---|
| El stock mostrado es la suma exacta de los ingresos de lotes en todos los casos (en este sprint no hay ventas) | Pendiente | Pendiente |

## Defectos encontrados

Pendiente. Cada defecto se registra como issue `bug` y se lista aquí con su número, severidad y el caso donde apareció.

| Issue | Caso | Severidad | Descripción | Estado |
|---|---|---|---|---|
| — | — | — | Sin defectos registrados todavía | — |

## Revisión de los PR del sprint

Cada PR se revisa contra los criterios de aceptación de su historia.

| PR | Historia | Revisado por | Resultado |
|---|---|---|---|
| Pendiente | HU-04 | Pendiente | Pendiente |
| Pendiente | HU-05 | Pendiente | Pendiente |
| Pendiente | HU-08 | Pendiente | Pendiente |

## Conclusión

Pendiente. Se redacta al terminar la ejecución de las tres historias y antes de la Review del miércoles 4/11.
