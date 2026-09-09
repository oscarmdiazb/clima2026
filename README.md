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

## Confirmación de listas (`c.html`) — «confirme esto y corríjanos»

Cada colegio recibe un enlace personal. **Basta el código; el DANE ya no se escribe:**
```
https://oscarmdiazb.github.io/clima2026/c.html?c=<CÓDIGO>
```
(`&d=<DANE>` sigue aceptándose y solo hace falta si un código apuntara a dos sedes.)

**La lista NO llega en blanco.** Desde el 9-sep-2026 viene pre-llenada con el rastreo del
SIMAT de agosto 2026: de los 3.235 estudiantes, 2.882 (89 %) ya están ubicados. Al colegio se
le pide **confirmar y corregir**, no llenar. En promedio le quedan **menos de 4 estudiantes**
por responder. Ese cambio es la razón de ser de esta versión: la campaña anterior no la usó
nadie porque el pedido parecía enorme.

La página trae del backend la lista de estudiantes de ese colegio y, por cada uno, el colegio
marca **Sigue / Ya no está en el colegio**. Si sigue, el **curso y la jornada de 2026**; si ya
no está, **qué pasó**. El envío reescribe las filas de ese colegio en la pestaña
`ConfirmacionesLista` y deja una fila de auditoría en `ConfirmacionesLog`.

| | |
|---|---|
| **Pre-llenado** | se siembra al cargar, **solo donde nadie ha respondido**: lo que el colegio contestó —en un envío anterior o en este mismo dispositivo— siempre manda |
| **Sugerido ≠ confirmado** | las filas pre-llenadas van con borde punteado, botones en contorno y el chip *«según nuestros registros — verifique»*. Pulsar el valor sugerido lo **confirma** (no lo desmarca, como haría en una fila normal) |
| **La nota del SIMAT** | bajo el nombre, en gris: *«SIMAT agosto 2026: Decimo · curso 1003 · jornada MAÑANA»*, o en ámbar con ⚠ cuando el estudiante no aparece o cambió de jornada o de sede |
| **Contador honesto** | «Faltan **4** por responder de 34», nunca «0 de 34». Al terminar dice cuántas filas se aceptaron **sin revisar** |
| **Orden de la lista** | abre con **toda la lista**, pero **primero los que faltan** y después los que ya trae el rastreo, con un corte en medio que dice qué es cada grupo. El colegio ve el trabajo completo —y por tanto lo revisa— sin perder el atajo |
| **Filtro «Solo los que faltan»** | opcional, con el número en el propio chip |
| **Numeración estable** | el número de cada estudiante es su puesto en la lista original, no en la pantalla, para que siga sirviendo contra una lista impresa |
| **Dos vías** | llenar **en la pantalla**, o **descargar un .xlsx ya lleno**, completarlo en Excel y **subirlo** |
| **Guardar avance** | se puede enviar incompleto y seguir después con el mismo enlace |
| **Autoguardado local** | lo marcado queda en `localStorage`; si cierran la página no se pierde |
| **«Ya no está» es un solo clic** | al colegio no se le pregunta nada más: ni a dónde se fue (quitado el 8-sep) ni por qué (quitado el 9-sep). El motivo que queda en la Sheet es el del rastreo (`otro_colegio` para los 463 que el SIMAT ubica en otro colegio), no algo que el colegio escriba |
| **Buscador y filtros** | Solo los que faltan / Toda la lista / Siguen / Ya no están |
| **Fecha de la visita** | **solo día y hora — nunca el curso.** El curso de la reserva es el de 2025 y los estudiantes ya no están ahí; verlo hacía pensar que la encuesta se aplica en ese salón, que es justo lo contrario. **Una sola fecha: la reservada, o la sugerida si no han reservado — nunca las dos.** Sale de las mismas pestañas `Reservas`/`Asignaciones` que usa `index.html`. Siempre enlaza al aplicativo de reservas |
| **Recibo** | resumen imprimible al terminar, con la lista descargable para el día de la visita |
| Celular | tarjetas, no tabla; barra fija con el progreso |

**Los nombres de los estudiantes nunca están en este repo ni en la página**: viven en la
pestaña privada `RosterEstudiantes` y el backend solo los entrega con el código correcto.
El pre-llenado tampoco lleva rol, documento ni teléfono.

### Qué se guarda de cada fila, y por qué importa

`Fuente` — `colegio` si una persona tocó esa fila, `simat_sin_tocar` si la aceptó sin abrirla.
Sin esta columna no se puede distinguir una confirmación real de un pre-llenado que nadie miró,
y todo el ejercicio se leería como si el colegio hubiera verificado 3.235 estudiantes.

`CoincideSimat` — `SI`/`NO` según si la respuesta final coincide con lo que decía el SIMAT;
vacío cuando no había pre-llenado. **Es la matriz de concordancia**, igual que en R3: es lo que
dice si el registro administrativo va rezagado frente a la realidad del aula. Para los que
siguen se comparan también curso y jornada; los cursos se comparan sin ceros a la izquierda.

### Los 4 estudiantes sin jornada

El SIMAT ubica a 4 estudiantes en jornada **NOCTURNA** o **FIN DE SEMANA**, que no están entre
las cuatro del formulario. Van **con la jornada vacía a propósito** — el dato está en la nota —
así que le cuentan al colegio como «falta por responder» y alguien tiene que elegir. Por eso el
número del aplicativo (357) es 4 más alto que el `n_por_responder` de
`prefill_por_colegio.csv` (353); el generador de la campaña lo recalcula con la regla del
aplicativo para que el correo y la pantalla digan lo mismo.

### La vía Excel

El .xlsx se **genera y se lee en el navegador** con SheetJS (cargado de cdnjs solo cuando el
colegio pulsa uno de los dos botones — la página no lo descarga si nadie lo usa). El backend
no cambia: el archivo termina rellenando el mismo formulario y se envía por la misma ruta.

Esto es deliberado. Un Excel devuelto **por correo** serían 95 archivos distintos que alguien
tendría que abrir, limpiar y cargar a mano, sin que el colegio sepa nunca si llegó bien — y con
nombres de menores viajando como adjunto. Aquí el colegio **ve en pantalla lo que entendimos**
y confirma antes de enviar.

La hoja `Estudiantes` sale con `#, Código, Estudiante, Curso 2025, Jornada 2025,
Nuestro registro (verifique), ¿Sigue en el colegio? (SI/NO), Curso 2026, Jornada 2026`.
**Viene ya llena con el pre-llenado del SIMAT**, y la columna
*Nuestro registro* lleva la misma nota que se ve en pantalla. Los cursos y
el código van forzados a texto (`t:'s'`, `z:'@'`) para que `0801` no se vuelva `801`. Una
segunda hoja, `Instrucciones`, lista los valores aceptados.

**El lector es deliberadamente tolerante**, porque el colegio no va a respetar la plantilla:

| Se acepta | Se entiende como |
|---|---|
| `si` · `SÍ` · `S` · `x` · `1` · `sigue` | SI |
| `no` · `N` · `0` · `ya no está` · `retirado` | NO |
| `mañana` · `Mañana` · `M` — igual con T / U / C | MAÑANA / TARDE / ÚNICA / COMPLETA |
| una columna de más (p. ej. la del destino, de la plantilla vieja) | se ignora |
| una fila que vuelve idéntica al pre-llenado | se conserva como **sugerida**, no como respuesta del colegio |
| jornada en blanco | la jornada de 2025 |

También: encuentra la fila de encabezados aunque haya filas basura arriba (hasta 15), mapea las
columnas **por su nombre, no por su posición**, busca la hoja correcta dentro del libro, cruza
por `Código` y si falta por **nombre**, y acepta `.xlsx`, `.xls` y `.csv`. Lo que no reconoce lo
**reporta en pantalla** (filas sin responder, estudiantes que no están en la lista) en vez de
tragárselo en silencio.

### La lista para el día de la visita

Botón **«Descargar la lista para el día de la visita»** — en el recibo, y en la barra de
herramientas apenas hay un estudiante marcado. Es lo que el colegio necesita para **ir a
buscar a los estudiantes**: quién sale de clase y de qué salón.

`Para la visita` va **ordenada por el curso de 2026**, no por el de 2025, con una línea en
blanco entre cursos para recorrer salón por salón, y con las columnas *Presente (marque X)* y
*Observaciones* vacías para escribir a mano. Encabezado con el colegio, el día y la hora de la
visita y el total que participa. Se añaden `Ya no están` (con el motivo) y
`Faltan por responder` solo si hay filas que poner en ellas.

### Pestañas que escribe el backend

`ConfirmacionesLista` — **una fila por estudiante, siempre el estado actual** (cada envío del
colegio reemplaza sus filas anteriores):
`Timestamp · DANE · Colegio · RowID · Nombre · ClaseOriginal · JornadaOriginal · Continua · CursoActual · JornadaActual · Motivo · ColegioDestino · Nota · Contacto · Telefono · Estado · Fuente · CoincideSimat`

> `ColegioDestino` queda **siempre vacía** desde el 8-sep-2026. Se conservó la columna
> para no obligar a redesplegar el Apps Script; el backend sigue aceptando el campo
> por si vuelve.

`ConfirmacionesLog` — una fila por envío, nunca se borra:
`Timestamp · DANE · Colegio · Contacto · Telefono · Estado · N_estudiantes · N_siguen · N_salieron · N_sin_tocar · N_distintos_del_simat`

> La versión anterior tenía 9 columnas y añadía filas. Al pegar el `apps-script.gs` nuevo el
> encabezado se amplía solo; las filas viejas quedan con las columnas nuevas vacías.

> ⚠️ **Las pestañas de confirmación van en TEXTO PLANO.** Sin eso la Sheet convierte
> `0801` en el número `801` y el curso pierde el cero de la izquierda. `forzarTexto_()`
> lo aplica en cada envío; es el mismo cuidado que ya se tenía con las columnas
> `Slot` y `Teléfono` de `Reservas`. Si alguna vez se recrea la pestaña a mano,
> ponerla en *Formato → Número → Texto sin formato*.

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

## Actualizar la Sheet con el pre-llenado (una vez, ~5 min)

⚠️ **Sin este paso la página sigue saliendo en blanco.** El pre-llenado vive en la Sheet, no
en este repo.

1. Abrir la Sheet
   [reservas-clima-aula-seguimiento-2026](https://docs.google.com/spreadsheets/d/1ONA2z0hFj_nfXJkTeA_s7jjCBhUkOm14mNrG87ly_Z8/edit).
2. **Borrar la pestaña `RosterEstudiantes` actual** e importar
   `Encuesta/seguimiento_largo_plazo_r1r2/reservas/roster_para_sheet_prefill.csv`
   (*Archivo → Importar → Subir → Insertar hoja nueva*), y renombrarla `RosterEstudiantes`.
   Columnas A–G iguales que antes, más **H `SimatSigue` · I `SimatCurso` · J `SimatJornada` ·
   K `SimatMotivo` · L `SimatNota`**.
3. **Seleccionar toda la pestaña → Formato → Número → Texto sin formato.** Sin esto la Sheet
   convierte `0801` en `801` y el curso pierde el cero.
4. Pegar el `apps-script.gs` de este repo en *Extensiones → Apps Script* y sacar **versión
   nueva de la misma implementación** (la URL no cambia).
5. Comprobar:
   ```bash
   curl -sL ".../exec?tipo=roster&code=DG9GCV" | head -c 400
   ```
   Cada estudiante debe traer `simatSigue`, `simatCurso`, `simatJornada` y `simatNota`.

El CSV del pre-llenado **no se commitea**: lleva nombres de estudiantes. Va de OneDrive a la
Sheet privada, nunca a GitHub.

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

---

## `panel.html` — panel interno de códigos

Buscador de los 95 códigos de acceso, para responder al colegio que escribe pidiendo el suyo.
Busca por colegio, localidad, sede, DANE, código, contacto o celular; copia el código, el
enlace o un mensaje ya redactado, y abre WhatsApp con el mensaje puesto.

**Va cifrado**: PBKDF2-SHA256 200.000 iteraciones → AES-GCM-256. Este repo es público, así que
lo que se sube es texto cifrado y la contraseña **no está en ninguna parte del repo**: vive en
`Encuesta/seguimiento_largo_plazo_r1r2/confirmacion_listas/publicar_consulta_codigos.py`, que
nunca sale de OneDrive.

El enlace está **escondido en el rótulo de `index.html`**: el «R12» del final es el enlace, con
el mismo color, sin subrayado y sin cambio de cursor. La página la abren los colegios y el panel
no es para ellos; quien lo pulse por accidente se topa con la contraseña.

Para regenerarlo:
```bash
cd "../Encuesta/seguimiento_largo_plazo_r1r2/confirmacion_listas"
python3 construir_campana_confirmacion.py   # refresca reservas y confirmaciones
python3 construir_consulta_codigos.py       # arma la página en claro
python3 publicar_consulta_codigos.py        # la cifra y la deja en este repo
```
El publicador **aborta** si en el archivo cifrado quedara legible un nombre de colegio, un
correo, un celular o un enlace con código. `consulta_codigos.html` (la versión en claro) no
se commitea nunca — su carpeta tiene un `.gitignore` que lo ignora todo.

`crypto.subtle` necesita contexto seguro: funciona sobre `https://` y como archivo local en
Chrome, pero **no** sobre `http://` plano.
