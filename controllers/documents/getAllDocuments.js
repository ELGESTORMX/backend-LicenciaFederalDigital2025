import Documents from '../../models/Documents.js';

// Controlador para obtener documentos paginados y filtrados por varios campos
export async function getAllDocuments(req, res) {
    // LOG de depuración para ver el filtro y el usuario
    console.log('Consulta de licencias:', {
      usuario: req.user,
      headers: req.headers,
      myLicenses: req.query.myLicenses,
      userId: req.query.userId
    });
  try {
    // Parámetros de paginación y búsqueda
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Filtro por N° de licencia y por usuario creador si aplica
    let filter = {};
    if (search) {
      filter.idLicense = { $regex: search, $options: 'i' };
    }
    // Solo filtrar por usuario para rol 3 y 4, rol 1 ve todo
    // Solo el rol 1 (SuperAdmin) ve todas las licencias. No filtrar por usuario aquí.
    // Log del filtro final
    console.log('Filtro aplicado:', filter);

    // Contar total de documentos (para paginación)
    const total = await Documents.countDocuments(filter);

    // Obtener documentos paginados
    const documents = await Documents.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username name');
    // Log de los documentos encontrados
    console.log('Documentos encontrados:', documents);

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
