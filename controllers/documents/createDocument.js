import Documents from '../../models/Documents.js';
import Users from '../../models/Users.js';

// Controlador para crear un nuevo documento (licencia)
export default async function createDocument(req, res) {
  try {
    const {
      name,
      photo,
      signature,
      licenseType,
      curp,
      adress,
      idLicense,
      expeditionDate,
      expirationDate,
      antiquityDate,
      bloodType,
      donor,
      restrictions
    } = req.body;

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
    const doc = new Documents({
      name: cleanStr(name),
      photo: cleanStr(photo),
      signature: cleanStr(signature),
      licenseType: cleanStr(licenseType),
      curp: cleanStr(curp),
      adress: cleanStr(adress),
      idLicense: cleanStr(idLicense),
      expeditionDate: cleanStr(expeditionDate),
      expirationDate: cleanStr(expirationDate),
      antiquityDate: cleanStr(antiquityDate),
      bloodType: cleanStr(bloodType),
      donor,
      restrictions: cleanStr(restrictions),
      createdBy: user._id
    });

    await doc.save();

    // Si no es superAdmin, descontar creationLimit SOLO si se guardó la licencia
    if (user.role !== 1 && req.dbUser) {
      req.dbUser.creationLimit -= 1;
      await req.dbUser.save();
    }

    res.status(201).json({ success: true, document: doc });
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
