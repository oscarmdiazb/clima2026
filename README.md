# Encuesta de Clima de Aula · Seguimiento 2026 — Reservas y confirmación de listas

Fork de [`reservas-encuesta-clima-aula-2026-oce`](https://github.com/oscarmdiazb/reservas-encuesta-clima-aula-2026-oce) para la **encuesta de seguimiento de largo plazo** a los 96 colegios de Rondas 1 y 2 (muestra 2025).

**Sitio:** https://oscarmdiazb.github.io/clima2026/ *(al habilitar GitHub Pages)*

## Qué cambia frente al original

| Cambio | Detalle |
|---|---|
| Roster | 96 aulas de R1/R2 en 18 localidades (`schools.js`) |
| Ventana | **15 sep – 30 oct 2026**. Noviembre queda reservado a revisitas y no es reservable |
| Días bloqueados | Receso estudiantil (5–9 oct) y festivo 12 oct, bloqueados en frontend **y** backend (`BLOCKED_DATES`, en ambos archivos — mantener en sincronía) |
| Fecha preasignada | Igual que el original: pestaña `Asignaciones` de la Sheet (`DANE|Jornada|Clase → fecha`). Cargar antes del envío del correo |
| **Confirmación de listas** | **Nueva página `c.html`**: el colegio confirma qué estudiantes de su lista siguen y en qué curso están. Ver abajo |
| Backend | Despliegue **nuevo** de Apps Script sobre una Sheet **nueva** — no reutilizar la de R3 |

## Confirmación de listas (`c.html`) — «¿dónde están hoy los estudiantes?»

Cada colegio recibe un enlace personal. **Basta el código; el DANE ya no se escribe:**
```
https://oscarmdiazb.github.io/clima2026/c.html?c=<CÓDIGO>
```
(`&d=<DANE>` sigue aceptándose y solo hace falta si un código apuntara a dos sedes.)

La página trae del backend la lista de estudiantes de ese colegio y, por cada uno, el colegio
marca **Sigue / Ya no está**. Si sigue, el **curso de 2026**; si ya no está, **qué pasó** y
**a dónde se fue**. El envío reescribe las filas de ese colegio en la pestaña
`ConfirmacionesLista` y deja una fila de auditoría en `ConfirmacionesLog`.

Diseñada para que un coordinador la termine en pocos minutos, desde el celular:

| | |
|---|---|
| **Curso y jornada** | por cada estudiante que sigue: el curso de 2026 (texto libre, con el curso promovido como pista en el placeholder) y un selector de **jornada** ya puesto en la de 2025, que el colegio cambia si hace falta |
| **Guardar avance** | se puede enviar incompleto y seguir después con el mismo enlace |
| **Autoguardado local** | lo marcado queda en `localStorage`; si cierran la página no se pierde |
| **Reanudar** | al volver a entrar carga lo ya enviado al servidor y lo local (gana lo local) |
| **Motivo de salida** | `otro_colegio` · `retiro` · `traslado_ciudad` · `nunca_estuvo` · `no_sabemos`, más el colegio o ciudad destino en texto libre |
| **Buscador y filtros** | Todos / Sin marcar / Siguen / Ya no están |
| **Fecha de la visita** | una línea por aula, con la **reserva real** si existe y la fecha preasignada si no. Sale de las mismas pestañas `Reservas`/`Asignaciones` que usa `index.html`, así que no puede desincronizarse. Siempre enlaza al aplicativo de reservas |
| **Recibo** | resumen imprimible al terminar |
| Celular | tarjetas, no tabla; barra fija con el progreso |

**Los nombres de los estudiantes nunca están en este repo ni en la página**: viven en la
pestaña privada `RosterEstudiantes` y el backend solo los entrega con el código correcto.

### Pestañas que escribe el backend

`ConfirmacionesLista` — **una fila por estudiante, siempre el estado actual** (cada envío del
colegio reemplaza sus filas anteriores):
`Timestamp · DANE · Colegio · RowID · Nombre · ClaseOriginal · JornadaOriginal · Continua · CursoActual · JornadaActual · Motivo · ColegioDestino · Nota · Contacto · Telefono · Estado`

`ConfirmacionesLog` — una fila por envío, nunca se borra:
`Timestamp · DANE · Colegio · Contacto · Telefono · Estado · N_estudiantes · N_siguen · N_salieron`

> La versión anterior tenía 9 columnas y añadía filas. Al pegar el `apps-script.gs` nuevo el
> encabezado se amplía solo; las filas viejas quedan con las columnas nuevas vacías.

**Esta página nunca escribe en `Reservas`.** Solo la lee, para decirle al colegio cuándo es su
visita. El agendamiento se sigue haciendo únicamente desde `index.html`.

### Monitoreo del avance

```
…/exec?tipo=confirmaciones&key=<CONTACTOS_KEY>
```
Una fila por colegio: `en_lista`, `marcados`, `siguen`, `salieron`, `estado`, `ultima`.
Sin nombres de estudiantes. La clave vive en Propiedades del script, nunca en el repo.

Insumos (NO commitear — están en `Encuesta/seguimiento_largo_plazo_r1r2/reservas/`):
- `roster_para_sheet.csv` → pestaña `RosterEstudiantes` (DANE, Codigo, RowID, Nombre, ClaseOriginal, Colegio).
- `codigos_confirmacion.csv` → códigos y enlaces por colegio, para el mail-merge.

## Setup (una vez, ~20 min)

1. Sheet nueva → `Extensions → Apps Script` → pegar `apps-script.gs` → correr `setup`.
2. Importar `roster_para_sheet.csv` como pestaña `RosterEstudiantes` (File → Import → Insert new sheet, renombrar). Forzar columna DANE a texto plano.
3. Crear la pestaña `Asignaciones` (Colegio, Sede, Jornada, Clase, Fecha, Pair_ID, DANE, Brazo) y cargar las fechas preasignadas.
4. Deploy → Web app → Execute as *Me*, acceso *Anyone* → copiar la URL.
5. Pegar la URL en `APPS_SCRIPT_URL` de **`index.html` y `c.html`** (dos archivos).
6. Añadir `notificacion-familias.pdf` (documento de notificación a acudientes) cuando esté listo.
7. Push → Settings → Pages → main / root.

## Privacidad

- La página pública muestra colegio + aula de reservas hechas; nunca contactos ni estudiantes.
- Los nombres de estudiantes solo salen del backend con el código del colegio. El código detiene al curioso, no a un atacante decidido: no poner documento, teléfono ni rol en el roster de la Sheet.
- Este sitio circula por colegios de tratamiento **y** control: nada aquí puede nombrar la intervención.
