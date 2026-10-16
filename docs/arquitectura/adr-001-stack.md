# ADR-001 — Stack tecnológico

| Campo | Valor |
|---|---|
| Estado | **Propuesto** — pasa a *Aceptado* cuando el PR es aprobado por el equipo |
| Fecha | 2026-10-15 |
| Issue | HT-01.1 |
| Requisitos | RNF-01, RNF-02, RNF-03, RNF-04, RNF-07, RNF-08 |

## Contexto

La aplicación corre en la única laptop de la farmacia (Windows), **sin internet**. La comparten hasta dos usuarias por turnos. Debe construirse con tecnologías web (RNF-08), conservar los datos aunque se reinicie el equipo y permitir copiar los datos a una memoria USB con un procedimiento manual (RNF-03). El equipo tiene 4 integrantes con 6 h/semana cada uno y la entrega del PMV es el 3 de diciembre de 2026, así que importan más la simplicidad y la velocidad que la escalabilidad (RNF-07).

## Opciones evaluadas

| Criterio | (a) Servidor local Node + SQLite | (b) Electron/Tauri + SQLite | (c) PWA + IndexedDB |
|---|---|---|---|
| Sin internet (RNF-01) | Sí | Sí | Sí, si el service worker ya está instalado |
| Datos tras reinicio (RNF-08) | Archivo `.db` en disco | Archivo `.db` en disco | Dependen del perfil del navegador; se pierden si se limpian los datos del sitio |
| Copia a USB (RNF-03) | Copiar un archivo | Copiar un archivo | Exportar e importar JSON a mano |
| Instalación en la laptop | Carpeta con Node portátil y `iniciar.bat` | Instalador pesado; módulos nativos difíciles de compilar | Sencilla, pero requiere servirla una vez |
| Curva de aprendizaje | Baja (JS en cliente y servidor) | Media-alta (proceso principal y de render) | Media (service workers, IndexedDB) |
| Pruebas automatizadas | Sencillas (`node:test` + Supertest) | Más complejas | Requieren navegador |

## Decisión

Se adopta la opción **(a)**:

- **Ejecución:** Node.js 24 LTS. Se distribuye la versión portátil `.zip` para Windows x64 dentro de la carpeta de la aplicación, así que no hay que instalar nada en la laptop.
- **Servidor:** Express, escuchando **solo en `127.0.0.1`** (nunca en la red).
- **Base de datos:** SQLite mediante `better-sqlite3`, en un único archivo `datos/farmasil.db` que **no se versiona**.
- **Interfaz:** HTML, CSS y JavaScript **sin framework ni bundler**, servidos como archivos estáticos por Express. Nada de CDN ni fuentes remotas; cualquier recurso se copia al repositorio.
- **Pruebas:** `node:test` (incluido en Node) con Supertest para la API y la lógica de stock y totales.
- **Arranque:** `iniciar.bat` inicia el servidor y abre `http://localhost:3000` en el navegador predeterminado. Un acceso directo en el escritorio lleva a ese `.bat`.
- **Copia de datos (RNF-03):** procedimiento manual documentado: cerrar la aplicación y copiar `datos/farmasil.db` a la USB; para restaurar, copiarlo de vuelta con la aplicación cerrada. No hay función de respaldo dentro del sistema en el PMV.

## Consecuencias

- Hay un solo lenguaje (JavaScript) en cliente, servidor y pruebas, lo que facilita la rotación de roles entre sprints.
- `better-sqlite3` es un módulo nativo: **el paquete final para la laptop se arma en Windows x64** con la misma versión de Node que se distribuye. Así se descarga el binario precompilado correcto (`npm ci` con internet, una sola vez) y luego todo se copia sin conexión.
- Sin framework, la interfaz necesita orden desde el inicio: un archivo JS por pantalla (W1–W5) y un módulo común para las llamadas a la API.
- Como no hay inicio de sesión (HU-16, Won't), el servidor no debe aceptar conexiones externas; por eso se fija a `127.0.0.1`.
- Si más adelante se quiere un ejecutable único, se puede envolver en Electron sin reescribir la interfaz ni la lógica.

## Estructura inicial propuesta

```
FarmasilERP/
├── app/
│   ├── server.js            # arranque de Express
│   ├── db/                  # conexión, migraciones, esquema
│   ├── modulos/             # inventario/ (incluye catálogo), ventas/, reportes/
│   └── public/              # index.html, css/, js/ (una vista por pantalla)
├── test/
├── datos/                   # farmasil.db (ignorado por git)
├── iniciar.bat
└── package.json
```
