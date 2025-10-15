import Documents from '../../models/Documents.js';
import cache from '../../utils/cache.js';
import parseBool from '../../utils/parseBool.js';

export default async function updateDocument(req, res) {
  try {
    const { idLicense } = req.params;
    const body = { ...req.body };
    const set = {};
    for (const [k,v] of Object.entries(body)) {
      if (['lentes','diabetes','hipertension'].includes(k)) {
        set[k] = parseBool(v);
      } else {
        set[k] = v;
      }
    }
    // Log de depuración
    console.log('[updateDocument] idLicense:', idLicense, 'SET keys:', Object.keys(set));
    // Log específico de banderas y campos principales para depurar
    console.log('[updateDocument] flags:', {
      lentes: set.lentes, diabetes: set.diabetes, hipertension: set.hipertension
    }, 'core:', {
      name: set.name, nacionalidad: set.nacionalidad, curp: set.curp,
      expeditionDate: set.expeditionDate, expeditionTime: set.expeditionTime,
      expirationDate: set.expirationDate, estadoEmision: set.estadoEmision,
      categoriasFederales: set.categoriasFederales
    });

    // Cargar documento y aplicar actualización de forma determinista (fiable en producción)
    const doc = await Documents.findOne({ idLicense });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Licencia no encontrada.' });
    }
    // Snapshot previo para calcular diferencias
    const prev = doc.toObject({ depopulate: true });
    // Si cambian categorías o nacionalidad, derivar tipoServicio automáticamente
    const needsTipoServicio = Object.prototype.hasOwnProperty.call(set, 'categoriasFederales') || Object.prototype.hasOwnProperty.call(set, 'nacionalidad');
    if (needsTipoServicio) {
      const cats = Array.isArray(set.categoriasFederales) ? set.categoriasFederales : (Array.isArray(doc.categoriasFederales) ? doc.categoriasFederales : []);
      const nacionalidad = (set.nacionalidad || doc.nacionalidad || 'MEXICANA').toString().toUpperCase();
      const MAP = {
        A: 'PASAJE Y TURISMO',
        B: 'CARGA',
        C: 'VEHÍCULOS DE DOS O TRES EJES RABÓN O TORTON',
        D: 'TRACTOCAMIÓN',
        E: 'DOBLE ARTICULADO',
        INT: 'INTERNACIONAL'
      };
      const letters = Array.from(new Set(cats.map(c => String(c).toUpperCase()))).sort();
      const parts = letters.map(l => MAP[l] ? `${l}) ${MAP[l]}` : null).filter(Boolean);
      if (nacionalidad === 'EXTRANJERO') parts.push('INT) ' + MAP.INT);
      set.tipoServicio = parts.join('\n');
    }
    // Asignar cambios y guardar (pre-save normaliza y valida)
    Object.assign(doc, set);
    // Calcular diferencias reales campo a campo (antes de guardar)
    const changedKeys = [];
    for (const [k, newVal] of Object.entries(set)) {
      const before = prev[k];
      // Comparación segura por JSON para arreglos/objetos simples
      const a = before === undefined ? undefined : JSON.parse(JSON.stringify(before));
      const b = newVal === undefined ? undefined : JSON.parse(JSON.stringify(newVal));
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        changedKeys.push(k);
      }
    }
    await doc.save();
    const updated = await doc.populate('createdBy', 'username name');
    cache.invalidateDocuments();
    // Devolver valores consistentes y diff
    res.status(200).json({
      success: true,
      message: changedKeys.length ? 'Licencia actualizada correctamente.' : 'Sin cambios aplicados (valores iguales tras normalización)'.trim(),
      matched: 1,
      modified: changedKeys.length > 0 ? 1 : 0,
      changedKeys,
      appliedSet: set,
      document: updated
    });
  } catch (error) {
    console.error('[updateDocument] Error:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la licencia.', details: error?.message });
  }
}
