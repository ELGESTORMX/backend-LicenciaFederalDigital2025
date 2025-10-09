import Documents from '../../models/Documents.js';
import cache from '../../utils/cache.js';
import mongoose from 'mongoose';

// Controlador para obtener SOLO las licencias del usuario autenticado (rol 3 y 4)
export async function getMyLicenses(req, res) {
  try {
    // Parámetros de paginación y búsqueda
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Filtro por N° de licencia y por usuario creador
    let filter = { createdBy: new mongoose.Types.ObjectId(req.user._id) };
    console.log('Filtro usado:', filter, 'Usuario autenticado:', req.user);
    if (search) {
      filter.$or = [
        { idLicense: { $regex: search, $options: 'i' } },
        { categoriasTexto: { $regex: search, $options: 'i' } },
        { curp: { $regex: search, $options: 'i' } }
      ];
    }

    const cacheKey = `mine:${req.user._id}:${page}:${limit}:${search}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success:true, fromCache:true, ...cached });
    }
    const total = await Documents.countDocuments(filter);
    const documents = await Documents.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'username');
    const payload = { documents, page, limit, total, totalPages: Math.ceil(total / limit) };
    cache.set(cacheKey, payload, 15000); // 15s TTL
    res.status(200).json({ success:true, ...payload });
    console.log(documents)
  } catch (error) {
    console.error('Error al obtener mis licencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
