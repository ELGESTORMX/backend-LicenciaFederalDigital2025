import bcrypt from 'bcrypt'

export default (req, res, next) => {
    req.body.contraseña = bcrypt.hashSync(req.body.contraseña, 10)
    return next()
}