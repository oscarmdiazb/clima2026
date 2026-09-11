// Backend del aplicativo (Supabase, proyecto «oscar-apps»). Reemplaza al Apps Script.
// Este archivo es PÚBLICO: la anon key solo permite llamar a api_get / api_post,
// las tablas no se pueden leer directo (RLS sin políticas). La clave privada de
// contactos NO va aquí.
//
// Los scripts de Python (consola.py, construir_campana_confirmacion.py,
// publicar_equipo.py) leen estas dos constantes de este mismo archivo, así que
// solo existe un lugar donde cambiarlas.
const SUPABASE_URL = "https://sxfbzcnsbcvitaenwpct.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZmJ6Y25zYmN2aXRhZW53cGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTUzODksImV4cCI6MjEwNDczMTM4OX0.AwTQ4lNfFQXEOWUcgOcyI3QUxsYP7-GFo7zuPkHuOJM";

// Misma API que tenía el Apps Script:
//   GET  API_GET  + "?tipo=…&key=…&code=…&dane=…"  → JSON
//   POST API_POST con {"body": <JSON del cuerpo>}     → JSON  (PostgREST: un parámetro jsonb llamado body)
const API_GET  = SUPABASE_URL + "/rest/v1/rpc/api_get";
const API_POST = SUPABASE_URL + "/rest/v1/rpc/api_post";
const API_HEADERS = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": "Bearer " + SUPABASE_ANON_KEY,
  "Content-Type": "application/json"
};
async function apiGet(query) {
  const res = await fetch(API_GET + (query ? "?" + query : ""), { method: "GET", headers: API_HEADERS });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return await res.json();
}
async function apiPost(body) {
  const res = await fetch(API_POST, { method: "POST", headers: API_HEADERS, body: JSON.stringify({ body: body }) });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return await res.json();
}
