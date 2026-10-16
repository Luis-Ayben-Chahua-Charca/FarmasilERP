# 05 — Requisitos no funcionales

| ID | Tipo | Requisito | Prioridad |
|---|---|---|---|
| RNF-01 | Disponibilidad | Operación sin internet | Máxima |
| RNF-02 | Operacional | Uso compartido en un único equipo | Alta |
| RNF-03 | Confiabilidad | Recuperación de datos ante fallas | Media |
| RNF-04 | Usabilidad | Uso sin capacitación previa | Alta |
| RNF-05 | — | **Retirado** (15/10/2026): no hay productos con precio regulado | — |
| RNF-06 | Restricción de alcance | Cobros y comprobantes en el POS | Baja |
| RNF-07 | Rendimiento | Respuesta sin demoras perceptibles | Baja |
| RNF-08 | Restricción de diseño | Aplicación local con tecnologías web | Alta |

---

### RNF-01 — Operación sin internet
- **Descripción:** todas las funciones del sistema deben operar sin conexión a internet.
- **Justificación:** la farmacia no tiene internet fijo; los datos móviles son intermitentes.
- **Criterio de aceptación:** con la laptop desconectada, todas las funciones se ejecutan correctamente y los datos se conservan.
- **Implicancia técnica:** no usar CDN, fuentes web remotas, APIs externas ni servicios en la nube. Todas las dependencias se empaquetan localmente.

### RNF-02 — Uso compartido en un único equipo
- **Descripción:** el sistema opera en un único equipo (laptop) y permite que hasta 2 usuarias lo usen de forma alterna durante la jornada, sin pérdida de las operaciones de cada una.
- **Justificación:** la farmacia tiene una sola laptop y hasta dos personas atienden en el local.
- **Criterio de aceptación:** lo que registra una usuaria sigue disponible y correcto cuando la otra usa el equipo a continuación.
- **Nota:** no se requiere sincronización entre dispositivos.

### RNF-03 — Recuperación de datos
- **Descripción:** ante una falla grave, los datos deben poder recuperarse sin pérdida irreversible en un plazo máximo de 15 días.
- **Justificación:** es el tiempo máximo que la farmacia puede operar sin sus datos (un ciclo de reposición de lotes).
- **Criterio de aceptación:** existe un **procedimiento manual documentado** para copiar el archivo de datos a una memoria USB y restaurarlo, y se prueba antes de la entrega (TQ-S4).
- **Nota:** la función de respaldo dentro del sistema (antes HU-10) se retiró del PMV al reducir el alcance a ventas, inventario y reportes. Como los datos son un único archivo (ADR-001), la copia manual cubre el requisito sin desarrollo adicional.

### RNF-04 — Usabilidad sin capacitación
- **Descripción:** una usuaria sin experiencia previa debe poder registrar una venta, registrar un ingreso de lote y consultar stock sin manual ni capacitación.
- **Justificación:** las usuarias no tienen experiencia en sistemas de información.
- **Criterio de aceptación:** prueba de usabilidad guiada con la propietaria y una técnica.
- **Implicancia técnica:** interfaz en español, textos claros, pocos pasos, mensajes de error que indiquen qué corregir.

### RNF-05 — Precios regulados (retirado)
- **Estado:** retirado el 15/10/2026. Se originó en la respuesta de la entrevista «Los precios son regulados por la DIGEMID» (Sec. 1). El equipo aclaró que no hay productos con precio regulado: la farmacia define sus precios. Se retira también HU-11. El ID no se reutiliza.

### RNF-06 — Cobros y comprobantes en el POS
- **Descripción:** el sistema no realiza cobros digitales ni emite comprobantes; esas funciones siguen en el POS existente.
- **Justificación:** el POS ya las resuelve y el alcance se limita a ventas e inventario.

### RNF-07 — Rendimiento
- **Descripción:** responder sin demoras perceptibles bajo la carga real (horario de 9:00 a 21:00, un único equipo).
- **Criterio de aceptación:** cada pantalla se muestra en menos de 2 segundos.

### RNF-08 — Aplicación local con tecnologías web
- **Descripción:** el sistema se implementa como una aplicación de operación local, construida con tecnologías web (HTML, CSS y JavaScript), instalable en la laptop de la farmacia y con almacenamiento local de los datos.
- **Justificación:** permite usar el único equipo disponible sin depender de internet (RNF-01).
- **Criterio de aceptación:** el sistema se instala en la laptop, se ejecuta en su navegador sin conexión y conserva los datos tras reiniciar el equipo.
