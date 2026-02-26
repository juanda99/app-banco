const express = require('express')
const cors = require('cors')
require('dotenv').config()

const { testConnection } = require('./config/database')
const usuariosRoutes = require('./routes/usuarios.routes')
const movimientosRoutes = require('./routes/movimientos.routes')
const authRoutes = require('./routes/auth.routes')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API REST de Banco - Bienvenido',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      movimientos: '/api/movimientos',
    },
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/movimientos', movimientosRoutes)

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
  })
})

// Iniciar servidor
const startServer = async () => {
  try {
    await testConnection()
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
      console.log(`📚 Documentación disponible en http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

startServer()
