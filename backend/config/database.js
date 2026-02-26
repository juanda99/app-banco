const mysql = require('mysql2')
require('dotenv').config()

// Crear pool de conexiones a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Obtener la versión promise del pool
const promisePool = pool.promise()

// Función para verificar la conexión
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection()
    console.log('✅ Conexión exitosa a la base de datos MySQL')
    connection.release()
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message)
  }
}

module.exports = { pool: promisePool, testConnection }
