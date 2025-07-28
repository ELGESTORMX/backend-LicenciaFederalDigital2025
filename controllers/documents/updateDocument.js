import Documents from '../../models/Documents.js';

export default async function updateDocument(req, res) {
  try {
    const { idLicense } = req.params;
    const updateFields = req.body;
    let updated = await Documents.findOneAndUpdate(
      { idLicense },
      updateFields,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Licencia no encontrada.' });
    }
    // Populate createdBy para que el frontend reciba el usuario completo
    updated = await updated.populate('createdBy', 'username name');
    res.status(200).json({ success: true, message: 'Licencia actualizada correctamente.', document: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar la licencia.' });
  }
}
