import Users from '../models/Users.js'  // Cambiado de Admins a Users
import bcrypt from 'bcrypt'

export default async(req, res, next)=> {
    try {
        let one = await Users.findOne({ username: req.body.username })  // Cambiado campo
        
        if (!one) {
            return res.status(401).json({
                success: false, 
                message: 'Credenciales incorrectas'
            })
        }
        
        let mongo_user_password = one.password  // Cambiado campo
        let form_password = req.body.password   // Cambiado campo
        let compare = bcrypt.compareSync(form_password, mongo_user_password)
        
        if (compare) {
            req.user = one;  // Pasar el usuario al siguiente middleware
            return next()
        }
        
        return res.status(401).json({
            success: false, 
            message: 'Credenciales incorrectas'
        })
    } catch (error) {
        console.error('Error en passwordIsOk:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        })
    }
}