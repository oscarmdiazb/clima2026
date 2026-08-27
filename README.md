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

## Confirmación de listas (`c.html`)

Cada colegio recibe en su correo un enlace personal:
```
https://…/c.html?d=<DANE14>&c=<CÓDIGO>
```
La página pide DANE + código, trae del backend la lista de estudiantes de ese colegio, y el colegio marca **Sí/No continúa** y el **curso actual**. El envío escribe en la pestaña `ConfirmacionesLista`. **Los nombres de los estudiantes nunca están en este repo ni en la página**: viven en la pestaña privada `RosterEstudiantes` y el backend solo los entrega con el código correcto.

Insumos (NO commitear — están en `Encuesta/seguimiento_largo_plazo_r1r2/reservas/`):
- `roster_para_sheet.csv` → se importa en la pestaña `RosterEstudiantes` (DANE, Codigo, RowID, Nombre, ClaseOriginal, Colegio).
- `codigos_confirmacion.csv` → códigos y enlaces por colegio, para el mail-merge del correo.

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
