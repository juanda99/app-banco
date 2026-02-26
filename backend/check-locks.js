require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkLocks() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- Process List ---');
        const [processes] = await connection.query('SHOW FULL PROCESSLIST');
        console.table(processes);

    } catch (error) {
        console.error('Error checking locks:', error.message);
    } finally {
        await connection.end();
    }
}

checkLocks();
