import Users from '../../models/Users.js';
import bcrypt from 'bcrypt';

// PUT /api/users/:id
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  try {
    // Buscar el usuario
    const user = await Users.findById(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Editar username si se envía
    if (username && username !== user.username) {
      // Verificar que no exista otro usuario con ese username
      const exists = await Users.findOne({ username });
      if (exists && exists._id.toString() !== id) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
      user.username = username;
    }

    // Editar password si se envía
    if (password) {
      user.password = password;
    }

    // Editar rol si se envía y es válido
    if (role && [1,2,3,4].includes(Number(role))) {
      user.role = Number(role);
    }

    await user.save();
    res.json({ message: 'Usuario actualizado correctamente', user });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario', details: error.message });
  }
};
