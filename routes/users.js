import { Router } from "express";
import passport from '../middlewares/passport.js';
import checkActive from '../middlewares/checkActive.js';
import checkBlacklist from '../middlewares/checkBlacklist.js';
import isSuperAdmin from '../middlewares/isSuperAdmin.js';
import Hash from '../middlewares/createHash.js';
import passwordIsOk from "../middlewares/passwordIsOk.js";
import generateToken from '../middlewares/generateToken.js';

import revendedorCreateUser from '../controllers/users/revendedorCreateUser.js';
import revendedorGetMyUsers from '../controllers/users/revendedorGetMyUsers.js';
import addPermissions from '../controllers/users/addPermissions.js';
import register from "../controllers/users/register.js";
import signIn from "../controllers/users/signIn.js";
import signInResponse from "../controllers/users/signInResponse.js";
import signOut from '../controllers/users/signOut.js';
import getMe from '../controllers/users/getMe.js';
import updateCreationLimit from '../controllers/users/updateCreationLimit.js';
import getUsers from '../controllers/users/getUsers.js';
import unblockUser from '../controllers/users/unblockUser.js';
import blockUser from '../controllers/users/blockUser.js';
import deleteUser from '../controllers/users/deleteUser.js';
import { updateUser } from '../controllers/users/updateUser.js';

const users_router = Router();

// Middleware para permitir solo rol 4
function isRevendedor(req, res, next) {
  if (req.user?.role === 4) return next();
  return res.status(403).json({ success: false, message: 'Solo revendedor autorizado' });
}

// Crear usuario propio (solo rol 4)
users_router.post('/create-by-revendedor', passport.authenticate('jwt', { session: false }), checkBlacklist, checkActive, isRevendedor, revendedorCreateUser);

// Ver solo los usuarios creados por el revendedor (solo rol 4)
users_router.get('/my-users', passport.authenticate('jwt', { session: false }), checkBlacklist, checkActive, isRevendedor, revendedorGetMyUsers);

// Agregar permisos a usuario propio (solo rol 4)
users_router.post('/add-permissions', passport.authenticate('jwt', { session: false }), checkBlacklist, checkActive, isRevendedor, addPermissions);

// Endpoint para saber si el usuario sigue activo
users_router.get('/me', passport.authenticate('jwt', { session: false }), getMe);

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