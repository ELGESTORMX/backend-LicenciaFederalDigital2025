import { Router } from 'express';
import createDocument from '../controllers/documents/createDocument.js';
import { getAllDocuments } from '../controllers/documents/getAllDocuments.js';
import getDocumentById from '../controllers/documents/getDocumentById.js';
import passport from '../middlewares/passport.js';

const documents_router = Router();

// Crear documento (licencia) - requiere token válido, cualquier usuario
// POST /api/documents
// El usuario debe estar autenticado

documents_router.post('/', passport.authenticate('jwt', { session: false }), createDocument);

documents_router.get('/', passport.authenticate('jwt', { session: false }), getAllDocuments);
// Obtener una licencia específica por idLicense
documents_router.get('/:idLicense', passport.authenticate('jwt', { session: false }), getDocumentById);

export default documents_router;
