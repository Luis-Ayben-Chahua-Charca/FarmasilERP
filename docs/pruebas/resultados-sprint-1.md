# Resultados de las pruebas de aceptación — Sprint 1

Pruebas de aceptación de **HT-01 Estructura base e instalación** (issue #8), siguiendo los casos CP-HT01-1 a CP-HT01-3 del [plan de pruebas](plan-de-pruebas.md). Las capturas están en [`evidencias-s1/`](evidencias-s1/).

## Datos de la prueba

| Campo | Valor |
|---|---|
| Fecha | 22/10/2026, de 22:16 a 23:23 |
| Probado por | Oscar Chilo (QA) |
| Versión probada | `main` en el commit `fef8dd9` (HT-01 cerrada) |
| Equipo | Laptop Lenovo (modelo 81AX), equipo de desarrollo del QA |
| Sistema operativo | Windows 10 Pro (versión 10.0.19045) |
| Node.js portátil | v24.15.0 (incluido en el paquete) |
| Navegador | Google Chrome |
| Internet | Desconectado (modo avión) durante todas las pruebas |

## Instalación

Se armó el paquete con `empaquetar.bat`, se copió `dist\Farmasil` a `C:\Farmasil` y se abrió `iniciar.bat` sin internet, siguiendo [`docs/instalacion.md`](../instalacion.md).

| Paso | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|
| Quitar internet | El equipo queda sin conexión | Modo avión activado (ícono en la barra de tareas) | Pasa | [01](evidencias-s1/01-sin-internet.JPG) |
| Abrir `iniciar.bat` sin internet | Se abre la ventana negra y luego el navegador con el sistema | La ventana muestra «Farmasil disponible en http://localhost:3000» y se abre el navegador | Pasa | [02](evidencias-s1/02-iniciar.JPG) |
| Revisar la carpeta `C:\Farmasil\datos` | Existe el archivo `farmasil.db` | Existe `farmasil.db` (32 kB), creado a las 22:18 al iniciar el sistema | Pasa | [10](evidencias-s1/10-base-datos.JPG) |

Observaciones de la instalación: las instrucciones de `docs/instalacion.md` se siguieron sin problemas. Para copiar la carpeta a `C:\` Windows pide permiso de administrador; conviene mencionarlo en las instrucciones.

## Resultados por criterio de aceptación

| Caso | Criterio | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|
| CP-HT01-1 | CA1 — Menú sin internet | Se ve el menú con Registrar venta, Consultar stock, Ingreso de lotes, Productos y Reportes | Se muestra el menú lateral con las 5 opciones en español | **Pasa** | [03](evidencias-s1/03-ca1-menu.JPG) |
| CP-HT01-2 | CA2 — Dato tras reinicio | `prueba-persistencia.js leer` muestra «CORRECTO: el dato sigue disponible tras el reinicio.» | Se guardó el dato a las 23:05, la laptop se reinició (encendió a las 23:08) y a las 23:23 `leer` mostró «CORRECTO» | **Pasa** | [11](evidencias-s1/11-ca2-guardar.JPG), [12](evidencias-s1/12-ca2-leer.JPG) |
| CP-HT01-3 | CA3 — Pantallas en menos de 2 s | Cada pantalla aparece en menos de 2 s y todas las peticiones van a `localhost` | La página carga en 89 ms con 8 peticiones, todas a `localhost`; el cambio entre opciones es inmediato | **Pasa** | [04](evidencias-s1/04-ca3-red.JPG) a [09](evidencias-s1/09-ca3-reportes.JPG) |

### Tiempos medidos (CA3)

Al recargar con F5 y la pestaña Red abierta: **8 peticiones**, todas a `localhost` (página, `estilos.css`, `app.js` y los 5 archivos de pantalla). **Finish: 74 ms, DOMContentLoaded: 89 ms, Load: 89 ms.**

Al cambiar de opción en el menú la página no se recarga (solo cambia la dirección, por ejemplo `#/consultar-stock`), por eso la pestaña Red no muestra un tiempo por pantalla. El cambio se ve al instante.

| Pantalla | Tiempo | ¿Menos de 2 s? | Evidencia |
|---|---|---|---|
| Registrar venta (carga inicial) | 89 ms | Sí | [04](evidencias-s1/04-ca3-red.JPG), [05](evidencias-s1/05-ca3-venta.JPG) |
| Consultar stock | Inmediato | Sí | [06](evidencias-s1/06-ca3-stock.JPG) |
| Ingreso de lotes | Inmediato | Sí | [07](evidencias-s1/07-ca3-lotes.JPG) |
| Productos | Inmediato | Sí | [08](evidencias-s1/08-ca3-productos.JPG) |
| Reportes | Inmediato | Sí | [09](evidencias-s1/09-ca3-reportes.JPG) |

## Defectos encontrados

No se encontraron defectos. No se abrió ningún issue `bug`.

## Conclusión

**HT-01 cumple CA1, CA2 y CA3.** El sistema abre sin internet, muestra el menú de 5 opciones, guarda los datos después de reiniciar la laptop y las pantallas cargan en mucho menos de 2 segundos.

**Pendiente:** la prueba se hizo en la laptop del QA, que también tiene Node.js instalado, no en una máquina limpia. El sistema usó el Node portátil del paquete (`C:\Farmasil\node`), pero falta repetir la instalación en la laptop de la farmacia o en otro equipo sin Node.

## Nota de traspaso para el QA del Sprint 2

- Las pantallas W1 a W5 todavía están vacías («Esta pantalla estará disponible pronto»). En el Sprint 2 se prueban HU-04, HU-05 y HU-08 con los casos CP-HU04, CP-HU05 y CP-HU08 del plan de pruebas.
- Hay que repetir la instalación en una máquina limpia (sin Node), idealmente en la laptop de la farmacia.
- Para medir tiempos, la carga inicial se ve en F12 → Red (Load); al cambiar de opción no hay recarga, así que se revisa a simple vista o con la pestaña Performance.
- Para la prueba de reinicio usar `scripts\prueba-persistencia.js` (`guardar`, reiniciar, `leer` y `limpiar`), que no toca la base real.
