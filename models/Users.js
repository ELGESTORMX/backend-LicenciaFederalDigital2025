import { Schema,model } from 'mongoose'
import bcrypt from 'bcrypt'  // Para hashear contraseñas

let collection = 'users'            
let schema = new Schema({    
    username: { type:String, required:true, unique:true,},
    password:{type:String, required:true},
    role:{type:Number, default:3}, // 1:superAdmin, 2:Moderador, 3:cliente, 4:revendedor
    sessionCount: {type:Number, default:0},  // Para contabilizar las sesiones
    creationLimit:{type:Number, default:0}, // Para limitar la cantidad de veces que un usuario puede crear un documento
    active: { type: Boolean, default: true }, // Si el usuario está bloqueado o no
    createdBy: { type: Schema.Types.ObjectId, ref: 'users' }, // Para saber quién creó el usuario
    createdAt: { type: Date, default: () => new Date() }, // Hora local de tu computadora
    updatedAt: { type: Date, default: () => new Date() }  // Hora local de tu computadora
},{
    timestamps: false // Deshabilitamos el automático
})

// Middleware para hashear password antes de guardar
schema.pre('save', async function(next) {
    // Solo hashear si el password fue modificado o es nuevo
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        // Hashear el password con salt rounds = 10
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Middleware para actualizar updatedAt con hora local
schema.pre('save', function(next) {
    if (!this.isNew) {
        this.updatedAt = new Date(); // Usa la hora local de tu computadora
    }
    next();
});

// Middleware para findOneAndUpdate, updateOne, etc.
schema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
    this.set({ updatedAt: new Date() }); // Usa la hora local de tu computadora
    next();
});

let Users = model(collection,schema)
export default Users

// touch: cambio mínimo para redeploy 2025-10-15