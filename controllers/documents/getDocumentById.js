import Documents from '../../models/Documents.js';

// GET /api/documents/:idLicense
export default async function getDocumentById(req, res) {
  try {
    const { idLicense } = req.params;
    const document = await Documents.findOne({ idLicense });
    if (!document) {
      return res.status(404).json({ message: 'No se encontró la licencia.' });
    }
    res.json({ document });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la licencia.', error });
  }
}
