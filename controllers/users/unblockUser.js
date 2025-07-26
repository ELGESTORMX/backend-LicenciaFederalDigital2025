import Users from '../../models/Users.js';

// Controlador para desbloquear usuario
export default async function unblockUser(req, res) {
    try {
        const { id } = req.params; // id del usuario a desbloquear
        const user = await Users.findByIdAndUpdate(id, { active: true }, { new: true });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        return res.status(200).json({ success: true, message: 'Usuario desbloqueado', user });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error desbloqueando usuario' });
    }
}
