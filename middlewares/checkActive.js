import Users from '../models/Users.js';

// Middleware para verificar si el usuario está activo
export default async function checkActive(req, res, next) {
    try {
        // Passport ya puso el usuario en req.user
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }
        // Buscar el usuario en la base de datos
        const user = await Users.findById(userId);
        if (!user || !user.active) {
            return res.status(403).json({ success: false, message: 'Usuario bloqueado o no existe' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error verificando usuario activo' });
    }
}
