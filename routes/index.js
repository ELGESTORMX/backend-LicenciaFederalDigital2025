import express from 'express'
// touch: cambio mínimo para redeploy (routes/index.js) 2025-10-14
import users_router from './users.js';
import documents_router from './documents.js';
import Documents from '../models/Documents.js';
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


router.use('/users', users_router)
router.use('/documents', documents_router)
export default router