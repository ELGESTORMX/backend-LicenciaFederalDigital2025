import Documents from '../../models/Documents.js';
import Users from '../../models/Users.js';
import cache from '../../utils/cache.js';

// Controlador para crear un nuevo documento (licencia)
export default async function createDocument(req, res) {
  try {
    const {
      name,
      photo,
      signature,
      curp,
      adress,
      idLicense,
      expeditionDate,
  expeditionTime,
      expirationDate,
      antiquityDate,
      bloodType,
  donor,
  lentes,
  diabetes,
  hipertension,
      restrictions,
      // Nuevos campos federales (opcionales)
      categoriasFederales,
      rfc,
      numeroControl,
      folioMedico,
      vigenciaMedica,
      tipoServicio,
      numeroEmpleado,
      enteEmisor,
      estadoEmision,
      observaciones,
      claseVehicular,
      numeroAptitudPsicofisica
    } = req.body;

  const scope = 'FEDERAL';

    // Obtener usuario autenticado (passport agrega req.user)
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'No autenticado.' });
    }

    // Si no es superAdmin (role !== 1), validar creationLimit (pero NO descontar aún)
    if (user.role !== 1) {
      // Buscar usuario actualizado por si creationLimit cambió
      const dbUser = await Users.findById(user._id);
      if (!dbUser) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      }
      if (dbUser.creationLimit <= 0) {
        return res.status(403).json({ success: false, message: 'No tienes permisos para crear más licencias.' });
      }
      // Guardar referencia para descontar después
      req.dbUser = dbUser;
    }

    // Si algún campo string requerido viene como "", lo convertimos a undefined para que falle la validación de mongoose
    function cleanStr(val) {
      return typeof val === 'string' && val.trim() === '' ? undefined : val;
    }
    // Validaciones específicas para licencias federales (alineadas a constancia)
    if (scope === 'FEDERAL') {
      const faltantes = [];
      if (!categoriasFederales || !Array.isArray(categoriasFederales) || categoriasFederales.length === 0) faltantes.push('categoriasFederales');
      if (!tipoServicio) faltantes.push('tipoServicio');
      if (!estadoEmision) faltantes.push('estadoEmision');
      if (!numeroAptitudPsicofisica) faltantes.push('numeroAptitudPsicofisica');
      // Clase vehicular puede depender de categoría; la dejamos opcional
      if (faltantes.length) {
        return res.status(400).json({ success:false, message: 'Faltan campos requeridos federales', fields: faltantes });
      }
    }

    const doc = new Documents({
      name: cleanStr(name),
      photo: cleanStr(photo),
      signature: cleanStr(signature),
      curp: cleanStr(curp),
      scope,
      adress: cleanStr(adress),
      idLicense: cleanStr(idLicense),
      expeditionDate: cleanStr(expeditionDate),
  expeditionTime: cleanStr(expeditionTime),
      expirationDate: cleanStr(expirationDate),
      antiquityDate: cleanStr(antiquityDate),
  bloodType: cleanStr(bloodType),
      donor,
  // Conversión robusta de banderas médicas (pueden venir como 'si', 'sí', 'true', 1, etc.)
  lentes: (function(v){
    if (v === true || v === 1) return true;
    if (v === false || v === 0) return false;
    if (typeof v === 'string') {
      const t = v.trim().toLowerCase();
      return t === 'true' || t === '1' || t === 'si' || t === 'sí' || t === 'yes' || t === 'on';
    }
    return !!v; // fallback
  })(lentes),
  diabetes: (function(v){
    if (v === true || v === 1) return true;
    if (v === false || v === 0) return false;
    if (typeof v === 'string') {
      const t = v.trim().toLowerCase();
      return t === 'true' || t === '1' || t === 'si' || t === 'sí' || t === 'yes' || t === 'on';
    }
    return !!v;
  })(diabetes),
  hipertension: (function(v){
    if (v === true || v === 1) return true;
    if (v === false || v === 0) return false;
    if (typeof v === 'string') {
      const t = v.trim().toLowerCase();
      return t === 'true' || t === '1' || t === 'si' || t === 'sí' || t === 'yes' || t === 'on';
    }
    return !!v;
  })(hipertension),
      restrictions: cleanStr(restrictions),
      categoriasFederales: Array.isArray(categoriasFederales) && categoriasFederales.length ? categoriasFederales : undefined,
  rfc: cleanStr(rfc),
  numeroControl: cleanStr(numeroControl),
  folioMedico: cleanStr(folioMedico),
  vigenciaMedica: cleanStr(vigenciaMedica),
      tipoServicio: cleanStr(tipoServicio),
      numeroEmpleado: cleanStr(numeroEmpleado),
      enteEmisor: cleanStr(enteEmisor),
      estadoEmision: cleanStr(estadoEmision),
      observaciones: cleanStr(observaciones),
      claseVehicular: cleanStr(claseVehicular),
      numeroAptitudPsicofisica: cleanStr(numeroAptitudPsicofisica),
      createdBy: String(user._id)
    });

    await doc.save();

    // Si no es superAdmin, descontar creationLimit SOLO si se guardó la licencia
    if (user.role !== 1 && req.dbUser) {
      req.dbUser.creationLimit -= 1;
      await req.dbUser.save();
    }

    res.status(201).json({ success: true, document: doc });
    cache.invalidateDocuments();
  } catch (error) {
    // Log detallado para depuración
    console.error('Error al crear documento:', error);
    // Error de duplicado de idLicense
    if (error.code === 11000 && error.keyPattern?.idLicense) {
      return res.status(400).json({ success: false, message: 'El número de licencia ya existe.' });
    }
    res.status(500).json({ success: false, message: 'Error al crear el documento', details: error.message, stack: error.stack });
  }
}

// touch: cambio mínimo para redeploy 2025-10-14
