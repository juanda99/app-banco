require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log('  - Conexión establecida.');

        // Se ha eliminado el matado de otras conexiones (KILL PROCESS) porque causaba inestabilidad
        // en el pool de conexiones del servidor backend.

        // Desactivar checks de claves foráneas para poder borrar las tablas
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('  - Foreign key checks desactivados.');

        await connection.query('DROP TABLE IF EXISTS movimientos');
        console.log('  - Tabla "movimientos" eliminada.');

        await connection.query('DROP TABLE IF EXISTS usuarios');
        console.log('  - Tabla "usuarios" eliminada.');

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('  - Foreign key checks activados.');

        // Leer el archivo SQL de inicialización
        const sqlPath = path.join(__dirname, '../bbdd/initData/banco_demo.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Ejecutar el script SQL
        console.log('  - Ejecutando script de inicialización...');
        await connection.query(sql);
        console.log('  - Script SQL ejecutado.');

        return true;
    } catch (error) {
        console.error('\n❌ Error reseteando la base de datos:', error.message);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

if (require.main === module) {
    (async () => {
        try {
            console.log('Reseteando base de datos...');
            await resetDatabase();
            console.log('✅ Base de datos reseteada con éxito.');
            process.exit(0);
        } catch (error) {
            process.exit(1);
        }
    })();
}

module.exports = resetDatabase;
