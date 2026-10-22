# Instalación en la laptop de la farmacia

La laptop no tiene internet. Por eso el equipo arma una **carpeta autocontenida** en un equipo Windows x64 con internet y la copia a la laptop con una memoria USB. En la laptop no se instala nada: se copia la carpeta y se abre `iniciar.bat`.

## 1. Armar el paquete (equipo de desarrollo, con internet)

Se hace en Windows x64, con la misma versión de Node que se distribuye (ver [ADR-001](arquitectura/adr-001-stack.md)).

1. Clonar el repositorio en `main` actualizado.
2. Descargar la versión portátil de **Node.js 24 LTS para Windows x64** (`.zip` desde nodejs.org), descomprimirla y dejar su contenido en una carpeta `node` dentro del proyecto, de modo que exista `node\node.exe`. Esa carpeta no se versiona.
3. Verificar que `node --version` del equipo sea **igual** a `node\node.exe --version`. `better-sqlite3` descarga el binario de la versión que ejecuta `npm`, y debe ser la misma que correrá en la laptop.
4. Ejecutar:

   ```
   empaquetar.bat
   ```

   Crea `dist\Farmasil` con `app`, `scripts`, `node`, `node_modules` (solo dependencias de producción), `iniciar.bat` y `package.json`.
5. Probar el paquete antes de copiarlo: abrir `dist\Farmasil\iniciar.bat` y comprobar que aparece el menú.
6. Copiar la carpeta `dist\Farmasil` a la USB.

## 2. Instalar en la laptop (sin internet)

1. Copiar la carpeta `Farmasil` de la USB a `C:\Farmasil`.
2. Clic derecho sobre `C:\Farmasil\iniciar.bat` → *Enviar a* → *Escritorio (crear acceso directo)*.
3. Abrir el acceso directo. Se abre una ventana negra (**no cerrarla**) y, en pocos segundos, el navegador con el sistema.

Para salir, cerrar la ventana negra. Los datos se guardan en `C:\Farmasil\datos\farmasil.db` y siguen ahí al apagar o reiniciar la laptop.

## 3. Copia de los datos a una USB (RNF-03)

1. Cerrar la aplicación (cerrar la ventana negra).
2. Copiar el archivo `C:\Farmasil\datos\farmasil.db` a la USB.

Para restaurar, copiarlo de vuelta a `C:\Farmasil\datos\` con la aplicación cerrada.

## 4. Prueba en una máquina limpia sin internet

Se hace en un equipo sin Node instalado y sin conexión.

| # | Prueba | Resultado esperado |
|---|---|---|
| 1 | Desconectar internet y abrir `iniciar.bat` | Se abre el navegador con el menú de 5 opciones |
| 2 | Navegar entre las 5 opciones | Cada pantalla aparece en menos de 2 s |
| 3 | Con F12 → pestaña Red abierta, recargar | Todas las peticiones son a `localhost` |
| 4 | Comprobar que existe `datos\farmasil.db` | El archivo existe |

## 5. Prueba de reinicio (HT-01 CA2)

Desde una terminal en `C:\Farmasil`, con la ventana negra cerrada:

1. Guardar un dato de prueba (usa `datos\prueba.db`, no la base real):

   ```
   node\node.exe scripts\prueba-persistencia.js guardar
   ```

2. **Reiniciar la laptop.**
3. Comprobar el dato:

   ```
   node\node.exe scripts\prueba-persistencia.js leer
   ```

   Debe decir `CORRECTO: el dato sigue disponible tras el reinicio.`
4. Borrar la base de prueba:

   ```
   node\node.exe scripts\prueba-persistencia.js limpiar
   ```

## Problemas frecuentes

| Mensaje | Qué hacer |
|---|---|
| «No se encontro Node.js» | Falta `node\node.exe` junto a `iniciar.bat`; volver a copiar la carpeta completa |
| «Faltan archivos de la aplicacion» | Falta `node_modules`; volver a copiar la carpeta completa |
| El navegador no conecta | Esperar unos segundos; si sigue, comprobar que la ventana negra siga abierta |
| «Address already in use» | Ya hay otra ventana de Farmasil abierta; cerrarla y abrir de nuevo |
