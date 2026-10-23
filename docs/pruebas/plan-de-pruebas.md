# Plan de pruebas — FarmasilERP

Este documento explica cómo vamos a comprobar que el sistema funciona y qué pruebas debe pasar una historia antes de moverla a **Done**. Lo mantiene el rol de QA de cada sprint.

## 1. Alcance

Se prueba lo que está dentro del PMV: **inventario** (productos, lotes y stock), **ventas** y **reportes**, además de la instalación en la laptop sin internet. Lo que está fuera de alcance (proveedores, alertas, clientes, inicio de sesión, etc.) no se prueba. Ver [`02-alcance.md`](../requisitos/02-alcance.md).

## 2. Niveles de prueba

| Nivel | Qué se prueba | Cómo | Quién |
|---|---|---|---|
| Unitarias | Lógica de stock, totales de venta y validaciones de la base de datos | Con `node:test` y Supertest (ADR-001). Se ejecutan con `npm test` | Quien desarrolla la historia |
| Aceptación | Los criterios Dado-Cuando-Entonces de cada historia | A mano, siguiendo los casos de la sección 6 | QA |
| Usabilidad (RNF-04) | Que la propietaria y la técnica usen el sistema sin capacitación | Se les pide hacer una tarea (por ejemplo, registrar una venta) sin ayuda y se anota dónde dudan | QA, con la propietaria |
| Instalación (RNF-01) | Que el sistema se instale y abra sin internet | Siguiendo [`docs/instalacion.md`](../instalacion.md) en una máquina limpia | QA |

## 3. Entorno de pruebas

- **Equipo:** la laptop de la farmacia o, si no está disponible, una PC con Windows x64 parecida.
- **Sin internet:** se desconecta el Wi-Fi o el cable antes de probar.
- **Node.js:** la versión portátil 24 LTS que va dentro del paquete.
- **Navegador:** el predeterminado de la laptop.
- **Datos:** una base de prueba, nunca la base real de la farmacia.

## 4. Criterios de entrada y salida

| Nivel | Se puede empezar cuando… | Se da por terminado cuando… |
|---|---|---|
| Unitarias | El código de la historia está en su rama | `npm test` pasa sin errores |
| Aceptación | El PR de la historia está abierto y la app arranca | Todos los CA de la historia pasan |
| Usabilidad | La pantalla de la historia está terminada | La usuaria completa la tarea sin ayuda |
| Instalación | El paquete se armó con `empaquetar.bat` | El sistema abre sin internet en una máquina limpia |

## 5. ¿Cuándo una historia pasa a «Done»?

Para aprobar el PR de una historia y moverla a **Done** se debe cumplir todo esto:

1. `npm test` pasa sin errores.
2. Cada criterio de aceptación de la historia fue probado y **pasa**, con la laptop **sin internet**.
3. No hay issues con etiqueta `bug` abiertos para esa historia.
4. El PR tiene la aprobación de otro integrante y el `CHANGELOG.md` está actualizado.

Si un caso falla, la historia se queda en **In Progress** hasta que se corrija.

## 6. Casos de prueba

### Plantilla de caso de prueba

| Campo | Contenido |
|---|---|
| ID | CP-«historia»-«n» (por ejemplo, CP-HU01-3) |
| Historia y CA | Por ejemplo, HU-01 CA3 |
| Precondición | Qué debe existir antes de probar |
| Pasos | Lo que se hace, en orden |
| Resultado esperado | Lo que dice el criterio de aceptación |
| Resultado obtenido | Lo que pasó realmente |
| Estado | Pasa / Falla |
| Fecha y evidencia | Fecha y captura de pantalla |

### Casos numéricos ya definidos

**CP-HU01-3 — Total de la venta (HU-01 CA3)**

- Precondición: existe un producto a S/ 0.50 y otro a S/ 1.20, ambos con stock.
- Pasos: agregar 10 unidades del primero y 4 del segundo.
- Resultado esperado: el total es **S/ 9.80** (10 × 0.50 = 5.00; 4 × 1.20 = 4.80; 5.00 + 4.80 = 9.80).

**CP-HU02-1 — Descuento por lote más próximo a vencer (HU-02 CA1)**

- Precondición: un producto con el lote A (vence 03/2027, 4 u.) y el lote B (vence 11/2027, 100 u.).
- Pasos: vender 6 unidades del producto.
- Resultado esperado: se descuentan **4 unidades del lote A y 2 del lote B**. El lote A queda en 0 y el B en 98.

### Casos de HT-01 (Sprint 1)

| ID | CA | Pasos | Resultado esperado |
|---|---|---|---|
| CP-HT01-1 | CA1 | Sin internet, abrir `iniciar.bat` | Se ve el menú con Registrar venta, Consultar stock, Ingreso de lotes, Productos y Reportes |
| CP-HT01-2 | CA2 | Ejecutar `prueba-persistencia.js guardar`, reiniciar la laptop y ejecutar `leer` | Sale «CORRECTO: el dato sigue disponible tras el reinicio.» |
| CP-HT01-3 | CA3 | Entrar a las 5 opciones del menú con F12 → Red abierto | Cada pantalla aparece en menos de 2 s y no hay peticiones fuera de `localhost` |

Los casos del resto de historias se detallan con la plantilla en el sprint en que se desarrollan.

## 7. Trazabilidad

Cada historia Must y Should del PMV tiene al menos un caso de prueba por criterio de aceptación. Los criterios están en [`07-historias-de-usuario.md`](../requisitos/07-historias-de-usuario.md).

| Requisito | Historia | Prioridad | Sprint | Casos de prueba |
|---|---|---|---|---|
| RNF-01, RNF-07, RNF-08 | HT-01 Estructura base e instalación | Must | 1 | CP-HT01-1 a CP-HT01-3 |
| RF-05 | HU-04 Registrar ingreso de lote | Must | 2 | CP-HU04-1 a CP-HU04-3 |
| RF-06 | HU-05 Validar duplicidad de lote | Must | 2 | CP-HU05-1, CP-HU05-2 |
| RF-10 | HU-08 Consultar stock | Must | 2 | CP-HU08-1 a CP-HU08-3 |
| RF-01, RF-02 | HU-01 Registrar venta | Must | 3 | CP-HU01-1 a CP-HU01-4 |
| RF-03 | HU-02 Descuento por lote más próximo a vencer | Must | 3 | CP-HU02-1, CP-HU02-2 |
| RF-07, RF-08 | HU-06 Registrar y editar productos | Must | 4 | CP-HU06-1 a CP-HU06-3 |
| RF-04 | HU-03 Reporte diario de ventas | Must | 4 | CP-HU03-1 a CP-HU03-3 |
| RF-11 | HU-09 Reportes gerenciales | Should | 4 | CP-HU09-1 a CP-HU09-3 |
| RF-09 | HU-07 Clasificar productos | Should | Condicional | CP-HU07-1 a CP-HU07-3 |
| RNF-04 | Todas las pantallas | — | 4 | Prueba de usabilidad con la propietaria |

El número de cada caso coincide con el número del criterio. Por ejemplo, CP-HU05-2 prueba HU-05 CA2.

## 8. Reporte de defectos

Cada error encontrado se registra como un issue de GitHub con la etiqueta **`bug`**, con este formato:

```markdown
**Título:** [BUG] Descripción corta del error

**Historia / caso:** HU-01 / CP-HU01-3

**Pasos para reproducir:**
1. ...
2. ...

**Resultado esperado:** ...

**Resultado obtenido:** ...

**Severidad:** Alta (impide usar el sistema) / Media / Baja (detalle visual)

**Evidencia:** captura de pantalla
```

El error se corrige en una rama `fix/<n-issue>-...` y QA vuelve a ejecutar el caso que falló antes de cerrarlo.
