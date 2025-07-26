import Users from "../models/Users.js";  // Cambiado de Admins a Users
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

export default passport.use(
  new Strategy(
    //defino estrategia para extraer el token le paso parametro estas propiedades:
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //propiedad "token de la solicitud" extraida de la autorizacion de encabezamiento (header) de tipo bearer
      secretOrKey: process.env.SECRET_KEY,
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