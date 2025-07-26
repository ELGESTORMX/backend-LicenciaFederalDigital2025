export default (req, res) => {
    // Este controlador se ejecuta después de signIn y generateToken
    return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        response: {
            user: {
                _id: req.user._id,
                username: req.user.username
                // role, sessionCount, creationLimit NO se envían por seguridad
                // Están en el JWT token para verificación server-side
            },
            token: req.token // Token contiene: username, _id, role, creationLimit
        }
    });
};
