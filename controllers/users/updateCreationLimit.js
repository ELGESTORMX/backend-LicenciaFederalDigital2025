import Users from '../../models/Users.js';

// Controlador para actualizar el creationLimit de un usuario (solo SuperAdmin)
export default async function updateCreationLimit(req, res) {
    try {
        const { id } = req.params;
        const { creationLimit } = req.body;

        // Validar que el nuevo valor sea un número válido y no negativo
        if (typeof creationLimit !== 'number' || creationLimit < 0) {
            return res.status(400).json({
                success: false,
                message: 'El valor de creationLimit debe ser un número mayor o igual a 0.'
            });
        }

        // Buscar y actualizar el usuario
        const updatedUser = await Users.findByIdAndUpdate(
            id,
            { creationLimit },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado.'
            });
        }

        // Responder con el usuario actualizado (sin password)
        return res.status(200).json({
            success: true,
            message: 'La cantidad de folios se ha actualizado correctamente.',
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role,
                creationLimit: updatedUser.creationLimit
            }
        });
    } catch (error) {
        console.error('Error actualizando los folios del usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor.'
        });
    }
}
