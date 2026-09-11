#!/usr/bin/env python3
"""Carga inicial (una sola vez) de la Google Sheet «reservas-clima-aula-seguimiento-2026»
a las tablas clima_* de Supabase.

Fuentes:
  --dump DIR   CSVs sacados del volcado de la Sheet: reservas.csv, asignaciones.csv,
               facilitadores.csv, confirmaciones.csv, confirmaciones_log.csv
  roster       Encuesta/seguimiento_largo_plazo_r1r2/reservas/roster_para_sheet_prefill.csv
               (es lo que se pegó en la pestaña RosterEstudiantes)

Escribe con la service key (lee ~/oscar-personal-apps/.env.supabase). Nunca la imprime.
Idempotente: vacía cada tabla antes de cargarla (--solo TABLA para una sola).
"""
import argparse, csv, json, os, sys, urllib.request, datetime as dt
from pathlib import Path

ENV = Path.home() / "oscar-personal-apps" / ".env.supabase"
AQUI = Path(__file__).resolve().parent
PROY = AQUI.parent.parent
ROSTER = PROY / "Encuesta" / "seguimiento_largo_plazo_r1r2" / "reservas" / "roster_para_sheet_prefill.csv"

def env():
    d = {}
    for l in ENV.read_text().splitlines():
        if "=" in l and not l.startswith("#"):
            k, v = l.split("=", 1); d[k.strip()] = v.strip().strip('"').strip("'")
    return d["SUPABASE_URL"].rstrip("/"), d["SUPABASE_SERVICE_KEY"]

URL, KEY = env()
H = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}

def req(method, path, body=None, prefer=None):
    h = dict(H)
    if prefer: h["Prefer"] = prefer
    r = urllib.request.Request(f"{URL}/rest/v1/{path}", method=method,
                               data=json.dumps(body).encode() if body is not None else None, headers=h)
    try:
        with urllib.request.urlopen(r, timeout=120) as f:
            t = f.read().decode(); return json.loads(t) if t else None
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:500]); raise

def vaciar(tabla):
    req("DELETE", f"{tabla}?id=gt.0" if tabla != "clima_facilitadores" else f"{tabla}?dane=neq.__none__")

def insertar(tabla, filas, lote=500):
    for i in range(0, len(filas), lote):
        req("POST", tabla, filas[i:i+lote], prefer="return=minimal")
    print(f"  {tabla}: {len(filas)} filas")

def leer(p):
    with open(p, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))

def norm_slot(s):
    import re
    m = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{1,2})$", s.strip())
    if not m: return s.strip()
    y, mo, d, h, mi = m.groups()
    return f"{y}-{int(mo):02d}-{int(d):02d} {int(h):02d}:{int(mi):02d}"

def ts_bogota(s):
    """'8/27/2026 15:53:41' o '2026-09-10 15:38:18' (hora Bogotá) → ISO con -05:00."""
    s = s.strip()
    for fmt in ("%m/%d/%Y %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%m/%d/%Y %H:%M", "%Y-%m-%d %H:%M", "%m/%d/%Y"):
        try:
            return dt.datetime.strptime(s, fmt).strftime("%Y-%m-%dT%H:%M:%S-05:00")
        except ValueError: pass
    return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dump", required=True)
    ap.add_argument("--solo", default="")
    a = ap.parse_args()
    D = Path(a.dump)
    quiere = lambda t: not a.solo or a.solo == t

    if quiere("clima_reservas"):
        rows = leer(D / "reservas.csv"); out = []
        for r in rows:
            if not r["Slot"].strip(): continue
            out.append({"ts": ts_bogota(r["Timestamp"]) or dt.datetime.now().isoformat(),
                        "slot": norm_slot(r["Slot"]), "localidad": r["Localidad"], "colegio": r["Colegio"],
                        "jornada": r["Jornada"], "clase": r["Clase"], "sede": r["Sede"], "dane": r["DANE"],
                        "contacto": r["Contacto"], "telefono": r["Teléfono"], "direccion": r["Dirección"],
                        "email": r.get("Email", "")})
        vaciar("clima_reservas"); insertar("clima_reservas", out)

    if quiere("clima_asignaciones"):
        rows = leer(D / "asignaciones.csv"); out = []
        for r in rows:
            out.append({"colegio": r["Colegio"], "sede": r["Sede"], "jornada": r["Jornada"], "clase": r["Clase"],
                        "fecha": r["Fecha"] or None, "pair_id": r["Pair_ID"], "dane": r["DANE"],
                        "brazo": r["Brazo"], "classid": r.get("ClassID", "")})
        vaciar("clima_asignaciones"); insertar("clima_asignaciones", out)

    if quiere("clima_facilitadores"):
        rows = leer(D / "facilitadores.csv"); out = []; vistos = set()
        for r in rows:
            k = (r["DANE"], r["Jornada"].upper(), r["Clase"])
            if k in vistos: continue
            vistos.add(k)
            out.append({"dane": r["DANE"], "jornada": r["Jornada"].upper(), "clase": r["Clase"],
                        "colegio": r["Colegio"], "facilitador": r["Facilitador"]})
        vaciar("clima_facilitadores"); insertar("clima_facilitadores", out)

    if quiere("clima_roster"):
        rows = leer(ROSTER); out = []
        for r in rows:
            out.append({"dane": r["DANE"], "codigo": r["Codigo"], "rowid": r["RowID"], "nombre": r["Nombre"],
                        "clase_original": r["ClaseOriginal"], "colegio": r["Colegio"], "classid": r.get("ClassID", ""),
                        "simat_sigue": r.get("SimatSigue", ""), "simat_curso": r.get("SimatCurso", ""),
                        "simat_jornada": r.get("SimatJornada", ""), "simat_motivo": r.get("SimatMotivo", ""),
                        "simat_nota": r.get("SimatNota", "")})
        vaciar("clima_roster"); insertar("clima_roster", out)

    if quiere("clima_confirmaciones"):
        rows = leer(D / "confirmaciones.csv"); out = []
        for r in rows:
            out.append({"ts": ts_bogota(r["Timestamp"]), "dane": r["DANE"], "colegio": r["Colegio"], "rowid": r["RowID"],
                        "nombre": r["Nombre"], "clase_original": r["ClaseOriginal"], "jornada_original": r["JornadaOriginal"],
                        "continua": r["Continua"], "curso_actual": r["CursoActual"], "jornada_actual": r["JornadaActual"],
                        "motivo": r["Motivo"], "colegio_destino": r["ColegioDestino"], "nota": r["Nota"],
                        "contacto": r["Contacto"], "telefono": r["Telefono"], "estado": r["Estado"],
                        "fuente": r["Fuente"], "coincide_simat": r["CoincideSimat"]})
        vaciar("clima_confirmaciones"); insertar("clima_confirmaciones", out)

    if quiere("clima_confirmaciones_log"):
        rows = leer(D / "confirmaciones_log.csv"); out = []
        for r in rows:
            v = list(r.values())
            out.append({"ts": ts_bogota(r["Timestamp"]), "dane": r["DANE"], "colegio": r["Colegio"], "contacto": r["Contacto"],
                        "telefono": r["Telefono"], "estado": r["Estado"], "n_estudiantes": int(r["N_estudiantes"] or 0),
                        "n_siguen": int(r["N_siguen"] or 0), "n_salieron": int(r["N_salieron"] or 0),
                        "n_sin_tocar": int((v[9] if len(v) > 9 else "") or 0), "n_distintos": int((v[10] if len(v) > 10 else "") or 0)})
        vaciar("clima_confirmaciones_log"); insertar("clima_confirmaciones_log", out)
    print("listo")

if __name__ == "__main__":
    main()
