<!--
TÍTULO del PR: Conventional Commits, no el nombre de la rama.
  Bien: feat(inventario): agrega API de ingreso de lote
  Mal:  Feat/36 api ingreso lote
El título será el mensaje del commit en main (Squash and merge).
-->

## Resumen
<!-- Qué cambia y por qué, en 1 a 3 líneas. -->

## Cambios
<!-- Un punto por archivo o cambio relevante. -->
-

## Cómo probar
<!-- Pasos que el revisor sigue tal cual, desde main actualizado. -->
1. `npm ci`
2. `npm test`
3.

## Criterios de aceptación verificados
<!--
Copiar TODOS los criterios de aceptación del issue (CA1, CA2, …), uno por línea,
y marcar los que se probaron. Si alguno no se prueba en este PR, dejarlo sin
marcar y explicar por qué en «Notas».
-->
- [ ] CA1:
- [ ] CA2:

## Evidencia
<!-- Obligatoria en todo PR. Marcar lo que aplica y adjuntar el resultado. -->

**Si el PR cambia una pantalla (vista)** (la prueba quien revisa antes de aprobar):
- [ ] F12 → Consola: sin errores.
- [ ] F12 → Red: sin peticiones fuera de `localhost`.
- [ ] La pantalla se muestra en menos de 2 segundos.

**Si el PR no cambia pantallas (API, base de datos, scripts, documentos):**
- [ ] Resultado adjunto: salida de `npm test`, respuesta de la API (por ejemplo con `curl`), resultado del script o, en un documento, qué se revisó y contra qué.
- [ ] Sin errores en la terminal al arrancar con `npm start`.

## Definition of Done
- [ ] La rama está al día con `main` y `npm test` pasa.
- [ ] Probado sin internet.
- [ ] `CHANGELOG.md` actualizado en `[Unreleased]` con el número del issue.
- [ ] No cambia nada fuera del alcance del issue.

## Notas
<!-- Opcional: decisiones, pendientes, dudas para el revisor. Si no hay, borrar. -->

<!--
CIERRE DEL ISSUE (dejar una sola línea):
  Closes #n  → este PR completa el issue.
  Refs #n    → aporta al issue, pero otro PR lo completa.
PR de cierre de historia (#10, #11, #12): listar en «Cambios» las tareas integradas
con su PR, enlazar los resultados de #13 y usar Closes #<historia>.
-->
Closes #
