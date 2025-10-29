
import { Router } from 'express';
import createDocument from '../controllers/documents/createDocument.js';
import { getAllDocuments } from '../controllers/documents/getAllDocuments.js';
import { getMyLicenses } from '../controllers/documents/getMyLicenses.js';
import getDocumentById from '../controllers/documents/getDocumentById.js';
import publicValidate from '../controllers/documents/publicValidate.js';
import downloadPdfById from '../controllers/documents/downloadPdfById.js';
import deleteDocument from '../controllers/documents/deleteDocument.js';
import updateDocument from '../controllers/documents/updateDocument.js';
import updateMedicalFlags from '../controllers/documents/updateMedicalFlags.js';
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

// Quick ping para diagnóstico de routing en producción
documents_router.get('/validate/ping', (req, res) => res.json({ ok: true, route: '/api/documents/validate/ping' }));

// Validación pública de licencia (sin token) por CURP y número de expediente médico
documents_router.get('/validate', publicValidate);

// Descarga pública de PDF de licencia por idLicense (sin token)
documents_router.get('/:idLicense/pdf', downloadPdfById);

// Consulta pública de una licencia específica por idLicense (sin token)
documents_router.get('/:idLicense', getDocumentById);
// Eliminar una licencia por idLicense

documents_router.delete('/:idLicense', passport.authenticate('jwt', { session: false }), checkActive, deleteDocument);
// Actualizar una licencia por idLicense
documents_router.put('/:idLicense', passport.authenticate('jwt', { session: false }), checkActive, updateDocument);
// Ruta rápida para actualizar sólo las banderas médicas
documents_router.patch('/:idLicense/flags', passport.authenticate('jwt', { session: false }), checkActive, updateMedicalFlags);

export default documents_router;
