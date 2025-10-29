import express from 'express'
import users_router from './users.js';
import documents_router from './documents.js';
import Documents from '../models/Documents.js';
import publicValidate from '../controllers/documents/publicValidate.js';
let router = express.Router()

router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

// Health/diagnóstico rápido para validar campos médicos y versión de despliegue
router.get('/health', async function(req, res) {
  try {
    // Tomar una muestra (el documento más reciente) para inspeccionar presencia de campos
    const sample = await Documents.findOne({}, { lentes:1, diabetes:1, hipertension:1 }).sort({ createdAt: -1 }).lean();
    const hasFields = sample && ['lentes','diabetes','hipertension'].every(k => Object.prototype.hasOwnProperty.call(sample, k));
    res.json({
      ok: true,
      deploymentTime: new Date().toISOString(),
      medicalFlagsPresent: hasFields,
      sampleMedicalFlags: sample || null
    });
  } catch (e) {
    res.status(500).json({ ok:false, error: e.message });
  }
});

// Alias público para validación (además de /api/documents/validate)
router.get('/validate', publicValidate);
router.get('/documents/validate', publicValidate);
// Alias en español por compatibilidad con frontends históricos
router.get('/documentos/validate', publicValidate);
// Ping de diagnóstico simple
router.get('/validate/ping', (req, res) => res.json({ ok: true, route: '/api/validate/ping' }));
router.get('/documents/validate/ping', (req, res) => res.json({ ok: true, route: '/api/documents/validate/ping' }));
router.get('/documentos/validate/ping', (req, res) => res.json({ ok: true, route: '/api/documentos/validate/ping' }));


router.use('/users', users_router)
router.use('/documents', documents_router)
export default router