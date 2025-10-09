import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Documents from '../models/Documents.js';
import '../config/db.js';

dotenv.config();

async function run() {
  try {
  console.log('Iniciando migración a esquema FEDERAL (script legado: elimina dependencia future de licenseType)...');
    const docs = await Documents.find({ $or: [ { scope: { $exists: false } }, { scope: { $ne: 'FEDERAL' } }, { categoriasFederales: { $exists: false } } ] });
    console.log(`Documentos a migrar: ${docs.length}`);
    for (const d of docs) {
      if (!Array.isArray(d.categoriasFederales) || d.categoriasFederales.length === 0) {
        // Campo legacy licenseType sólo usado durante migración inicial; si no existe se deja arreglo vacío
        if (d.licenseType) {
          d.categoriasFederales = [d.licenseType];
        } else { d.categoriasFederales = []; }
      }
      d.scope = 'FEDERAL';
      // Derivar categoriasTexto
      if (d.categoriasFederales.length) {
        d.categoriasTexto = d.categoriasFederales.join('/').toUpperCase();
      } else if (d.licenseType) {
        // Último fallback legacy; considerar eliminar tras confirmar migración completa
        d.categoriasTexto = d.licenseType.toUpperCase();
      }
      await d.save();
      console.log(`Migrado documento ${d.idLicense}`);
    }
    console.log('Migración completada.');
  } catch (err) {
    console.error('Error en migración:', err);
  } finally {
    await mongoose.connection.close();
  }
}

run();
