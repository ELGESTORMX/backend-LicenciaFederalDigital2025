import { Router } from "express";
const users_router = Router();

// Obtener usuario actual (para saber creationLimit y role)
users_router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado' });
  res.json({
    _id: req.user._id,
    username: req.user.username,
    role: req.user.role,
    creationLimit: req.user.creationLimit
  });
});
import register from "../controllers/users/register.js";
import Hash from '../middlewares/createHash.js'
import signIn from "../controllers/users/signIn.js";
import passwordIsOk from "../middlewares/passwordIsOk.js";
import generateToken from '../middlewares/generateToken.js'
import signInResponse from "../controllers/users/signInResponse.js";
import signOut from '../controllers/users/signOut.js'
import passport from '../middlewares/passport.js'
import isSuperAdmin from '../middlewares/isSuperAdmin.js'
import updateCreationLimit from '../controllers/users/updateCreationLimit.js'
import getUsers from '../controllers/users/getUsers.js'
import checkActive from '../middlewares/checkActive.js'
import checkBlacklist from '../middlewares/checkBlacklist.js'
import unblockUser from '../controllers/users/unblockUser.js'
import blockUser from '../controllers/users/blockUser.js'
import deleteUser from '../controllers/users/deleteUser.js'
import { updateUser } from '../controllers/users/updateUser.js';

// Obtener usuarios paginados (solo SuperAdmin)
users_router.get('/', passport.authenticate('jwt', { session: false }), checkBlacklist, checkActive, isSuperAdmin, getUsers);

// Crear usuario (requiere autenticación y ser superAdmin)
users_router.post('/create', passport.authenticate('jwt', { session: false }), checkBlacklist, checkActive, isSuperAdmin, register)

// Login (sin autenticación previa)
users_router.post('/login', passwordIsOk, signIn, generateToken, signInResponse)


// Actualizar creationLimit (solo SuperAdmin)
users_router.put('/creation-limit/:id', passport.authenticate('jwt', { session: false }), checkBlacklist, checkActive, isSuperAdmin, updateCreationLimit)

// Logout (requiere token para saber quién hace logout)
users_router.post('/logout', passport.authenticate('jwt', { session: false }), checkBlacklist, checkActive, signOut)

// Bloquear usuario y poner token en blacklist (solo SuperAdmin)
users_router.put('/block/:id', passport.authenticate('jwt', { session: false }), checkBlacklist, checkActive, isSuperAdmin, blockUser)

// Desbloquear usuario (solo SuperAdmin)
users_router.put('/unblock/:id', passport.authenticate('jwt', { session: false }), checkBlacklist, checkActive, isSuperAdmin, unblockUser)

// Eliminar usuario (solo SuperAdmin)
users_router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), checkBlacklist, checkActive, isSuperAdmin, deleteUser)

// Editar usuario (solo SuperAdmin)
users_router.put('/:id', passport.authenticate('jwt', { session: false }), checkBlacklist, checkActive, isSuperAdmin, updateUser)

export default users_router