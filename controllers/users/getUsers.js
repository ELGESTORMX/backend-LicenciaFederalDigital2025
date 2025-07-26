import Users from '../../models/Users.js';

// Controlador para obtener usuarios paginados y filtrados por username
export default async function getUsers(req, res) {
  try {
    // Parámetros de paginación y búsqueda
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Filtro de búsqueda por username (case-insensitive)
    const filter = search
      ? { username: { $regex: search, $options: 'i' } }
      : {};

    // Contar total de usuarios (para paginación)
    const total = await Users.countDocuments(filter);

    // Obtener usuarios paginados (sin password)
    const users = await Users.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      users,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
