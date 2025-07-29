import Users from '../../models/Users.js';

// Controlador para que el rol 4 vea solo los usuarios que creó
export default async function revendedorGetMyUsers(req, res) {
  try {
    const revendedor = req.user;
    if (revendedor.role !== 4) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    // Paginación y búsqueda
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;
    const filter = {
      createdBy: revendedor._id,
      ...(search ? { username: { $regex: search, $options: 'i' } } : {})
    };
    const total = await Users.countDocuments(filter);
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
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
