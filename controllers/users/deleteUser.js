import Users from '../../models/Users.js';

// Controlador para eliminar usuario
export default async function deleteUser(req, res) {
    try {
        const { id } = req.params; // id del usuario a eliminar
        const user = await Users.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        return res.status(200).json({ success: true, message: 'Usuario eliminado', user });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error eliminando usuario' });
    }
}
