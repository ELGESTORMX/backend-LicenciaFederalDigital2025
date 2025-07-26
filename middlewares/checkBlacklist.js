import BlacklistedToken from '../models/BlacklistedToken.js';

export default async function checkBlacklist(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token requerido' });
    const blacklisted = await BlacklistedToken.findOne({ token });
    if (blacklisted) {
        return res.status(401).json({ success: false, message: 'Token inválido (blacklist)' });
    }
    next();
}
