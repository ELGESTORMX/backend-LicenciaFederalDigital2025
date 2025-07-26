import jwt from 'jsonwebtoken'

export default (req,res,next)=> {
    let token = jwt.sign(
        { 
            username: req.user.username,        // Username del usuario autenticado
            _id: req.user._id,                 // ID del usuario
            role: req.user.role                // Role para permisos (este sí es estático)
            // creationLimit removido - se maneja dinámicamente desde DB
        },
        process.env.SECRET_KEY,         //llave necesaria para tokenizar/destokenizar (crear una variable de entorno)
        { expiresIn:'100y' }        //tiempo de vencimiento del token en segundos
    )
    req.token = token                   //agrego al objeto de requerimientos la propeidad token con el token
    return next()
}