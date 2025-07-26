import Users from "../../models/Users.js";  // Cambiado de Admins a Users

export default async (req, res, next) => {
    try {
        // Disminuir sessionCount en 1, pero nunca menos de 0
        if (req.user && req.user._id) {
            await Users.findByIdAndUpdate(
                req.user._id,
                { $inc: { sessionCount: -1 } },
                { new: true }
            );
        }
        return res.status(200).json({
            success: true,
            message: 'Logout exitoso',
            user: req.user?.username || 'Usuario'
        });
    } catch (error) {
        console.error('Error en signOut:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}