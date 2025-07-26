import { Schema, model } from 'mongoose';

let collection = 'documents';
let schema = new Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true }, // URL de la foto
  licenseType: { type: String, required: true },
  curp: { type: String, required: true },
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
  adress: { type: String, required: true },
  idLicense: { type: String, required: true, unique: true },
  expeditionDate: { type: String, required:true }, // Fecha de expedición, string libre
  expirationDate: { type: String,required:true}, // Fecha de expiración, string libre
  antiquityDate: { type: String, required:true }, // Fecha de antigüedad, string libre
  bloodType: { type: String, required:true }, // Tipo de sangre
  donor: { type: Boolean, default: false }, // Donante de órganos
  restrictions: { type: String, default:'NINGUNA/NONE' }, // Restricciones médicas
  createdBy: { type: Schema.Types.ObjectId, ref: 'users' },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
}, {
  timestamps: false // Deshabilitamos el automático
});

// Middleware para actualizar updatedAt con hora local
schema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Middleware para findOneAndUpdate, updateOne, etc.
schema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

let Documents = model(collection, schema);
export default Documents;
