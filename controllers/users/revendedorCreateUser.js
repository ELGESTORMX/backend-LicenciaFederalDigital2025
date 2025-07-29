import Users from '../../models/Users.js';

// Controlador para que el rol 4 cree usuarios propios y asigne folios
export default async function revendedorCreateUser(req, res) {
  try {
    console.log('---[revendedorCreateUser]---');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    // Buscar el documento Mongoose del revendedor
    const revendedorId = req.user._id;
    const revendedor = await Users.findById(revendedorId);
    if (revendedor.role !== 4) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    const { username, password, creationLimit } = req.body;
    // Solo puede crear usuarios con rol 3
    const role = 3;
    if (!username || !password) {
      console.log('Faltan username o password');
      return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
    }
    // Validar creationLimit
    let limitToAssign = Number(creationLimit) || 0;
    if (limitToAssign < 0) limitToAssign = 0;
    // Si quiere asignar permisos, debe tener suficientes
    if (limitToAssign > 0) {
      if (revendedor.creationLimit < limitToAssign) {
        console.log('No tienes suficientes permisos para asignar:', revendedor.creationLimit, limitToAssign);
        return res.status(400).json({ success: false, message: 'No tienes suficientes permisos para asignar' });
      }
    }
    // Crear usuario
    const newUser = new Users({
      username,
      password,
      role,
      creationLimit: limitToAssign,
      createdBy: revendedor._id
    });
    const savedUser = await newUser.save();
    // Si asignó permisos, descontar del revendedor
    if (limitToAssign > 0) {
      revendedor.creationLimit -= limitToAssign;
      console.log('Descontando permisos al revendedor:', revendedor.creationLimit);
      await revendedor.save();
    }
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        role: savedUser.role,
        creationLimit: savedUser.creationLimit,
        createdBy: savedUser.createdBy,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
        active: savedUser.active
      }
    });
  } catch (error) {
    // Error de usuario duplicado
    console.error('Error en revendedorCreateUser:', error);
    if (error.code === 11000 && error.keyPattern?.username) {
      return res.status(409).json({ success: false, message: 'El usuario ya existe' });
    }
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
