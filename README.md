# FarmasilERP — Sistema de Control de Ventas e Inventario

Sistema para la farmacia **Farmasil** que registra las ventas y lleva el inventario por producto y por lote, para conocer en todo momento el stock disponible y lo vendido, sin depender de cuadernos ni conteos manuales.

> Proyecto del curso **Gestión de Proyectos de Software** — Universidad Nacional de San Agustín de Arequipa, semestre 2026-B.

## Estado

🚧 En desarrollo — Sprint 1, acortado a una semana (15 – 21 de octubre de 2026). Entrega del **PMV: jueves 3 de diciembre de 2026**.

## Qué hace (alcance)

- **Inventario:** catálogo de productos (registro, edición del precio unitario y clasificación en genéricos y comerciales), ingreso de lotes (número, vencimiento, cantidad en unidades), validación de duplicados y consulta de stock por producto y lote.
- **Ventas:** registro de ventas con descuento automático de stock, empezando por el lote que vence primero.
- **Reportes:** reporte diario de ventas y reportes de ingresos y productos más vendidos por periodo.

Todo precio y stock se maneja **por unidad** (una caja de 30 se cobra como 30 unidades). La copia de los datos a una USB se hace con un procedimiento manual.

Fuera de alcance: proveedores, alertas, devoluciones, comprobantes, clientes, inicio de sesión y respaldo desde el sistema. Detalle en [`docs/requisitos/02-alcance.md`](docs/requisitos/02-alcance.md).

## Restricciones clave

| Restricción | Implicancia |
|---|---|
| Sin internet en la farmacia | Todo funciona offline: nada de CDN, APIs externas ni servicios en la nube. |
| Un único equipo (laptop) | La app corre localmente; hasta dos personas la usan por turnos. |
| Tecnologías web | Interfaz en HTML, CSS y JavaScript, ejecutada en el navegador de la laptop. |
| Usuarias sin experiencia en sistemas | Interfaz simple, en español, sin necesidad de capacitación. |

Stack propuesto en [`docs/arquitectura/adr-001-stack.md`](docs/arquitectura/adr-001-stack.md): Node.js 24 LTS + Express (solo `127.0.0.1`) + SQLite + HTML/CSS/JS sin framework. Queda vigente cuando el equipo aprueba el ADR (HT-01.1).

## Instalación y uso

**En la laptop de la farmacia (sin internet):** copiar la carpeta completa del sistema a `C:\Farmasil` y abrir `iniciar.bat`. Se abre una ventana negra (no cerrarla) y el navegador con el sistema; para salir, cerrar la ventana. Detalle, armado del paquete, copia de datos y pruebas en [`docs/instalacion.md`](docs/instalacion.md).

**Para desarrollar** (Node.js 24 o superior; internet solo para instalar):

```
npm ci
npm start
```

Abrir `http://localhost:3000`. Pruebas: `npm test`.

## Estructura del repositorio

```
FarmasilERP/
├── app/                   # Servidor Express, base de datos e interfaz
├── scripts/               # Utilidades (prueba de persistencia)
├── test/                  # Pruebas automáticas
├── docs/
│   ├── requisitos/        # Requisitos elicitados, alcance, casos de uso, historias
│   ├── planificacion/     # Plan de sprints, DoR, DoD, versiones
│   ├── diseno/            # Bocetos de pantallas (W1–W5)
│   └── instalacion.md     # Instalación en la laptop y copia de datos
├── iniciar.bat            # Arranque en la laptop de la farmacia
├── empaquetar.bat         # Arma la carpeta que se copia a la laptop
├── CHANGELOG.md           # Registro de cambios
├── CONTRIBUTING.md        # Flujo de trabajo, ramas, commits y PR
└── README.md
```

## Documentación

- [Requisitos](docs/requisitos/README.md)
- [Plan de sprints](docs/planificacion/plan-de-sprints.md)
- [Bocetos de pantallas](docs/diseno/)
- [Plan de pruebas](docs/pruebas/plan-de-pruebas.md)
- [Cómo contribuir](CONTRIBUTING.md)
- [Registro de cambios](CHANGELOG.md)

## Equipo Sprint 1

| Integrante | Rol |
|---|---|
| [Chahua Charca, Luis Ayben] | Scrum Master |
| [Chilo Huillca, Oscar Raul] | QA |
| [Jaita Chura, Jose Manuel] | Desarrollador back-end |
| [Yare Chulunquia, Kevin Pedro] | Diseñador front-end |

> Los roles rotan en cada sprint; esta tabla se actualiza al inicio de cada uno.
