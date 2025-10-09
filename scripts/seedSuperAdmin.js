import 'dotenv/config.js';
import '../config/db.js';
import Users from '../models/Users.js';

// Datos desde argumentos CLI o variables de entorno
// Uso: node scripts/seedSuperAdmin.js ELGESTORMX Renata28680774938173 [creationLimit]

async function run() {
  try {
    const [,, usernameArg, passwordArg, creationLimitArg] = process.argv;
    const username = usernameArg || process.env.SUPERADMIN_USER || 'superadmin';
    const password = passwordArg || process.env.SUPERADMIN_PASS || 'Cambiar123';
    const creationLimit = Number(creationLimitArg || process.env.SUPERADMIN_CREATION_LIMIT || 0);

    if (!username || !password) {
      console.error('Faltan credenciales. Uso: node scripts/seedSuperAdmin.js <username> <password> [creationLimit]');
      process.exit(1);
    }

    const existing = await Users.findOne({ username });
    if (existing) {
      console.log(`Ya existe un usuario con username '${username}'. ID: ${existing._id}`);
      process.exit(0);
    }

    const user = new Users({ username, password, role: 1, creationLimit });
    await user.save();
    console.log('SuperAdmin creado:', { _id: user._id, username: user.username, creationLimit: user.creationLimit });
    process.exit(0);
  } catch (err) {
    console.error('Error creando superadmin:', err);
    process.exit(1);
  }
}

run();
