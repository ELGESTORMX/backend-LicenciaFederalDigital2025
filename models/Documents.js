import { Schema, model } from 'mongoose';

let collection = 'documents';
let schema = new Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true }, // URL de la foto
  scope: { type: String, enum: ['ESTATAL','FEDERAL'], default: 'FEDERAL' },
  nacionalidad: { type: String, enum: ['MEXICANA','EXTRANJERO'], default: 'MEXICANA' },
  curp: { type: String, required: true },
  // Campos federales adicionales (opcionales) para futuras licencias federales
  categoriasFederales: { type: [String], default: undefined }, // Ej: ['A','B','C'] según lista federal
  rfc: { type: String, trim: true },
  numeroControl: { type: String, trim: true }, // Número interno / control SCT
  folioMedico: { type: String, trim: true }, // Folio del examen psicofísico
  vigenciaMedica: { type: String, trim: true }, // Fecha fin vigencia examen médico (string libre dd/mm/aaaa)
  tipoServicio: { type: String, trim: true }, // PASAJE, TURISMO, CARGA, etc.
  numeroEmpleado: { type: String, trim: true }, // Si aplica (concesionario / interno)
  enteEmisor: { type: String, trim: true }, // Secretaría / DGAF / etc.
  estadoEmision: { type: String, trim: true }, // Estado donde se emitió
  observaciones: { type: String, trim: true }, // Texto libre
  claseVehicular: { type: String, trim: true }, // Vehículos de dos/tres ejes, tractocamión, etc.
  numeroAptitudPsicofisica: { type: String, trim: true }, // Número de aptitud psicofísica (historial médico)
  categoriasTexto: { type: String, index: true }, // Campo derivado para búsqueda rápida (A/B/C)
  signature: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^https?:\/\//.test(v);
      },
      message: 'La URL de la firma no es válida.'
    }
  },
  adress: { type: String, required: false },
  idLicense: { type: String, required: true, unique: true },
  expeditionDate: { type: String, required:true }, // Fecha de expedición, string libre
  expeditionTime: { type: String, required:false }, // Hora de expedición HH:MM:SS (opcional)
  expirationDate: { type: String,required:true}, // Fecha de expiración, string libre
  antiquityDate: { type: String, required:false }, // Fecha de antigüedad (opcional en constancia)
  bloodType: { type: String, required:false }, // Tipo de sangre (no se imprime en constancia)
  donor: { type: Boolean, default: false }, // Donante de órganos
  restrictions: { type: String, default:'NINGUNA/NONE' }, // Restricciones médicas
  // Indicadores médicos impresos en la constancia
  lentes: { type: Boolean, default: false },
  diabetes: { type: Boolean, default: false },
  hipertension: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'users' },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
}, {
  timestamps: false // Deshabilitamos el automático
});

// Índices para acelerar búsquedas por idLicense y texto de categorías y CURP
schema.index({ idLicense: 1, categoriasTexto: 1 });
schema.index({ curp: 1 });

// Función util para validar fecha dd/mm/aaaa y existencia real (bisiesto incluido)
function isValidDDMMYYYY(str) {
  if (typeof str !== 'string') return false;
  const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10);
  if (mo < 1 || mo > 12) return false;
  const daysInMonth = [31, (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (d < 1 || d > daysInMonth[mo - 1]) return false;
  return true;
}

function isValidHHMMSS(str) {
  if (typeof str !== 'string') return false;
  return /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(str);
}

// Middleware para actualizar updatedAt con hora local
schema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  // Normalizar nacionalidad
  if (this.nacionalidad) {
    this.nacionalidad = String(this.nacionalidad).trim().toUpperCase();
    if (!['MEXICANA','EXTRANJERO'].includes(this.nacionalidad)) {
      this.nacionalidad = 'MEXICANA';
    }
  }
  // Derivar categoriasTexto si existen categorías federales
  if (Array.isArray(this.categoriasFederales) && this.categoriasFederales.length) {
    this.categoriasTexto = this.categoriasFederales.join('/').toUpperCase();
  }
  // Normalizar RFC y validar formato
  if (this.rfc) {
    this.rfc = this.rfc.toUpperCase().trim();
    const rfcRegex = /^([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3})$/;
    if (!rfcRegex.test(this.rfc)) {
      return next(new Error('RFC inválido (formato esperado XIII010101XXX)'));
    }
  }
  // Validar vigenciaMedica dd/mm/yyyy simple
  if (this.vigenciaMedica) {
    if (!isValidDDMMYYYY(this.vigenciaMedica)) {
      return next(new Error('vigenciaMedica inválida (DD/MM/AAAA real)'));
    }
  }
  // Validar expeditionDate, expirationDate, antiquityDate
  ['expeditionDate','expirationDate','antiquityDate'].forEach(f => {
    if (this[f] && !isValidDDMMYYYY(this[f])) {
      return next(new Error(`${f} inválida (DD/MM/AAAA real)`));
    }
  });
  if (this.expeditionTime && !isValidHHMMSS(this.expeditionTime)) {
    return next(new Error('expeditionTime inválida (HH:MM:SS 24h)'));
  }
  next();
});

// Middleware para findOneAndUpdate, updateOne, etc.
schema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  const update = this.getUpdate() || {};
  const $set = update.$set || {};
  // Siempre actualizar updatedAt dentro de $set
  $set.updatedAt = new Date();
  // Derivar categoriasTexto si se envían nuevas categorías
  if (Array.isArray($set.categoriasFederales) && $set.categoriasFederales.length) {
    $set.categoriasTexto = $set.categoriasFederales.join('/').toUpperCase();
  }
  // Validaciones en update (solo si se cambia RFC / vigencia)
  if ($set.rfc) {
    $set.rfc = String($set.rfc).toUpperCase().trim();
    const rfcRegex = /^([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3})$/;
    if (!rfcRegex.test($set.rfc)) {
      return next(new Error('RFC inválido (formato esperado XIII010101XXX)'));
    }
  }
  if ($set.vigenciaMedica) {
    if (!isValidDDMMYYYY($set.vigenciaMedica)) {
      return next(new Error('vigenciaMedica inválida (DD/MM/AAAA real)'));
    }
  }
  ['expeditionDate','expirationDate','antiquityDate'].forEach(f => {
    if ($set[f] && !isValidDDMMYYYY($set[f])) {
      return next(new Error(`${f} inválida (DD/MM/AAAA real)`));
    }
  });
  if ($set.expeditionTime && !isValidHHMMSS($set.expeditionTime)) {
    return next(new Error('expeditionTime inválida (HH:MM:SS 24h)'));
  }
  // Normalizar nacionalidad en updates
  if ($set.nacionalidad) {
    $set.nacionalidad = String($set.nacionalidad).trim().toUpperCase();
    if (!['MEXICANA','EXTRANJERO'].includes($set.nacionalidad)) {
      $set.nacionalidad = 'MEXICANA';
    }
  }
  // Escribir de vuelta en update
  update.$set = $set;
  this.set(update);
  next();
});

let Documents = model(collection, schema);
export default Documents;
