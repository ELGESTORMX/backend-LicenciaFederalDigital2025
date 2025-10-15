// Conversión consistente de múltiples representaciones a boolean true/false
export default function parseBool(v) {
  if (v === true || v === 1 || v === '1') return true;
  if (v === false || v === 0 || v === '0' || v === null) return false;
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase();
    if (['si','sí','yes','true','on','1'].includes(t)) return true;
    if (['no','false','off','0'].includes(t)) return false;
  }
  return !!v;
}
