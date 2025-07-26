import Users from '../../models/Users.js';

// Controlador para bloquear usuario y poner el token en la blacklist
export default async function blockUser(req, res) {
    try {
        const { id } = req.params; // id del usuario a bloquear
        // Bloquear usuario
        const user = await Users.findByIdAndUpdate(id, { active: false }, { new: true });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        return res.status(200).json({ success: true, message: 'Usuario bloqueado', user });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error bloqueando usuario' });
    }
}
