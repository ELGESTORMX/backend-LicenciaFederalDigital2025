import Users from '../../models/Users.js';

// Controlador para transferir creationLimit del revendedor a un usuario propio
export default async function addPermissions(req, res) {
  try {
    console.log('---[addPermissions]---');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    // Buscar el documento Mongoose del revendedor
    const revendedorId = req.user._id;
    const revendedor = await Users.findById(revendedorId);
    if (!revendedor || revendedor.role !== 4) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }
    const { userId, cantidad } = req.body;
    const cantidadNum = Number(cantidad);
    if (!userId || isNaN(cantidadNum) || cantidadNum <= 0) {
      console.log('Datos inválidos:', userId, cantidadNum);
      return res.status(400).json({ success: false, message: 'Datos inválidos' });
    }
    if (revendedor.creationLimit < cantidadNum) {
      console.log('No tienes suficientes permisos disponibles:', revendedor.creationLimit, cantidadNum);
      return res.status(400).json({ success: false, message: 'No tienes suficientes permisos disponibles' });
    }
    // Buscar usuario destino y validar que fue creado por el revendedor
    const usuario = await Users.findOne({ _id: userId, createdBy: revendedor._id });
    if (!usuario) {
      console.log('Usuario no encontrado o no autorizado:', userId, revendedor._id);
      return res.status(404).json({ success: false, message: 'Usuario no encontrado o no autorizado' });
    }
    // Transferir permisos
    usuario.creationLimit += cantidadNum;
    revendedor.creationLimit -= cantidadNum;
    console.log('Transferencia de permisos:', {
      usuario: usuario.username,
      usuario_creationLimit: usuario.creationLimit,
      revendedor: revendedor.username,
      revendedor_creationLimit: revendedor.creationLimit,
      cantidadNum
    });
    await usuario.save();
    await revendedor.save();
    res.status(200).json({
      success: true,
      message: `Se agregaron ${cantidadNum} permisos a ${usuario.username}`,
      usuario: {
        _id: usuario._id,
        username: usuario.username,
        creationLimit: usuario.creationLimit
      },
      revendedor: {
        _id: revendedor._id,
        username: revendedor.username,
        creationLimit: revendedor.creationLimit
      }
    });
  } catch (error) {
    console.error('Error en addPermissions:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}
