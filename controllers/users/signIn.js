import Users from '../../models/Users.js';
import bcrypt from 'bcrypt'; // Para verificar passwords hasheadas

export default async(req, res, next) => {
    try {
        // Validar campos requeridos
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username y password son requeridos'
            });
        }

        // Buscar usuario (sin actualizar nada aún)
        const user = await Users.findOne({ username });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }


        // Verificar si el usuario está bloqueado
        if (user.active === false) {
            return res.status(403).json({
                success: false,
                message: 'Usuario bloqueado. Contacta al administrador.'
            });
        }

        // Verificar password hasheada
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        // Actualizar sessionCount solo después de validar credenciales
        const updatedUser = await Users.findByIdAndUpdate(
            user._id,
            { $inc: { sessionCount: 1 } }, // Incrementar contador de sesiones
            { new: true }
        );

        // Pasar el usuario completo para el token
        req.user = updatedUser;
        
        // Llamar al siguiente middleware (generateToken)
        return next();

    } catch (error) {
        console.error('Error en signIn:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};