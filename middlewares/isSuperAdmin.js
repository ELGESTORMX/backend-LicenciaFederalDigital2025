// Middleware para verificar si el usuario autenticado es SuperAdmin (rol 1)
export default function isSuperAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Token requerido. Debes estar autenticado'
        });
    }
    if (req.user.role !== 1) {
        return res.status(403).json({
            success: false,
            message: 'No autorizado. Se requiere rol SuperAdmin'
        });
    }
    next();
}
