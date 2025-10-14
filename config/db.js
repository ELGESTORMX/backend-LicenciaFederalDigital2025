import { connect } from 'mongoose'

const LINK = process.env.LINK_DB;
if (!LINK) {
    console.error('\nERROR: la variable de entorno LINK_DB no está definida.\n' +
        'Define LINK_DB con la cadena de conexión de MongoDB Atlas en el entorno (Railway -> Variables).\n');
    throw new Error('Missing environment variable: LINK_DB');
}

connect(LINK, { serverSelectionTimeoutMS: 10000 })                        //conecto con el link de la db guardado en la variable de entorno del archivo .env
        .then(()=>console.log('connected to db'))       //devuelve una promesa por lo que es necesario configurar
        .catch(err=>{
                console.error('\nERROR: No fue posible conectar a MongoDB Atlas. Revisa:\n' +
                    '  - Que la variable LINK_DB tenga la cadena correcta.\n' +
                    '  - Que el IP/Range de tu entorno esté autorizado en Atlas (Network Access -> Add IP Address).\n' +
                    "  - Para pruebas, puedes usar 0.0.0.0/0 (no recomendado en producción).\n\n");
                console.error(err);
                // Volver a lanzar para que el proceso falle y la plataforma (Railway) marque el deploy como fallido.
                throw err;
        })                   //then y catch
// touch: cambio mínimo para redeploy 2025-10-14