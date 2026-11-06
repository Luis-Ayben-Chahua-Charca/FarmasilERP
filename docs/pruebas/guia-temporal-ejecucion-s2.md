# Guía temporal: completar las pruebas del Sprint 2 (issue #13)

> **Archivo temporal.** Sirve solo de apoyo y directriz para quien complete las pruebas en la laptop. **Se borra del repositorio** (con su propio commit) cuando todo lo de la sección 7 esté hecho. No forma parte de la documentación definitiva.

## 1. Situación

Las pruebas de aceptación de HU-04, HU-05 y HU-08 (issue #13, TQ-S2) ya se ejecutaron una vez con un agente de QA en el equipo de desarrollo, **con internet conectado**. Los 8 casos dieron **Pasa** y no se encontró ningún defecto. Lo que no se pudo verificar, y falta aquí, es:

- Repetir los 8 casos **sin internet**, con el Node portátil, en la laptop.
- Revisar F12 (Consola y Red) durante las pruebas.
- Medir el tiempo de la búsqueda `Paracetamol` en pantalla.
- Tomar las capturas de evidencia.
- Ajustar los datos de la prueba y redactar la Conclusión.

Los casos están en [`casos-sprint-2.md`](casos-sprint-2.md) y los resultados se registran en [`resultados-sprint-2.md`](resultados-sprint-2.md). Léelos primero. La plantilla y las reglas de severidad están en [`plan-de-pruebas.md`](plan-de-pruebas.md).

## 2. Reglas para el agente que continúe

El `AGENTS.md` del proyecto es local (no se sube al repositorio), así que quizá no esté en esta laptop. Estas son las reglas que importan:

- **Nunca escribas «Pasa» sin haber ejecutado el caso.** Si algo no se pudo comprobar, anótalo como **No verificado** con el motivo.
- **No inventes evidencias.** Las capturas las toma y las revisa la persona que prueba; tú solo anotas el nombre del archivo cuando exista.
- **Modifica solo** `docs/pruebas/resultados-sprint-2.md`, `docs/pruebas/casos-sprint-2.md` (solo si una diferencia con la pantalla es aceptable y se documenta) y las capturas de `docs/pruebas/evidencias-s2/`. No toques `docs/requisitos/`, `app/`, `test/` ni `scripts/`.
- **Offline:** durante las pruebas la laptop va sin internet (modo avión o Wi-Fi apagado). Nada de CDN ni servicios externos.
- **Datos:** no versiones bases de datos, respaldos, `.env` ni secretos. `datos/` está ignorado por Git; compruébalo con `git status` antes de añadir nada.
- **Git:** `git add` solo con rutas explícitas (nada de `git add .`, `-A`, `-u`, directorios ni comodines). Después de cada `git add`, muestra `git status --short`. No hagas commit, push ni cambies la configuración de Git sin que el usuario lo autorice. Propón el mensaje en `.git/PROPUESTA_COMMIT.txt`: Conventional Commits en español, con `Refs #13` en el pie. **Nunca** `Closes`, `Fixes` ni `Resolves` en un commit, y sin `Co-Authored-By` ni firmas.
- **Rama:** `docs/13-resultados-sprint-2`. No trabajes en `main`.

## 3. Preparación

1. `git fetch` y `git switch docs/13-resultados-sprint-2`, luego `git pull`.
2. Comprueba que el commit probado sigue siendo el que figura en «Datos de la prueba» (`aff993b` de `main`). Si `main` avanzó con cambios de `app/`, anota el commit que pruebas de verdad.
3. Usa el **Node portátil** del proyecto y anota su versión (`node --version`).
4. Instala las dependencias solo si hace falta, y siempre antes de apagar internet.
5. Esta laptop debe tener solo datos de prueba. `datos/farmasil.db` se crea al iniciar el servidor (`npm start`, puerto 3000). Si la laptop ya tiene datos reales de la farmacia, **no los borres**: pregunta antes cómo apartar esa base.

## 4. Bases de datos de cada historia

- **HU-04 y HU-05:** base limpia con solo los productos Paracetamol 500 mg (S/ 0.50, Analgésico, Genérico) y Amoxicilina 500 mg (S/ 1.20, Antibiótico, Genérico), **sin lotes**. Se pueden dar de alta desde *Ingreso de lotes* con «+ Nuevo producto». Entre HU-04 y HU-05 vuelve a una base limpia, como indican las condiciones de [`casos-sprint-2.md`](casos-sprint-2.md).
- **HU-08:** `npm run datos-prueba-stock`. Crea `datos/prueba-stock.db` (300 productos, 904 lotes) y mide la API. Para ver la base en pantalla hay que iniciar un servidor que la use; el script de `scripts/datos-prueba-stock.js` muestra cómo se levanta la app con esa base. Al terminar borra solo `datos/prueba-stock.db`, nunca `datos/farmasil.db`.

## 5. Ejecución

Haz esto con **internet apagado** y F12 abierto en las pestañas **Consola** y **Red** desde antes del primer paso.

1. Ejecuta los 8 casos en este orden: CP-HU04-1, 2, 3; CP-HU05-1, 2; CP-HU08-1, 2, 3. Sigue los pasos y compara con el resultado esperado de [`casos-sprint-2.md`](casos-sprint-2.md).
2. Anota el stock inicial antes de cada caso que lo modifique, y lee el stock final **en la pantalla *Consultar stock*** (la prueba anterior lo leyó con la API).
3. Durante todas las pruebas, F12 debe mostrar **cero errores** en la Consola y **ninguna petición fuera de `localhost`** en Red. La única línea roja esperada es el `409 (Conflict)` de CP-HU05-1 (lo escribe el navegador al rechazar el lote duplicado).
4. **Tiempo (CP-HU08-1):** en F12 → Red busca `Paracetamol`, anota la duración de la petición `GET /api/stock` y el tiempo hasta que cambia la lista. Debe ser menor de 2 segundos.
5. **Capturas** en `docs/pruebas/evidencias-s2/` (crea la carpeta): por lo menos una por caso, con nombre `CP-HU04-1.png`, `CP-HU05-1.png`, etc., más una de F12 → Red con la búsqueda del tiempo. Si una captura muestra datos de la farmacia real, no la subas.
6. Si algo falla, no lo corrijas en `app/`: abre un issue `bug` con el formato de la sección 8 del plan de pruebas y lístalo en «Defectos encontrados».

## 6. Qué actualizar en `resultados-sprint-2.md`

- **Datos de la prueba:** fecha real, «Probado por» (nombre de quien probó), Node portátil y su versión, navegador y su versión, y «Internet: sin conexión».
- **Resultados por caso:** reemplaza «Pendiente de confirmar por Luis» de la columna Evidencia con el nombre del archivo de captura. Si el resultado difiere del anotado, corrige el resultado obtenido y el estado.
- **Tiempo de respuesta:** completa la fila «`Paracetamol` en pantalla (F12 → Red)» con el tiempo medido y su captura.
- **Defectos encontrados:** déjalo en «Sin defectos» si no hubo; si los hubo, issue, caso, severidad y estado.
- **Revisión de los PR:** el PR #67 sigue en «Pendiente». Actualiza su fila cuando esté revisado y fusionado.
- **Conclusión:** reemplaza «Pendiente» con un párrafo corto: qué se probó, cuántos casos pasan, defectos abiertos y si el sprint cumple los criterios de HU-04, HU-05 y HU-08. Aclara que la Review del 4/11 ya pasó y que no se registraron defectos antes de ella (si es cierto).

## 7. Cierre (cuando todo esté hecho)

1. Todos los casos tienen resultado ejecutado sin internet, con evidencia, y no queda ningún «Pendiente de confirmar» ni «No verificado» sin motivo.
2. Haz un commit con los resultados y las capturas (`docs(pruebas): completa resultados del sprint 2 sin internet`, `Refs #13`).
3. **Borra este archivo** en su propio commit: `git rm docs/pruebas/guia-temporal-ejecucion-s2.md` y `docs(pruebas): elimina la guía temporal de ejecución del sprint 2`, `Refs #13`.
4. Abre el PR hacia `main`. Que lo apruebe una integrante distinta de quien probó. El cierre del issue (`Closes #13`) va **solo en el cuerpo del PR**, no en un commit.
5. Revisa si el README debe enlazar los resultados (el issue lo pide «si corresponde»).
6. Borra solo las bases de prueba que hayas creado (`datos/prueba-stock.db`) y cierra los servidores que hayas iniciado.
