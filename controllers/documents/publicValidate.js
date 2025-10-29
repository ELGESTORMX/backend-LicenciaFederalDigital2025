import Documents from '../../models/Documents.js';

// GET /api/documents/validate?curp=XXXX&nomedico=YYYY
// Endpoint público que replica la "validación" de ventanilla: busca por CURP y número de expediente/folio médico
export default async function publicValidate(req, res) {
  try {
    const { curp = '', nomedico = '' } = req.query;
    if (!curp || !nomedico) {
      return res.status(400).json({ success: false, message: 'Parámetros requeridos: curp y nomedico' });
    }

    const curpNorm = String(curp).trim().toUpperCase();
    const numMedico = String(nomedico).trim();

    // Coincidir por CURP y por cualquiera de los campos médicos disponibles
    const filter = {
      curp: curpNorm,
      $or: [
        { folioMedico: numMedico },
        { numeroAptitudPsicofisica: numMedico },
      ],
    };

    const docs = await Documents.find(filter)
      .sort({ createdAt: -1 })
      .lean({ defaults: true });

    const items = docs.map(d => ({
      idLicense: d.idLicense,
      descripcion: 'Renovacion de Licencia Federal de Conductor',
      estado: 'LICENCIA FEDERAL DIGITAL DE CONDUCTOR',
      name: d.name,
      createdAt: d.createdAt,
    }));

    res.json({ success: true, total: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error en la validación pública', error: err.message });
  }
}
