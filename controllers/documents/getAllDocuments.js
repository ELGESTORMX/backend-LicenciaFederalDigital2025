import Documents from '../../models/Documents.js';

// Controlador para obtener documentos paginados y filtrados por varios campos
export async function getAllDocuments(req, res) {
  try {
    // Parámetros de paginación y búsqueda
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Filtro solo por N° de licencia (idLicense)
    const filter = search
      ? { idLicense: { $regex: search, $options: 'i' } }
      : {};

    // Contar total de documentos (para paginación)
    const total = await Documents.countDocuments(filter);

    // Obtener documentos paginados
    const documents = await Documents.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username name');

    res.status(200).json({
      success: true,
      documents,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
