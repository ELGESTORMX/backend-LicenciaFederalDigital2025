import Documents from '../../models/Documents.js';
import cache from '../../utils/cache.js';
import parseBool from '../../utils/parseBool.js';

// PATCH /api/documents/:idLicense/flags  { lentes, diabetes, hipertension }
export default async function updateMedicalFlags(req, res) {
  try {
    const { idLicense } = req.params;
    const flags = {};
    let touched = false;
    ['lentes','diabetes','hipertension'].forEach(k => {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) {
        flags[k] = parseBool(req.body[k]);
        touched = true;
      }
    });
    if (!touched) {
      return res.status(400).json({ success:false, message:'Enviar al menos uno de: lentes, diabetes, hipertension' });
    }
    let updated = await Documents.findOneAndUpdate(
      { idLicense },
      { $set: flags },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success:false, message:'Licencia no encontrada' });
    updated = await updated.populate('createdBy', 'username name');
    cache.invalidateDocuments();
    res.json({ success:true, message:'Flags médicos actualizados', document: updated });
  } catch (e) {
    res.status(500).json({ success:false, message:'Error actualizando flags', error: e.message });
  }
}
