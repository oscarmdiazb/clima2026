/**
 * OCE-SED · Encuesta de clima de aula — booking backend.
 *
 * Backend for the static GitHub Pages site at:
 *   https://oscarmdiazb.github.io/reservas-encuesta-clima-aula-2026-oce/
 *
 * What this does:
 *   - GET  → returns counts per slot AND per-slot booking details
 *            (localidad, colegio, jornada, clase). Contacto + teléfono are
 *            never exposed by GET — they live only in the private Sheet.
 *   - POST → validates capacity and appends a row to the "Reservas" sheet.
 *   - Uses LockService so two concurrent bookings can't both fill the last seat.
 *
 * One-time setup:
 *   1) Open the Sheet → Extensions → Apps Script.
 *   2) Paste this whole file in.
 *   3) From the Apps Script editor, run the `setup` function once
 *      (this creates the "Reservas" tab, sets headers, and forces the
 *      Slot/Phone columns to plain-text so dates/numbers aren't
 *      auto-coerced).
 *   4) Deploy → New deployment → type "Web app",
 *      Execute as = me, Who has access = Anyone → copy the URL.
 *   5) Paste that URL into APPS_SCRIPT_URL in index.html.
 */

const SHEET_NAME = 'Reservas';
const ASSIGNMENTS_SHEET_NAME = 'Asignaciones';
const CAPACITY = 4;
// Días sin clase dentro de la ventana (receso estudiantil + festivo).
// IMPORTANT: la misma lista vive en index.html — mantener en sincronía.
const BLOCKED_DATES = ['2026-10-05','2026-10-06','2026-10-07','2026-10-08','2026-10-09','2026-10-12'];
const TIMEZONE = 'America/Bogota';
const SLOT_DURATION_HOURS = 2;
// Minutes the team needs after a session before it can take another booking
// (transit + setup buffer). 60 = 1h buffer, 120 = 2h buffer. Must be a multiple of 30.
// IMPORTANT: this same value also lives at the top of index.html — keep them in sync.
const BUFFER_MIN_AFTER = 60;
const TEAM_BLOCK_MIN = SLOT_DURATION_HOURS * 60 + BUFFER_MIN_AFTER;

// ---------- HTTP handlers ----------

function doGet(e) {
  try {
    // Ruta privada: ?tipo=contactos&key=<CONTACTOS_KEY>
    // Devuelve el contacto y el teléfono de cada reserva — datos personales, por
    // eso va detrás de una clave y NO en la respuesta pública de abajo.
    // La clave se guarda en Configuración del proyecto → Propiedades del script,
    // con el nombre CONTACTOS_KEY (nunca en este archivo: el repo es público).
    if (e && e.parameter && e.parameter.tipo === 'contactos') {
      const esperada = PropertiesService.getScriptProperties().getProperty('CONTACTOS_KEY');
      if (!esperada) return jsonOut_({ ok: false, error: 'contactos_key_no_configurada' });
      if (e.parameter.key !== esperada) return jsonOut_({ ok: false, error: 'no_autorizado' });
      return jsonOut_({ ok: true, contactos: getContactos_() });
    }

    // Ruta: ?tipo=roster&code=<código del correo>[&dane=<12 o 14 dígitos>]
    // Devuelve la lista de estudiantes del colegio SOLO si el código coincide.
    // Los nombres viven en la pestaña RosterEstudiantes de la Sheet privada,
    // nunca en este repo ni en la página.
    if (e && e.parameter && e.parameter.tipo === 'roster') {
      return jsonOut_(getRosterForSchool_(String(e.parameter.dane || ''), String(e.parameter.code || '')));
    }

    // Ruta privada de monitoreo: ?tipo=confirmaciones&key=<CONTACTOS_KEY>
    // Avance de la confirmación por colegio. No devuelve nombres de estudiantes.
    if (e && e.parameter && e.parameter.tipo === 'confirmaciones') {
      const esperadaC = PropertiesService.getScriptProperties().getProperty('CONTACTOS_KEY');
      if (!esperadaC) return jsonOut_({ ok: false, error: 'contactos_key_no_configurada' });
      if (e.parameter.key !== esperadaC) return jsonOut_({ ok: false, error: 'no_autorizado' });
      return jsonOut_({ ok: true, colegios: getEstadoConfirmaciones_() });
    }

    const data = getCurrentData_();
    return jsonOut_({
      ok: true,
      bookings: data.counts,          // { "YYYY-MM-DD HH:mm": n }   (back-compat)
      details: data.details,          // { "YYYY-MM-DD HH:mm": [ { colegio, jornada, clase, localidad, sede, dane, ts } ] }
      assignments: getAssignments_(), // { "DANE|Jornada|Clase": "YYYY-MM-DD" }
      facilitadores: getFacilitadores_(), // { "DANE|Jornada|Clase": "Nombre" }
      capacity: CAPACITY
    });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Wait up to 10s for any in-flight write to finish.
    lock.waitLock(10000);

    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut_({ ok: false, error: 'no_body' });
    }

    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonOut_({ ok: false, error: 'invalid_json' });
    }

    // Branch: facilitator assignment (from acompanamiento.html) vs booking.
    if (body && body.action === 'set_facilitador') {
      return setFacilitador_(body);
    }
    // Branch: confirmación de lista de estudiantes (c.html).
    if (body && body.action === 'confirmar_lista') {
      return confirmarLista_(body);
    }
    // Branch: reschedule an existing reservation to a new slot.
    if (body && body.action === 'reschedule') {
      return rescheduleReservation_(body);
    }

    const slot      = (body && body.slot)      ? String(body.slot).trim()      : '';
    const school    = (body && body.school)    ? String(body.school).trim()    : '';
    const grade     = (body && body.grade)     ? String(body.grade).trim()     : '';
    const jornada   = (body && body.jornada)   ? String(body.jornada).trim()   : '';
    const localidad = (body && body.localidad) ? String(body.localidad).trim() : '';
    const sede      = (body && body.sede)      ? String(body.sede).trim()      : '';
    const dane      = (body && body.dane)      ? String(body.dane).trim()      : '';
    const contact   = (body && body.contact)   ? String(body.contact).trim()   : '';
    const phone     = (body && body.phone)     ? String(body.phone).trim()     : '';
    const direccion = (body && body.direccion) ? String(body.direccion).trim() : '';
    const email     = (body && body.email)     ? String(body.email).trim()     : '';

    if (!slot || !school || !grade || !contact || !phone || !direccion) {
      return jsonOut_({ ok: false, error: 'missing_fields' });
    }
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(slot)) {
      return jsonOut_({ ok: false, error: 'invalid_slot' });
    }
    if (BLOCKED_DATES.indexOf(slot.slice(0, 10)) !== -1) {
      return jsonOut_({ ok: false, error: 'fecha_bloqueada' });
    }
    if (!/^\d{7,15}$/.test(phone)) {
      return jsonOut_({ ok: false, error: 'invalid_phone' });
    }

    // Re-check capacity inside the lock to prevent race conditions.
    // The check is conflict-aware: a 2-hour session occupies 4 half-hour marks,
    // so booking at slot T must leave at least 1 cupo free at every half-hour
    // during [T, T+2h). This prevents a school from booking 8:00 while the
    // surveying team is still busy with someone else's 6:30–8:30 session.
    const counts = getCurrentData_().counts;
    const active = buildActiveMap_(counts);
    if (maxActiveDuringSession_(active, slot) >= CAPACITY) {
      return jsonOut_({ ok: false, error: 'slot_full' });
    }

    // Each aula (colegio + sede + jornada + clase) is allowed exactly one
    // reservation in the whole calendar. Reject any second attempt and return
    // the existing slot so the frontend can tell the user when they booked.
    const existingAula = findAulaReservation_(dane, jornada, grade);
    if (existingAula) {
      return jsonOut_({
        ok: false,
        error: 'aula_already_booked',
        existingSlot: existingAula.slot
      });
    }

    const sheet = getSheet_();
    const newRow = sheet.getLastRow() + 1;

    // Force the Slot column to plain text so Sheets doesn't auto-parse
    // "2026-05-06 06:00" into a date in some other timezone.
    sheet.getRange(newRow, 2).setNumberFormat('@');
    sheet.getRange(newRow, 6).setNumberFormat('@'); // Clase as plain text
    sheet.getRange(newRow, 10).setNumberFormat('@'); // Teléfono as plain text

    // Columns: Timestamp | Slot | Localidad | Colegio | Jornada | Clase | Sede | DANE | Contacto | Teléfono | Dirección | Email
    sheet.appendRow([
      new Date(), slot, localidad, school, jornada, grade, sede, dane, contact, phone, direccion, email
    ]);

    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

// ---------- Helpers ----------

// Header columns in the Reservas sheet — order matters for appendRow() and
// the column reads in getCurrentData_().
const HEADER = [
  'Timestamp', 'Slot', 'Localidad', 'Colegio', 'Jornada',
  'Clase', 'Sede', 'DANE', 'Contacto', 'Teléfono', 'Dirección', 'Email'
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADER.length)
      .setValues([HEADER])
      .setFontWeight('bold');
  }
  return sheet;
}

// Contacto + teléfono de cada reserva, para el pull de seguimiento_reservas.
// Solo se llega aquí con la clave correcta (ver doGet). Una fila por reserva y
// en el orden de la hoja, así quien consuma esto se queda con la última cuando
// un aula reprogramó.
function getContactos_() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, HEADER.length).getValues();
  const out = [];
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (!row[1]) continue;              // sin slot no es una reserva válida
    const slotRaw = row[1];
    const slot = (Object.prototype.toString.call(slotRaw) === '[object Date]')
      ? Utilities.formatDate(slotRaw, TIMEZONE, 'yyyy-MM-dd HH:mm')
      : normalizeSlotKey_(String(slotRaw).trim());
    out.push({
      slot:      slot,
      localidad: String(row[2] || ''),
      colegio:   String(row[3] || ''),
      jornada:   String(row[4] || ''),
      clase:     String(row[5] || ''),
      sede:      String(row[6] || ''),
      dane:      String(row[7] || ''),
      contacto:  String(row[8] || ''),   // columna I
      telefono:  String(row[9] || ''),   // columna J
      direccion: String(row[10] || ''),  // columna K — la escribió el colegio al reservar
      email:     String(row[11] || '')   // columna L
    });
  }
  return out;
}

// Read all rows once and return both per-slot counts AND the per-slot booking
// details (so the calendar can show which schools have already reserved).
function getCurrentData_() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { counts: {}, details: {} };

  // Read all data columns at once.
  const values = sheet.getRange(2, 1, lastRow - 1, HEADER.length).getValues();
  const counts = {};
  const details = {};

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const slotRaw = row[1]; // column B
    if (slotRaw === '' || slotRaw == null) continue;
    let key;
    if (Object.prototype.toString.call(slotRaw) === '[object Date]') {
      key = Utilities.formatDate(slotRaw, TIMEZONE, 'yyyy-MM-dd HH:mm');
    } else {
      // Normalize so "2026-08-11 6:30" → "2026-08-11 06:30". Otherwise the
      // frontend (which always pads) won't match the count back to a slot
      // and the calendar will show full availability for a booked slot.
      key = normalizeSlotKey_(String(slotRaw).trim());
    }
    if (!key) continue;
    counts[key] = (counts[key] || 0) + 1;
    if (!details[key]) details[key] = [];
    // Booking creation timestamp (column A) → "YYYY-MM-DD HH:mm" (Bogota).
    let ts = '';
    const tsRaw = row[0];
    if (Object.prototype.toString.call(tsRaw) === '[object Date]') {
      ts = Utilities.formatDate(tsRaw, TIMEZONE, 'yyyy-MM-dd HH:mm');
    } else if (tsRaw) {
      ts = String(tsRaw).trim();
    }
    details[key].push({
      localidad: String(row[2] || ''),
      colegio:   String(row[3] || ''),
      jornada:   String(row[4] || ''),
      clase:     String(row[5] || ''),
      sede:      String(row[6] || ''),
      dane:      String(row[7] || ''),  // sede DANE — used as part of aulaKey
      ts:        ts,                     // when the booking was submitted
      // Note: contact + phone are intentionally NOT exposed via the public GET.
    });
  }
  return { counts: counts, details: details };
}

// Used by doPost to detect duplicate (school, slot) submissions.
function hasExisting_(slot, school) {
  const data = getCurrentData_();
  const list = data.details[slot] || [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].colegio === school) return true;
  }
  return false;
}

// Returns { slot } if this aula (identified by DANE + jornada + clase) already
// has any reservation anywhere in the calendar, or null otherwise.
// Each aula is allowed exactly one reservation in the whole window.
// Uses DANE (sede ID) as the primary key — immune to spelling drift in colegio
// or sede free-text fields.
function findAulaReservation_(dane, jornada, clase) {
  const data = getCurrentData_();
  const daneStr  = String(dane || '').trim();
  const jorStr   = String(jornada || '').trim();
  const claseStr = String(clase || '').trim();
  if (!daneStr) return null;
  const slotKeys = Object.keys(data.details);
  for (let i = 0; i < slotKeys.length; i++) {
    const list = data.details[slotKeys[i]];
    for (let j = 0; j < list.length; j++) {
      const r = list[j];
      if (r.dane === daneStr &&
          r.jornada === jorStr &&
          r.clase === claseStr) {
        return { slot: slotKeys[i] };
      }
    }
  }
  return null;
}

// Reschedule an existing reservation to a new slot (in place — no new row).
// body: { action:'reschedule', dane, jornada, clase, newSlot }
function rescheduleReservation_(body) {
  const dane  = String(body.dane || '').trim();
  const jor   = String(body.jornada || '').trim();
  const clase = String(body.clase || '').trim();
  const newSlot = String(body.newSlot || '').trim();

  if (!dane || !jor || !clase || !newSlot) {
    return jsonOut_({ ok: false, error: 'missing_fields' });
  }
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(newSlot)) {
    return jsonOut_({ ok: false, error: 'invalid_slot' });
  }
  if (BLOCKED_DATES.indexOf(newSlot.slice(0, 10)) !== -1) {
    return jsonOut_({ ok: false, error: 'fecha_bloqueada' });
  }

  // Locate the aula's current reservation row.
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return jsonOut_({ ok: false, error: 'not_found' });
  const values = sheet.getRange(2, 1, lastRow - 1, HEADER.length).getValues();
  let targetRow = -1, oldSlot = '';
  for (let i = 0; i < values.length; i++) {
    const r = values[i];
    const rDane = String(r[7] || '').trim();
    const rJor  = String(r[4] || '').trim();
    const rCla  = String(r[5] || '').trim();
    if (rDane === dane && rJor === jor && rCla === clase) {
      targetRow = i + 2;
      let sv = r[1];
      oldSlot = (Object.prototype.toString.call(sv) === '[object Date]')
        ? Utilities.formatDate(sv, TIMEZONE, 'yyyy-MM-dd HH:mm')
        : normalizeSlotKey_(String(sv).trim());
      break;
    }
  }
  if (targetRow < 0) return jsonOut_({ ok: false, error: 'not_found' });
  if (oldSlot === newSlot) return jsonOut_({ ok: true, unchanged: true });

  // Capacity check at newSlot, EXCLUDING this aula's own current booking
  // (it's vacating oldSlot, so that seat frees up).
  const counts = getCurrentData_().counts;
  if (counts[oldSlot]) {
    counts[oldSlot] = counts[oldSlot] - 1;
    if (counts[oldSlot] <= 0) delete counts[oldSlot];
  }
  const active = buildActiveMap_(counts);
  if (maxActiveDuringSession_(active, newSlot) >= CAPACITY) {
    return jsonOut_({ ok: false, error: 'slot_full' });
  }

  // Update Slot (col B) + Timestamp (col A) in place.
  sheet.getRange(targetRow, 2).setNumberFormat('@');
  sheet.getRange(targetRow, 2).setValue(newSlot);
  sheet.getRange(targetRow, 1).setValue(new Date());

  return jsonOut_({ ok: true, oldSlot: oldSlot, newSlot: newSlot });
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Accepts loosely-formatted slot strings ("2026-08-11 6:30", "2026-8-1 6:5", etc.)
// and returns the canonical "YYYY-MM-DD HH:MM". Returns the input as-is if it
// doesn't look like a date-time at all (so we don't silently corrupt weird data).
function normalizeSlotKey_(s) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{1,2})$/.exec(s);
  if (!m) return s;
  function pad(n) { return ('0' + n).slice(-2); }
  return m[1] + '-' + pad(m[2]) + '-' + pad(m[3]) + ' ' + pad(m[4]) + ':' + pad(m[5]);
}

// ---------- Aula → fecha assignments ----------
// Reads the "Asignaciones" tab and returns a map
//   { "DANE|Jornada|Clase": "YYYY-MM-DD" }
// where the date is the SPECIFIC DAY (not the Monday of the week).
// Aula identity uses the 14-digit sede DANE (column G) — robust against
// spelling drift in the colegio/sede free-text columns.
// Tab schema:
//   A: Colegio   B: Sede   C: Jornada   D: Clase   E: Fecha (YYYY-MM-DD)
//   F: Pair_ID   G: DANE    H: Brazo  (T or C)   ← admin-only, never exposed
// getAssignments_ reads columns C, D, G to build the key.
// Missing tab, empty tab, or rows missing any of (DANE, Jornada, Clase, Fecha)
// are silently ignored.
const ASSIGNMENTS_HEADER = ['Colegio', 'Sede', 'Jornada', 'Clase', 'Fecha',
                             'Pair_ID', 'DANE', 'Brazo'];

function getAssignments_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ASSIGNMENTS_SHEET_NAME);
  if (!sheet) return {};
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return {};
  // Read 8 columns so we have access to DANE in column G (index 6).
  const values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  const out = {};
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const jornada = String(row[2] || '').trim();
    const clase   = String(row[3] || '').trim();
    let fecha     = row[4];
    const dane    = String(row[6] || '').trim().replace(/\.0+$/, '');
    if (!dane || !jornada || !clase || !fecha) continue;
    // Normalize fecha to "YYYY-MM-DD".
    if (Object.prototype.toString.call(fecha) === '[object Date]') {
      fecha = Utilities.formatDate(fecha, TIMEZONE, 'yyyy-MM-dd');
    } else {
      fecha = String(fecha).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) continue;
    }
    const key = dane + '|' + jornada + '|' + clase;
    out[key] = fecha;
  }
  return out;
}

// ---------- Facilitadores (OCE) ----------
// A separate tab keyed by aula (DANE|Jornada|Clase) so a facilitator can be
// assigned to any aula — reserved or not. Schema (row 1 = headers):
//   A: DANE   B: Jornada   C: Clase   D: Colegio   E: Facilitador   F: updated_at
const FACILITADORES_SHEET_NAME = 'Facilitadores';
const FACILITADORES_HEADER = ['DANE', 'Jornada', 'Clase', 'Colegio', 'Facilitador', 'updated_at'];

function getFacilitadores_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(FACILITADORES_SHEET_NAME);
  if (!sheet || sheet.getLastRow() <= 1) return {};
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  const out = {};
  for (let i = 0; i < values.length; i++) {
    const dane = String(values[i][0] || '').trim().replace(/\.0+$/, '');
    const jor  = String(values[i][1] || '').trim().toUpperCase();
    const cl   = String(values[i][2] || '').trim();
    const fac  = String(values[i][4] || '').trim();
    if (!dane || !jor || !cl) continue;
    out[dane + '|' + jor + '|' + cl] = fac;
  }
  return out;
}

// Upsert a facilitator for one aula. Called from doPost when action=set_facilitador.
function setFacilitador_(body) {
  const dane = String(body.dane || '').trim().replace(/\.0+$/, '');
  const jor  = String(body.jornada || '').trim().toUpperCase();
  const cl   = String(body.clase || '').trim();
  const fac  = String(body.facilitador || '').trim();
  const colegio = String(body.colegio || '').trim();
  if (!dane || !jor || !cl) return jsonOut_({ ok: false, error: 'missing_aula' });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(FACILITADORES_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(FACILITADORES_SHEET_NAME);
    sheet.getRange(1, 1, 1, FACILITADORES_HEADER.length)
      .setValues([FACILITADORES_HEADER]).setFontWeight('bold');
    sheet.getRange('A:A').setNumberFormat('@');
    sheet.getRange('C:C').setNumberFormat('@');
  }

  // Find existing row for this aula key
  const lastRow = sheet.getLastRow();
  let targetRow = -1;
  if (lastRow > 1) {
    const keys = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    for (let i = 0; i < keys.length; i++) {
      const k = String(keys[i][0] || '').trim().replace(/\.0+$/, '') + '|' +
                String(keys[i][1] || '').trim().toUpperCase() + '|' +
                String(keys[i][2] || '').trim();
      if (k === (dane + '|' + jor + '|' + cl)) { targetRow = i + 2; break; }
    }
  }

  const rowVals = [dane, jor, cl, colegio, fac, new Date()];
  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, rowVals.length).setValues([rowVals]);
  } else {
    const nr = sheet.getLastRow() + 1;
    sheet.getRange(nr, 1).setNumberFormat('@');
    sheet.getRange(nr, 3).setNumberFormat('@');
    sheet.getRange(nr, 1, 1, rowVals.length).setValues([rowVals]);
  }
  return jsonOut_({ ok: true, facilitador: fac });
}

// ---------- Conflict-aware capacity ----------
// A booking at slot S occupies 4 half-hour marks (S, S+30, S+60, S+90) because
// each session lasts 2 hours. To start a session at slot T, no half-hour during
// [T, T+2h) can have all 4 teams busy.

function parseSlotKey_(key) {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(key);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
}

function formatSlotKey_(d) {
  function pad(n) { return ('0' + n).slice(-2); }
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
       + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function buildActiveMap_(counts) {
  // active[k] = number of bookings whose [start, start+TEAM_BLOCK_MIN) covers k.
  // (TEAM_BLOCK_MIN = session duration + post-session buffer for transit/setup.)
  const active = {};
  const keys = Object.keys(counts);
  for (let i = 0; i < keys.length; i++) {
    const start = parseSlotKey_(keys[i]);
    if (!start) continue;
    for (let off = 0; off < TEAM_BLOCK_MIN; off += 30) {
      const t = new Date(start.getTime() + off * 60000);
      const tk = formatSlotKey_(t);
      active[tk] = (active[tk] || 0) + counts[keys[i]];
    }
  }
  return active;
}

function maxActiveDuringSession_(active, slot) {
  const start = parseSlotKey_(slot);
  if (!start) return Infinity;
  let maxA = 0;
  for (let off = 0; off < TEAM_BLOCK_MIN; off += 30) {
    const t = new Date(start.getTime() + off * 60000);
    const tk = formatSlotKey_(t);
    if ((active[tk] || 0) > maxA) maxA = active[tk];
  }
  return maxA;
}

// ---------- One-time setup utility ----------
// Run this from the Apps Script editor (Run → setup) the first time you
// install the script. It creates the sheet if missing, writes the header
// row, sets column widths, forces text formatting on the Slot and Phone
// columns, and sets the spreadsheet timezone to America/Bogota.

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TIMEZONE);

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.getRange(1, 1, 1, HEADER.length)
    .setValues([HEADER])
    .setFontWeight('bold')
    .setBackground('#f3f4f6');
  sheet.setFrozenRows(1);

  sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('B:B').setNumberFormat('@'); // Slot as plain text
  sheet.getRange('F:F').setNumberFormat('@'); // Clase as plain text
  sheet.getRange('H:H').setNumberFormat('@'); // DANE as plain text
  sheet.getRange('J:J').setNumberFormat('@'); // Teléfono as plain text

  // Columns: Timestamp | Slot | Localidad | Colegio | Jornada | Clase | Sede | DANE | Contacto | Teléfono
  sheet.setColumnWidth(1, 170); // Timestamp
  sheet.setColumnWidth(2, 140); // Slot
  sheet.setColumnWidth(3, 150); // Localidad
  sheet.setColumnWidth(4, 280); // Colegio
  sheet.setColumnWidth(5, 90);  // Jornada
  sheet.setColumnWidth(6, 70);  // Clase
  sheet.setColumnWidth(7, 200); // Sede
  sheet.setColumnWidth(8, 140); // DANE
  sheet.setColumnWidth(9, 220); // Contacto
  sheet.setColumnWidth(10, 130); // Teléfono

  // Asignaciones tab: maps each aula to its assigned week (Monday). Optional.
  let asignaciones = ss.getSheetByName(ASSIGNMENTS_SHEET_NAME);
  if (!asignaciones) {
    asignaciones = ss.insertSheet(ASSIGNMENTS_SHEET_NAME);
  }
  asignaciones.getRange(1, 1, 1, ASSIGNMENTS_HEADER.length)
    .setValues([ASSIGNMENTS_HEADER])
    .setFontWeight('bold')
    .setBackground('#f3f4f6');
  asignaciones.setFrozenRows(1);
  asignaciones.getRange('D:D').setNumberFormat('@'); // Clase as plain text
  asignaciones.getRange('E:E').setNumberFormat('yyyy-mm-dd'); // Fecha
  asignaciones.getRange('F:F').setNumberFormat('@'); // Pair_ID as plain text
  asignaciones.getRange('G:G').setNumberFormat('@'); // DANE as plain text
  asignaciones.getRange('H:H').setNumberFormat('@'); // Brazo (T/C) as plain text
  asignaciones.setColumnWidth(1, 280); // Colegio
  asignaciones.setColumnWidth(2, 200); // Sede
  asignaciones.setColumnWidth(3, 90);  // Jornada
  asignaciones.setColumnWidth(4, 70);  // Clase
  asignaciones.setColumnWidth(5, 120); // Fecha
  asignaciones.setColumnWidth(6, 120); // Pair_ID  (admin)
  asignaciones.setColumnWidth(7, 140); // DANE     (admin)
  asignaciones.setColumnWidth(8, 70);  // Brazo    (admin)
  // Visually mark the admin columns with a subtle background
  asignaciones.getRange('F1:H1').setBackground('#fef3c7');

  // Facilitadores tab (OCE accompaniment). Keyed by aula (DANE|Jornada|Clase).
  let facs = ss.getSheetByName(FACILITADORES_SHEET_NAME);
  if (!facs) facs = ss.insertSheet(FACILITADORES_SHEET_NAME);
  facs.getRange(1, 1, 1, FACILITADORES_HEADER.length)
    .setValues([FACILITADORES_HEADER]).setFontWeight('bold').setBackground('#f3f4f6');
  facs.setFrozenRows(1);
  facs.getRange('A:A').setNumberFormat('@'); // DANE plain text
  facs.getRange('C:C').setNumberFormat('@'); // Clase plain text
  facs.setColumnWidth(1, 140); facs.setColumnWidth(2, 90); facs.setColumnWidth(3, 70);
  facs.setColumnWidth(4, 280); facs.setColumnWidth(5, 200); facs.setColumnWidth(6, 160);

  Logger.log('Setup complete. Sheets "%s", "%s", "%s" ready.',
             SHEET_NAME, ASSIGNMENTS_SHEET_NAME, FACILITADORES_SHEET_NAME);
}

// =====================================================================
// LISTA DE LLAMADAS — prioritized call list of aulas that have NOT
// reserved yet, sorted by how soon their assigned date is.
// =====================================================================
// Reads: Asignaciones (aula → fecha), Reservas (who reserved),
//        Contactos (aula → contacto/celular/gestor).
// Writes: a "Llamadas" tab, sorted by fecha asignada, color-coded by urgency.
//
// Run it from the "OCE-SED" custom menu, or set a daily trigger with
// crearTriggerDiarioLlamadas(). No web-app redeploy needed.

const CONTACTS_SHEET_NAME = 'Contactos';
const CALLS_SHEET_NAME    = 'Llamadas';

// Adds a custom menu when the spreadsheet opens.
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('OCE-SED')
    .addItem('🔄 Actualizar lista de llamadas', 'actualizarLlamadas')
    .addSeparator()
    .addItem('⏰ Programar actualización diaria (7am)', 'crearTriggerDiarioLlamadas')
    .addToUI();
}

function _aulaKey_(dane, jornada, clase) {
  var d = String(dane || '').trim().replace(/\.0+$/, '');
  return d + '|' + String(jornada || '').trim().toUpperCase() + '|' + String(clase || '').trim();
}

function actualizarLlamadas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- Reserved aula keys (from Reservas) ---
  var reserved = {};
  var rSheet = ss.getSheetByName(SHEET_NAME);
  if (rSheet && rSheet.getLastRow() > 1) {
    // Columns: Timestamp|Slot|Localidad|Colegio|Jornada|Clase|Sede|DANE|Contacto|Teléfono
    var rv = rSheet.getRange(2, 1, rSheet.getLastRow() - 1, 8).getValues();
    for (var i = 0; i < rv.length; i++) {
      var k = _aulaKey_(rv[i][7], rv[i][4], rv[i][5]);
      var slot = rv[i][1];
      if (Object.prototype.toString.call(slot) === '[object Date]') {
        slot = Utilities.formatDate(slot, TIMEZONE, 'yyyy-MM-dd HH:mm');
      }
      reserved[k] = String(slot || '').trim();
    }
  }

  // --- Contacts lookup ---
  var contacts = {};
  var cSheet = ss.getSheetByName(CONTACTS_SHEET_NAME);
  if (cSheet && cSheet.getLastRow() > 1) {
    // Columns: DANE|Jornada|Clase|Colegio|Localidad|Contacto|Rol|Celular|Gestor
    var cv = cSheet.getRange(2, 1, cSheet.getLastRow() - 1, 9).getValues();
    for (var j = 0; j < cv.length; j++) {
      contacts[_aulaKey_(cv[j][0], cv[j][1], cv[j][2])] = {
        localidad: cv[j][4], contacto: cv[j][5], rol: cv[j][6],
        celular: String(cv[j][7] || '').replace(/\.0+$/, ''), gestor: cv[j][8]
      };
    }
  }

  // --- Assignments ---
  var aSheet = ss.getSheetByName(ASSIGNMENTS_SHEET_NAME);
  if (!aSheet || aSheet.getLastRow() <= 1) {
    SpreadsheetApp.getUi().alert('No hay datos en la pestaña "Asignaciones".');
    return;
  }
  // Columns: Colegio|Sede|Jornada|Clase|Fecha|Pair_ID|DANE|Brazo
  var av = aSheet.getRange(2, 1, aSheet.getLastRow() - 1, 8).getValues();

  // Which aulas (by pair) have reserved — to flag the partner's status.
  var assignedByKey = {};
  for (var a = 0; a < av.length; a++) {
    assignedByKey[_aulaKey_(av[a][6], av[a][2], av[a][3])] = av[a];
  }

  // Today at midnight (Bogota)
  var today = new Date(Utilities.formatDate(new Date(), TIMEZONE, 'yyyy/MM/dd'));

  var pending = [];
  for (var b = 0; b < av.length; b++) {
    var row = av[b];
    var colegio = row[0], sede = row[1], jornada = row[2], clase = row[3];
    var fecha = row[4], pair = row[5], dane = row[6], brazo = row[7];
    var key = _aulaKey_(dane, jornada, clase);
    if (reserved[key]) continue; // already reserved → not a call target

    // Normalize fecha → Date + string
    var fechaStr, fechaDt;
    if (Object.prototype.toString.call(fecha) === '[object Date]') {
      fechaDt = fecha;
      fechaStr = Utilities.formatDate(fecha, TIMEZONE, 'yyyy-MM-dd');
    } else {
      fechaStr = String(fecha || '').trim();
      var mm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaStr);
      fechaDt = mm ? new Date(+mm[1], +mm[2] - 1, +mm[3]) : null;
    }
    var dias = fechaDt ? Math.round((fechaDt.getTime() - today.getTime()) / 86400000) : '';

    // Partner reservation status (same pair, other arm)
    var partnerReserved = '';
    for (var p in assignedByKey) {
      var pr = assignedByKey[p];
      if (pr[5] === pair && p !== key) {
        partnerReserved = reserved[p] ? 'Sí' : 'No';
        break;
      }
    }

    var c = contacts[key] || {};
    var prioridad =
      (dias === '' ) ? '' :
      (dias < 0)     ? '🔴 VENCIDA' :
      (dias <= 3)    ? '🔴 URGENTE' :
      (dias <= 7)    ? '🟠 Alta' :
      (dias <= 14)   ? '🟡 Media' : 'Normal';

    pending.push([
      prioridad, fechaStr, dias, colegio, jornada, clase,
      c.localidad || '', c.contacto || '', c.rol || '', c.celular || '',
      c.gestor || '', pair, brazo, partnerReserved
    ]);
  }

  // Sort by fecha asc (empty dates last), then colegio
  pending.sort(function (x, y) {
    var fx = x[1] || '9999', fy = y[1] || '9999';
    if (fx !== fy) return fx < fy ? -1 : 1;
    return String(x[3]).localeCompare(String(y[3]));
  });

  // --- Write the Llamadas tab ---
  var out = ss.getSheetByName(CALLS_SHEET_NAME);
  if (!out) out = ss.insertSheet(CALLS_SHEET_NAME);
  out.clear();

  var header = ['Prioridad', 'Fecha asignada', 'Días', 'Colegio', 'Jornada', 'Aula',
                'Localidad', 'Contacto', 'Rol', 'Celular', 'Gestor/Dupla',
                'Par', 'Brazo', '¿Par ya reservó?'];
  out.getRange(1, 1, 1, header.length).setValues([header])
     .setFontWeight('bold').setBackground('#0f4c81').setFontColor('#ffffff');
  out.setFrozenRows(1);

  var stamp = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm');
  if (pending.length) {
    out.getRange(2, 1, pending.length, header.length).setValues(pending);
    // Color rows by urgency
    for (var r = 0; r < pending.length; r++) {
      var dias = pending[r][2];
      var bg = '#ffffff';
      if (dias !== '') {
        if (dias <= 3) bg = '#fecaca';        // red
        else if (dias <= 7) bg = '#fed7aa';   // orange
        else if (dias <= 14) bg = '#fef3c7';  // yellow
      }
      out.getRange(r + 2, 1, 1, header.length).setBackground(bg);
    }
    out.getRange('J2:J' + (pending.length + 1)).setNumberFormat('@'); // Celular as text
  } else {
    out.getRange(2, 1).setValue('🎉 Todas las aulas asignadas ya reservaron.');
  }

  // Column widths
  var widths = [110, 120, 55, 260, 90, 60, 140, 200, 150, 120, 150, 100, 60, 120];
  for (var w = 0; w < widths.length; w++) out.setColumnWidth(w + 1, widths[w]);

  // Footer note with count + timestamp
  var noteRow = pending.length + 3;
  out.getRange(noteRow, 1).setValue(
    pending.length + ' aula(s) sin reservar · actualizado ' + stamp);
  out.getRange(noteRow, 1).setFontColor('#6b7280').setFontStyle('italic');

  SpreadsheetApp.getActiveSpreadsheet().toast(
    pending.length + ' aulas sin reservar', 'Lista de llamadas actualizada', 5);
}

// Creates a daily trigger (7am) that refreshes the Llamadas tab automatically.
function crearTriggerDiarioLlamadas() {
  // Remove existing triggers for this function to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'actualizarLlamadas') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('actualizarLlamadas')
    .timeBased().atHour(7).everyDays(1)
    .inTimezone(TIMEZONE).create();
  SpreadsheetApp.getUi().alert('Listo. La lista de llamadas se actualizará automáticamente cada día a las 7am.');
}


// ==================== Confirmación de listas de estudiantes ====================
// Responde: ¿dónde está hoy cada estudiante de la lista de 2025?
//
// SOLO LEE la pestaña Reservas (para mostrarle al colegio la fecha de su visita).
// Nunca la escribe: el agendamiento no se toca desde aquí.
//
// Pestaña RosterEstudiantes (privada, cargada desde roster_para_sheet.csv):
//   A: DANE   B: Codigo (acceso del colegio)   C: RowID
//   D: Nombre  E: ClaseOriginal  F: Colegio  G: ClassID (DANE-JORNADA-CLASE, opcional)
//   H: SimatSigue (SI/NO/vacío)  I: SimatCurso  J: SimatJornada
//   K: SimatMotivo  L: SimatNota
// Las columnas H–L son el PRE-LLENADO del rastreo SIMAT de agosto 2026: lo que ya
// sabemos de cada estudiante. El colegio confirma o corrige, no llena en blanco.
// ⚠ La pestaña debe estar en formato TEXTO o la Sheet convierte 0801 en 801.
// Pestaña ConfirmacionesLista (la escribe el servidor). UNA fila por estudiante:
//   cada envío del colegio REEMPLAZA sus filas anteriores, así la pestaña
//   siempre es el estado actual y se puede leer directo en el análisis.
// Pestaña ConfirmacionesLog (auditoría): una fila por envío.
const ROSTER_SHEET_NAME  = 'RosterEstudiantes';
const CONFIRM_SHEET_NAME = 'ConfirmacionesLista';
const LOG_SHEET_NAME     = 'ConfirmacionesLog';
// ColegioDestino queda pero SIEMPRE VACÍA: el 8-sep-2026 se quitó del formulario
// la pregunta «¿a dónde se fue?» — los colegios no lo saben y la pregunta hacía
// ver la tarea más pesada de lo que es. La columna se conserva para no obligar a
// redesplegar el script; el backend sigue aceptando el campo si alguna vez vuelve.
const CONFIRM_HEADER = ['Timestamp','DANE','Colegio','RowID','Nombre',
                        'ClaseOriginal','JornadaOriginal',
                        'Continua','CursoActual','JornadaActual',
                        'Motivo','ColegioDestino','Nota',
                        'Contacto','Telefono','Estado',
                        'Fuente','CoincideSimat'];
// Fuente: 'colegio' si una persona tocó esa fila; 'simat_sin_tocar' si la aceptó
//   sin abrirla. Sin esto no se puede distinguir una confirmación real de un
//   pre-llenado que nadie miró.
// CoincideSimat: SI/NO según si la respuesta final coincide con lo que decía el
//   SIMAT; vacío cuando no había pre-llenado. Es la matriz de concordancia — es
//   lo que dice si el registro administrativo va rezagado frente a la realidad.
const LOG_HEADER = ['Timestamp','DANE','Colegio','Contacto','Telefono','Estado',
                    'N_estudiantes','N_siguen','N_salieron',
                    'N_sin_tocar','N_distintos_del_simat'];
const JORNADAS_OK = ['MAÑANA','TARDE','ÚNICA','COMPLETA'];

function normDane_(x) { return String(x || '').trim().replace(/\.0+$/, ''); }
// Los DANE llegan a veces con 12 dígitos (establecimiento) y a veces con 14
// (sede). Comparamos por los primeros 12 para que ambos casen.
function daneKey_(x) { return normDane_(x).slice(0, 12); }

function claseKey_(x) { return String(x || '').trim().toUpperCase().replace(/^0+/, ''); }

function normJornada_(x) {
  const s = String(x || '').trim().toUpperCase()
    .replace(/Á/g, 'A').replace(/Ñ/g, 'N').replace(/Ú/g, 'U');
  if (s.indexOf('MAN')  === 0) return 'MAÑANA';
  if (s.indexOf('TAR')  === 0) return 'TARDE';
  if (s.indexOf('UNI')  === 0) return 'ÚNICA';
  if (s.indexOf('COMP') === 0) return 'COMPLETA';
  return '';
}

// Todo lo que guardamos es TEXTO. Sin esto la Sheet convierte "0801" en el
// número 801 y el curso pierde el cero de la izquierda — el mismo problema que
// ya obligó a forzar texto plano en las columnas Slot y Teléfono de Reservas.
function forzarTexto_(sheet, nCols) {
  sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 2), nCols).setNumberFormat('@');
}

function getConfirmSheet_(crear) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let cs = ss.getSheetByName(CONFIRM_SHEET_NAME);
  if (!cs) {
    if (!crear) return null;
    cs = ss.insertSheet(CONFIRM_SHEET_NAME);
    forzarTexto_(cs, CONFIRM_HEADER.length);
    cs.getRange(1, 1, 1, CONFIRM_HEADER.length).setValues([CONFIRM_HEADER]).setFontWeight('bold');
    cs.setFrozenRows(1);
    return cs;
  }
  // Si el encabezado es de una versión anterior (más corto), lo reescribimos.
  if (cs.getLastColumn() < CONFIRM_HEADER.length) {
    cs.getRange(1, 1, 1, CONFIRM_HEADER.length).setValues([CONFIRM_HEADER]).setFontWeight('bold');
  }
  if (crear) forzarTexto_(cs, CONFIRM_HEADER.length);
  return cs;
}

// Asignaciones completas: una entrada por aula, con jornada y clase.
function getAssignmentsFull_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ASSIGNMENTS_SHEET_NAME);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
  const out = [];
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const jornada = String(row[2] || '').trim();
    const clase   = String(row[3] || '').trim();
    let   fecha   = row[4];
    const dane    = normDane_(row[6]);
    if (!dane || !clase) continue;
    if (Object.prototype.toString.call(fecha) === '[object Date]') {
      fecha = Utilities.formatDate(fecha, TIMEZONE, 'yyyy-MM-dd');
    } else {
      fecha = String(fecha || '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) fecha = '';
    }
    out.push({ dane12: daneKey_(dane), jornada: jornada, clase: clase, fecha: fecha });
  }
  return out;
}

// Fecha de la visita del colegio. O la reservada O la sugerida, nunca las dos
// mezcladas: si el colegio ya reservó, la reserva manda y la sugerida se
// descarta. SOLO LECTURA sobre Reservas.
function getFechasForDane_(dane) {
  const k = daneKey_(dane);
  if (!k) return [];
  const reservadas = [];
  try {
    const sheet = getSheet_();
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const v = sheet.getRange(2, 1, lastRow - 1, HEADER.length).getValues();
      for (let i = 0; i < v.length; i++) {
        if (!v[i][1]) continue;                       // sin slot no es reserva
        if (daneKey_(v[i][7]) !== k) continue;        // col H = DANE
        const raw = v[i][1];
        const slot = (Object.prototype.toString.call(raw) === '[object Date]')
          ? Utilities.formatDate(raw, TIMEZONE, 'yyyy-MM-dd HH:mm')
          : normalizeSlotKey_(String(raw).trim());
        reservadas.push({ fecha: slot.slice(0, 10), hora: slot.slice(11, 16),
                          jornada: String(v[i][4] || '').trim(),
                          clase:   String(v[i][5] || '').trim(),
                          tipo: 'reservada' });
      }
    }
  } catch (err) { /* si Reservas no existe seguimos con Asignaciones */ }

  let out = reservadas;
  if (!out.length) {                                  // nadie reservó → la sugerida
    const asg = getAssignmentsFull_();
    out = [];
    for (let i = 0; i < asg.length; i++) {
      const a = asg[i];
      if (a.dane12 !== k || !a.fecha) continue;
      out.push({ fecha: a.fecha, hora: '', jornada: a.jornada, clase: a.clase,
                 tipo: 'asignada' });
    }
  }

  // Varias aulas en el mismo día y hora son UNA sola visita: se colapsan, y se
  // quita la etiqueta del curso porque ya no describe a una sola aula.
  const porSlot = {}; const orden = [];
  for (let i = 0; i < out.length; i++) {
    const key = out[i].fecha + ' ' + out[i].hora;
    if (!porSlot[key]) { porSlot[key] = out[i]; porSlot[key].n = 1; orden.push(key); }
    else { porSlot[key].n++; porSlot[key].clase = ''; porSlot[key].jornada = ''; }
  }
  const fin = orden.map(function (kk) { return porSlot[kk]; });
  fin.sort(function (x, y) { return x.fecha < y.fecha ? -1 : (x.fecha > y.fecha ? 1 : 0); });
  return fin;
}

// dane es OPCIONAL: si no viene, lo deducimos del código (así el colegio solo
// escribe 6 caracteres y no 14 dígitos).
function getRosterForSchool_(dane, code) {
  dane = normDane_(dane);
  code = String(code || '').trim().toUpperCase();
  if (!code) return { ok: false, error: 'missing_fields' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ROSTER_SHEET_NAME);
  if (!sheet || sheet.getLastRow() <= 1) return { ok: false, error: 'roster_no_cargado' };
  // G = ClassID, H–L = pre-llenado del rastreo SIMAT. Todas opcionales.
  const nCols  = Math.min(Math.max(sheet.getLastColumn(), 6), 12);
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, nCols).getValues();

  // Sin DANE: buscarlo por el código. Si apunta a más de una sede, lo pedimos.
  if (!dane) {
    const danes = {};
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][1] || '').trim().toUpperCase() === code) danes[normDane_(values[i][0])] = 1;
    }
    const lista = Object.keys(danes);
    if (!lista.length) return { ok: false, error: 'codigo_no_encontrado' };
    if (lista.length > 1) return { ok: false, error: 'codigo_ambiguo' };
    dane = lista[0];
  }

  const k = daneKey_(dane);
  // Jornada por aula, desde Asignaciones: respaldo cuando el roster no trae ClassID.
  const jornadaPorClase = {};
  const asg = getAssignmentsFull_();
  for (let i = 0; i < asg.length; i++) {
    if (asg[i].dane12 === k) jornadaPorClase[claseKey_(asg[i].clase)] = normJornada_(asg[i].jornada);
  }

  const rows = []; let colegio = ''; let hayColegio = false;
  for (let i = 0; i < values.length; i++) {
    if (daneKey_(values[i][0]) !== k) continue;
    hayColegio = true;
    if (String(values[i][1] || '').trim().toUpperCase() !== code) return { ok: false, error: 'codigo_invalido' };
    const clase = String(values[i][4] || '');
    // ClassID = "DANE-JORNADA-CLASE"; si está, es la fuente más directa.
    let jornada = '';
    const cid = nCols >= 7 ? String(values[i][6] || '') : '';
    const partes = cid.split('-');
    if (partes.length >= 3) jornada = normJornada_(partes[1]);
    if (!jornada) jornada = jornadaPorClase[claseKey_(clase)] || '';
    const simatSigue = nCols >= 8  ? String(values[i][7]  || '').trim().toUpperCase() : '';
    rows.push({ id: String(values[i][2] || ''), nombre: String(values[i][3] || ''),
                clase: clase, jornada: jornada,
                simatSigue:   (simatSigue === 'SI' || simatSigue === 'NO') ? simatSigue : '',
                simatCurso:   nCols >= 9  ? String(values[i][8]  || '').trim() : '',
                simatJornada: nCols >= 10 ? normJornada_(values[i][9]) : '',
                simatMotivo:  nCols >= 11 ? String(values[i][10] || '').trim() : '',
                simatNota:    nCols >= 12 ? String(values[i][11] || '').trim() : '' });
    colegio = String(values[i][5] || '');
  }
  if (!hayColegio) return { ok: false, error: 'colegio_no_encontrado' };

  // Lo que ese colegio ya nos envió, para que pueda reanudar o corregir.
  const done = {}; let contacto = '', telefono = '';
  const cs = getConfirmSheet_(false);
  if (cs && cs.getLastRow() > 1) {
    const nc = Math.max(cs.getLastColumn(), CONFIRM_HEADER.length);
    const cv = cs.getRange(2, 1, cs.getLastRow() - 1, nc).getValues();
    for (let i = 0; i < cv.length; i++) {
      if (daneKey_(cv[i][1]) !== k) continue;
      done[String(cv[i][3])] = {
        continua: String(cv[i][7]  || ''), curso:   String(cv[i][8]  || ''),
        // (si una fila vieja perdió el cero, el colegio lo ve y lo corrige)
        jornada:  String(cv[i][9]  || ''), motivo:  String(cv[i][10] || ''),
        destino:  String(cv[i][11] || ''), nota:    String(cv[i][12] || '')
      };
      contacto = String(cv[i][13] || contacto);
      telefono = String(cv[i][14] || telefono);
    }
  }

  const fechas = getFechasForDane_(dane);
  return { ok: true, dane: dane, colegio: colegio, estudiantes: rows,
           confirmados: done, contacto: contacto, telefono: telefono,
           fechas: fechas,
           fecha:      fechas.length ? fechas[0].fecha : null,
           fecha_tipo: fechas.length ? fechas[0].tipo  : '' };
}

function confirmarLista_(body) {
  const dane     = normDane_(body.dane);
  const code     = String(body.code || '').trim().toUpperCase();
  const contacto = String(body.contacto || '').trim();
  const telefono = String(body.telefono || '').trim();
  const estado   = (String(body.estado || 'final').toLowerCase() === 'parcial') ? 'parcial' : 'final';
  const items    = body.items;
  if (!code || !contacto || !Array.isArray(items) || !items.length) {
    return jsonOut_({ ok: false, error: 'missing_fields' });
  }
  // Revalidar el código contra el roster: nadie escribe filas de otro colegio.
  const roster = getRosterForSchool_(dane, code);
  if (!roster.ok) return jsonOut_(roster);
  const byId = {};
  roster.estudiantes.forEach(function (r) { byId[r.id] = r; });
  const daneReal = roster.dane;
  const colegio  = roster.colegio;
  const k = daneKey_(daneReal);

  const MOTIVOS_OK = { otro_colegio:1, retiro:1, traslado_ciudad:1, nunca_estuvo:1, no_sabemos:1 };
  const ts = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
  const out = []; let nSi = 0, nNo = 0, nSinTocar = 0, nDistintos = 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i] || {};
    const id = String(it.id || '');
    if (!byId[id]) continue;                    // solo estudiantes de ese colegio
    const cont = (String(it.continua).toUpperCase() === 'SI') ? 'SI' : 'NO';
    const curso   = cont === 'SI' ? String(it.curso || '').trim().slice(0, 30) : '';
    let   jornada = cont === 'SI' ? normJornada_(it.jornada) : '';
    if (cont === 'SI' && !jornada) jornada = byId[id].jornada || '';
    let   motivo  = cont === 'NO' ? String(it.motivo  || '').trim() : '';
    const destino = cont === 'NO' ? String(it.destino || '').trim().slice(0, 120) : '';
    const nota    = String(it.nota || '').trim().slice(0, 200);
    if (motivo && !MOTIVOS_OK[motivo]) motivo = 'no_sabemos';
    if (cont === 'SI') nSi++; else nNo++;

    // Quién respondió esta fila: el colegio, o nadie (aceptó el pre-llenado).
    const fuente = (String(it.fuente || '') === 'simat_sin_tocar' && byId[id].simatSigue)
                   ? 'simat_sin_tocar' : 'colegio';
    if (fuente === 'simat_sin_tocar') nSinTocar++;

    // ¿La respuesta final coincide con lo que decía el SIMAT? Vacío si no había
    // pre-llenado. Para los que siguen se comparan también curso y jornada.
    let coincide = '';
    const s = byId[id];
    if (s.simatSigue) {
      if (cont !== s.simatSigue) coincide = 'NO';
      else if (cont === 'NO')    coincide = 'SI';
      else coincide = (claseKey_(curso) === claseKey_(s.simatCurso) &&
                       normJornada_(jornada) === s.simatJornada) ? 'SI' : 'NO';
      if (coincide === 'NO') nDistintos++;
    }

    out.push([ts, daneReal, colegio, id, byId[id].nombre,
              byId[id].clase, byId[id].jornada,
              cont, curso, jornada,
              motivo, destino, nota,
              contacto, telefono, estado,
              fuente, coincide]);
  }
  if (!out.length) return jsonOut_({ ok: false, error: 'sin_items_validos' });

  const cs = getConfirmSheet_(true);
  // Reemplazar las filas anteriores de este colegio (de abajo hacia arriba).
  if (cs.getLastRow() > 1) {
    const danes = cs.getRange(2, 2, cs.getLastRow() - 1, 1).getValues();
    for (let r = danes.length - 1; r >= 0; r--) {
      if (daneKey_(danes[r][0]) === k) cs.deleteRow(r + 2);
    }
  }
  cs.getRange(cs.getLastRow() + 1, 1, out.length, CONFIRM_HEADER.length).setValues(out);

  // Auditoría: una fila por envío, nunca se borra.
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let ls = ss.getSheetByName(LOG_SHEET_NAME);
  if (!ls) {
    ls = ss.insertSheet(LOG_SHEET_NAME);
    ls.getRange(1, 1, 1, LOG_HEADER.length).setValues([LOG_HEADER]).setFontWeight('bold');
    ls.setFrozenRows(1);
  }
  forzarTexto_(ls, LOG_HEADER.length);
  ls.appendRow([ts, daneReal, colegio, contacto, telefono, estado, out.length, nSi, nNo,
                nSinTocar, nDistintos]);

  return jsonOut_({ ok: true, guardados: out.length, siguen: nSi, salieron: nNo,
                    sin_tocar: nSinTocar, distintos_del_simat: nDistintos, estado: estado });
}

// Monitoreo interno: ?tipo=confirmaciones&key=<CONTACTOS_KEY>
// Una fila por colegio con el avance. Sin nombres de estudiantes.
function getEstadoConfirmaciones_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const roster = ss.getSheetByName(ROSTER_SHEET_NAME);
  const tot = {}, nom = {};
  if (roster && roster.getLastRow() > 1) {
    const v = roster.getRange(2, 1, roster.getLastRow() - 1, 6).getValues();
    for (let i = 0; i < v.length; i++) {
      const k = daneKey_(v[i][0]); if (!k) continue;
      tot[k] = (tot[k] || 0) + 1;
      nom[k] = String(v[i][5] || '');
    }
  }
  const conf = {}, ult = {}, est = {};
  const cs = getConfirmSheet_(false);
  if (cs && cs.getLastRow() > 1) {
    const nc = Math.max(cs.getLastColumn(), CONFIRM_HEADER.length);
    const cv = cs.getRange(2, 1, cs.getLastRow() - 1, nc).getValues();
    for (let i = 0; i < cv.length; i++) {
      const k = daneKey_(cv[i][1]); if (!k) continue;
      if (!conf[k]) conf[k] = { marcados: 0, siguen: 0, salieron: 0, sin_tocar: 0, distintos: 0 };
      conf[k].marcados++;
      if (String(cv[i][7]) === 'SI') conf[k].siguen++; else conf[k].salieron++;
      if (String(cv[i][16]) === 'simat_sin_tocar') conf[k].sin_tocar++;
      if (String(cv[i][17]) === 'NO') conf[k].distintos++;
      ult[k] = String(cv[i][0]  || '');
      est[k] = String(cv[i][15] || '');
    }
  }
  const out = [];
  Object.keys(tot).forEach(function (k) {
    const c = conf[k] || { marcados: 0, siguen: 0, salieron: 0, sin_tocar: 0, distintos: 0 };
    out.push({ dane: k, colegio: nom[k], en_lista: tot[k], marcados: c.marcados,
               siguen: c.siguen, salieron: c.salieron,
               sin_tocar: c.sin_tocar, distintos_del_simat: c.distintos,
               estado: est[k] || 'sin_empezar', ultima: ult[k] || '' });
  });
  out.sort(function (a, b) { return a.marcados - b.marcados; });
  return out;
}
