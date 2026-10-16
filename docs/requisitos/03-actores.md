# 03 — Actores e interesados

## Usuarios del sistema

| Actor | Descripción | Qué hace en el sistema |
|---|---|---|
| **Técnica Farmacéutica** | Atiende el mostrador de 9:00 a 21:00. Sin experiencia previa en sistemas de información. | Registra ventas, consulta stock y el reporte diario. |
| **Propietaria / Administradora** | Responsable del negocio. Autoriza el ingreso de productos y revisa resultados cada ~15 días. Sin experiencia previa en sistemas. | Registra ingresos de lotes, gestiona catálogo y precios, genera reportes. Además hereda todo lo que hace la técnica. |

> Las dos usuarias comparten **la misma laptop** de forma alterna. El sistema no maneja inicio de sesión en esta versión (HU-16 está fuera de alcance), por lo que los roles son conceptuales: definen quién usa cada función, no permisos técnicos.

## Actores y sistemas externos

No interactúan con el sistema dentro del alcance definido.

| Actor / sistema | Relación |
|---|---|
| POS (terminal de punto de venta) | Sigue cobrando (tarjeta, Yape, Plin) y emitiendo boletas. Sin integración. |
| Proveedores (droguerías, distribuidoras) | Entregan los lotes que se registran. Su gestión está fuera de alcance. |
| Clientes de la farmacia | Compran en mostrador; la técnica registra la venta por ellos. |

## Interesados (resumen)

| ID | Interesado | Poder | Interés | Estrategia |
|---|---|---|---|---|
| I-01 | Propietaria / Administradora | Alto | Alto | Gestionar de cerca: valida historias y acepta cada incremento en la Sprint Review |
| I-02 | Técnicas farmacéuticas | Bajo | Alto | Mantener informado: pruebas de usabilidad en los sprints 2 a 4 |
| I-03 | Equipo de desarrollo | Alto | Alto | Gestionar de cerca: eventos Scrum, DoR y DoD |
| I-04 | Químico(a) farmacéutico(a) responsable | Bajo | Bajo | Monitorear |
| I-06 | Proveedores | Bajo | Bajo | Monitorear |
| I-07 | Clientes de la farmacia | Bajo | Bajo | Monitorear |
