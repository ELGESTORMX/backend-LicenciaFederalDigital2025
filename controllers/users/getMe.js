import Users from '../../models/Users.js';

// Devuelve el usuario actual si está activo
export default async function getMe(req, res) {
  try {
    console.log('Petición /users/me:', {
      reqUser: req.user,
      headers: req.headers
    });
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const user = await Users.findById(userId);
    if (!user || user.active === false) {
      return res.status(403).json({ success: false, message: 'Usuario bloqueado' });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Error en /users/me:', err);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
}
