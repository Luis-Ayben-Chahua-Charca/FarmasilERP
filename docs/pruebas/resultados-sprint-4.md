# Resultados de las pruebas de aceptación — Sprint 4

Pruebas de aceptación de **HU-06 Registrar y editar productos** (#17), **HU-03 Reporte diario de ventas** (#18) y **HU-09 Reportes gerenciales** (#19), según los casos de [`casos-sprint-4.md`](casos-sprint-4.md) y el [plan de pruebas](plan-de-pruebas.md). Las capturas van en [`evidencias-s4/`](evidencias-s4/). Las pruebas son del issue #20.

Estados posibles: **Pendiente** (aún no se ejecuta), **Pasa**, **Falla** y **No verificado** (con el motivo).

## Datos de la prueba

| Campo | HU-06 | HU-03 | HU-09 |
|---|---|---|---|
| Fecha | 2026-11-24 | 2026-11-24 | Pendiente |
| Probado por | Jose | Jose | Jose |
| Rama o commit probado | `main` en el commit `76f8eb6` | `main` en el commit `76f8eb6` | Pendiente |
| Equipo y sistema operativo | Laptop con Windows; ejecutado en Linux WSL2 | Igual que HU-06 | Pendiente |
| Node.js | Node v24.22.1 del sistema (WSL), no el portátil de `iniciar.bat` | Igual que HU-06 | Igual que HU-06 |
| Navegador | Chrome 158.0.8127.37 | Igual que HU-06 | Pendiente |
| Internet | Sin conexión | Sin conexión | Sin conexión |
| Base de datos | Base «reportes» de `casos-sprint-4.md`, cargada con un script local de prueba (`datos/prueba-reportes.db`) | Igual que HU-06 | Base «reportes» |

## Resultados por criterio de aceptación

### HU-06 — Registrar y editar productos

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU06-1 | CA1 — Alta de producto | Se guarda y aparece en el listado con S/ 0.70 | Coincide con el resultado esperado. | **Pasa** | [CP-HU06-1-alta](evidencias-s4/CP-HU06-1-alta.png), [CP-HU06-1-stock](evidencias-s4/CP-HU06-1-stock.png) |
| CP-HU06-2 | CA2 — Falta un campo | No se guarda; se indica cada campo faltante | Coincide con el resultado esperado. | **Pasa** | [CP-HU06-2-campos-faltantes](evidencias-s4/CP-HU06-2-campos-faltantes.png) |
| CP-HU06-3 | CA3 — Precio en 3 acciones e histórico | Precio nuevo en 3 acciones; la venta del 24/11 sigue en S/ 5.00 | Editar, cambiar el precio a 0.60 y Guardar: completado en 3 acciones. La venta nueva de 10 unidades de Paracetamol sumó S/ 6.00. En el reporte del 24/11 la venta de las 09:12 sigue en S/ 5.00 con Paracetamol a S/ 0.50 c/u. Nota: la venta nueva cayó el mismo 24/11 (fecha del equipo), por lo que el total de ese día subió. | **Pasa** | [CP-HU06-3-edicion](evidencias-s4/CP-HU06-3-edicion.png), [CP-HU06-3-historico](evidencias-s4/CP-HU06-3-historico.png) |

### HU-03 — Reporte diario de ventas

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU03-1 | CA1 — Día con ventas | 24/11: 2 ventas, 16 unidades, S/ 11.40; Paracetamol en una sola fila | 24/11: 2 ventas, 16 unidades y S/ 11.40 (API: numero_ventas 2, monto_total_centimos 1140); Paracetamol en una sola fila (10 u., S/ 5.00). Consola sin errores; Chrome muestra un aviso de accesibilidad (campo sin id ni name) que no afecta el criterio | **Pasa** | [CP-HU03-1-dia-con-ventas](evidencias-s4/CP-HU03-1-dia-con-ventas.png) |
| CP-HU03-2 | CA2 — Día sin ventas | 23/11: aviso y totales en S/ 0.00 | Coincide con el resultado esperado. | **Pasa** | [CP-HU03-2-dia-sin-ventas](evidencias-s4/CP-HU03-2-dia-sin-ventas.png) |
| CP-HU03-3 | CA3 — Solo lectura | Sin controles de edición; solo peticiones GET | Coincide con el resultado esperado. | **Pasa** | [CP-HU03-3-solo-lectura](evidencias-s4/CP-HU03-3-solo-lectura.png) |

### HU-09 — Reportes gerenciales

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HU09-1 | CA1 — Ingresos del periodo | 5 ventas y S/ 32.20; suma de diarios igual al periodo | | Pendiente | |
| CP-HU09-2 | CA2 — Más vendidos | Paracetamol 30 u., Amoxicilina 9 u., Ibuprofeno 8 u. | | Pendiente | |
| CP-HU09-3 | CA3 — Periodo sin ventas | Aviso de que no hay datos y S/ 0.00 | | Pendiente | |
| CP-HU09-4 | Fechas inválidas | Mensajes del contrato; no se muestra ningún reporte | | Pendiente | |

## Pruebas finales (1–2/12)

| ID | Qué se prueba | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| F-1 | Regresión de los Sprints 1–3 (ingreso de lote, lote duplicado, stock, venta con varios lotes, clasificación) | Sin defectos críticos | | Pendiente |
| F-2 | Instalación con `empaquetar.bat` y `docs/instalacion.md`, sin internet (RNF-01) | Abre y funciona en la laptop real | | Pendiente |
| F-3 | Usabilidad con la propietaria y una técnica (RNF-04): venta, ingreso de lote y consulta de stock sin manual | Tareas completadas sin ayuda anotadas | | Pendiente |
| F-4 | Copia y restauración del archivo de datos en una USB (RNF-03) | El dato sobrevive a la restauración | | Pendiente |

## Pruebas automáticas

| Prueba | Issue | Resultado de `npm test` | Estado |
|---|---|---|---|
| `test/reportes-aceptacion.test.js` | #115 | | Pendiente |
| `test/reportes.test.js` | #110, #112, #113 | | Pendiente |
| `test/productos.test.js` (edición) | #105 | | Pendiente |

## Observaciones de QA

| N.º | Observación | Decisión |
|---|---|---|
| O-1 | La regla de asignación de lotes (#72) también vende lotes ya vencidos | Pendiente: decidir con la propietaria si se registra como `bug` o como historia nueva |

## Defectos encontrados

| Issue | Caso | Severidad | Descripción | Estado |
|---|---|---|---|---|
| — | — | — | Pendiente de ejecución | — |

## Checklist de instalación

Se firma al terminar F-2, con el nombre de quienes estuvieron presentes.

| Verificación | Hecho | Firma |
|---|---|---|
| La carpeta se copió a `C:\Farmasil` | Pendiente | |
| `iniciar.bat` abre el sistema sin internet | Pendiente | |
| El acceso directo del escritorio funciona | Pendiente | |
| Los datos siguen disponibles tras reiniciar la laptop | Pendiente | |
