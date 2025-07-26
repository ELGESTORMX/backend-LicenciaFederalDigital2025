import Users from '../../models/Users.js';

// El middleware de passport y isSuperAdmin debe usarse en la ruta
export default async (req, res, next) => {
    try {
        // Extraer datos del body
        const { username, password, role: roleString, creationLimit } = req.body;
        const role = Number(req.body.role);
        console.log(req.body);
        // Validar campos requeridos
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña requeridos'
            });
        }

        // Validar que el role sea válido
        const validRoles = [1, 2, 3, 4]; // superAdmin, Moderador, cliente, revendedor
        
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'No autorizado.'
            });
        }

        // Crear nuevo usuario
        const newUser = new Users({
            username,
            password, // Se hasheará automáticamente por el middleware
            role,
            sessionCount: 0,
            creationLimit,
            createdBy: req.user._id // ID del usuario que lo está creando
        });

        // Guardar usuario (ejecutará middlewares de hash)
        const savedUser = await newUser.save();

        // Respuesta exitosa (sin mostrar la password)
        const userResponse = {
            _id: savedUser._id,
            username: savedUser.username,
            role: savedUser.role,
            sessionCount: savedUser.sessionCount,
            creationLimit: savedUser.creationLimit,
            createdBy: savedUser.createdBy,
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt
           ,active: savedUser.active
        };

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: userResponse
        });

    } catch (error) {
        console.error('Error registrando usuario:', error);
        
        // Manejar error de username duplicado (MongoDB unique constraint)
        if (error.code === 11000 && error.keyPattern?.username) {
            return res.status(409).json({
                success: false,
                message: 'El usuario ya existe'
            });
        }
        
        // Manejar errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        // Error genérico
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
