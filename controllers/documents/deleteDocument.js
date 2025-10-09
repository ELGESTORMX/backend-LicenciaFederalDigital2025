import Documents from '../../models/Documents.js';
import cache from '../../utils/cache.js';

export default async function deleteDocument(req, res) {
  try {
    const { idLicense } = req.params;
    const deleted = await Documents.findOneAndDelete({ idLicense });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Licencia no encontrada.' });
    }
    res.status(200).json({ success: true, message: 'Licencia eliminada correctamente.' });
    cache.invalidateDocuments();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar la licencia.' });
  }
}
