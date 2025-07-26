import Users from '../Users.js'  // Cambiado de Admins a Users
import 'dotenv/config.js'
import '../../config/db.js'

let users = [
    {
        username: 'gus',                    // Cambiado de 'usuario' a 'username'
        password: 'hola123',                // Cambiado de 'contraseña' a 'password'
        role: 1,                           // Cambiado de 'rol' a 'role' (1: superAdmin)
        sessionCount: 0,                   // Cambiado de 'online' a 'sessionCount'
        creationLimit: 25,                 // Cambiado de 'folios' a 'creationLimit'
        // createdBy se omite ya que es el usuario inicial
    }
]

// Usar save() para que se ejecuten los middlewares de hash
async function createUsers() {
    try {
        for (let userData of users) {
            const user = new Users(userData);  // Cambiado de Admins a Users
            await user.save(); // Esto SÍ ejecutará tus middlewares
            console.log('Usuario creado:', user.username);  // Cambiado el campo de log
        }
        console.log('Todos los usuarios creados correctamente');
        process.exit(0);
    } catch (error) {
        console.error('Error creando usuarios:', error);
        process.exit(1);
    }
}

createUsers();