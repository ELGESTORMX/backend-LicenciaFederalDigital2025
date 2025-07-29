
import { Router } from 'express';
import createDocument from '../controllers/documents/createDocument.js';
import { getAllDocuments } from '../controllers/documents/getAllDocuments.js';
import { getMyLicenses } from '../controllers/documents/getMyLicenses.js';
import getDocumentById from '../controllers/documents/getDocumentById.js';
import deleteDocument from '../controllers/documents/deleteDocument.js';
import updateDocument from '../controllers/documents/updateDocument.js';
import passport from '../middlewares/passport.js';
import checkActive from '../middlewares/checkActive.js';

const documents_router = Router();

// Crear documento (licencia) - requiere token válido, cualquier usuario
// POST /api/documents
// El usuario debe estar autenticado

documents_router.post('/', passport.authenticate('jwt', { session: false }), checkActive, createDocument);

// Ruta para obtener solo las licencias del usuario autenticado (rol 3 y 4)
documents_router.get('/myLicenses', passport.authenticate('jwt', { session: false }), checkActive, getMyLicenses);
// Ruta para obtener todas las licencias (solo para rol 1)
documents_router.get('/', passport.authenticate('jwt', { session: false }), checkActive, getAllDocuments);
// Obtener una licencia específica por idLicense

documents_router.get('/:idLicense', passport.authenticate('jwt', { session: false }), checkActive, getDocumentById);
// Eliminar una licencia por idLicense

documents_router.delete('/:idLicense', passport.authenticate('jwt', { session: false }), checkActive, deleteDocument);
// Actualizar una licencia por idLicense
documents_router.put('/:idLicense', passport.authenticate('jwt', { session: false }), checkActive, updateDocument);

export default documents_router;
