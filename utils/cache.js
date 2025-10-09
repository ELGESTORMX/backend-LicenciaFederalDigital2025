// Cache en memoria simple con TTL
// Estructura: key -> { value, expires }
const store = new Map();

function set(key, value, ttlMs = 30000) { // default 30s
  const expires = Date.now() + ttlMs;
  store.set(key, { value, expires });
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function del(key) {
  store.delete(key);
}

function flush() {
  store.clear();
}

// Invalidar todas las páginas de listados cuando cambia data
function invalidateDocuments() {
  // Estrategia simple: limpiar todo
  flush();
}

export default { set, get, del, flush, invalidateDocuments };
