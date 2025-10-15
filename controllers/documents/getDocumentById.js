import Documents from '../../models/Documents.js';

// GET /api/documents/:idLicense (público)
export default async function getDocumentById(req, res) {
  try {
    const { idLicense } = req.params;
    // lean con defaults si disponibles (Mongoose 7) y luego normalizamos
    let document = await Documents.findOne({ idLicense }).lean({ defaults: true });
    if (!document) return res.status(404).json({ message: 'No se encontró la licencia.' });
    // Normalización robusta: garantizar booleanos reales aunque en la DB haya strings 'true'/'false'
    ['lentes','diabetes','hipertension'].forEach(f => {
      const v = document[f];
      if (typeof v === 'undefined') {
        document[f] = false;
      } else if (typeof v === 'string') {
        const t = v.trim().toLowerCase();
        if (['true','1','si','sí','yes','on'].includes(t)) document[f] = true;
        else if (['false','0','no','off'].includes(t)) document[f] = false;
        else document[f] = !!v; // fallback
      } else {
        document[f] = !!v;
      }
    });
    res.json({ document });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la licencia.', error: error.message });
  }
}

