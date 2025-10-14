import Users from "../models/Users.js";  // Cambiado de Admins a Users
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

// Comprobar que la variable de entorno SECRET_KEY esté definida en tiempo de ejecución.
const SECRET = process.env.SECRET_KEY;
if (!SECRET) {
  console.error('\nERROR: la variable de entorno SECRET_KEY no está definida.\n' +
    'Asegúrate de definir SECRET_KEY en el entorno (por ejemplo: en Railway -> Settings -> Variables).\n' +
    'En entornos locales coloca SECRET_KEY en el archivo .env en la raíz del proyecto.\n');
  throw new Error('Missing environment variable: SECRET_KEY');
}

export default passport.use(
  new Strategy(
    //defino estrategia para extraer el token le paso parametro estas propiedades:
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //propiedad "token de la solicitud" extraida de la autorizacion de encabezamiento (header) de tipo bearer
      secretOrKey: SECRET,
      //la clave secreta
    },
    async (jwt_payload, done) => {
      try {
        let usuario = await Users.findOne({ username: jwt_payload.username }); // Cambiado campo
        if (usuario) {
          
          // 🔐 VALIDACIÓN DE SEGURIDAD: Verificar que el rol no haya cambiado
          if (usuario.role !== jwt_payload.role) {
            console.log(`⚠️ Invalid credentials: Role mismatch for user ${usuario.username}`);
            return done(null, false); // Credenciales inválidas - rol cambió
          }

          // Token válido - devolver usuario sin password
          return done(null, {
            _id: usuario._id,
            username: usuario.username,
            role: usuario.role,
            sessionCount: usuario.sessionCount,
            creationLimit: usuario.creationLimit,
            createdBy: usuario.createdBy
          });
        } else {
          return done(null, false); // Usuario no existe
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
// touch: cambio mínimo para redeploy 2025-10-14