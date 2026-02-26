const { pool } = require('../config/database')

// Login de usuario
const login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Validar que se envíen los datos necesarios
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username y password son requeridos',
      })
    }

    // Buscar usuario por username
    const [usuarios] = await pool.query(
      'SELECT id_usuario, username, nombre, apellido, telefono, saldo_actual, password_hash FROM usuarios WHERE username = ?',
      [username],
    )

    if (usuarios.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      })
    }

    const usuario = usuarios[0]

    // Verificar contraseña (en este demo es texto plano, en producción usar bcrypt)
    if (password !== usuario.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      })
    }

    // No enviar el password_hash al cliente
    delete usuario.password_hash

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario,
      },
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({
      success: false,
      message: 'Error al realizar login',
    })
  }
}

// Obtener información del usuario por ID
const getUsuarioInfo = async (req, res) => {
  try {
    const { id_usuario } = req.params

    const [usuarios] = await pool.query(
      'SELECT id_usuario, username, nombre, apellido, edad, telefono, saldo_actual FROM usuarios WHERE id_usuario = ?',
      [id_usuario],
    )

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      })
    }

    res.json({
      success: true,
      data: usuarios[0],
    })
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
    })
  }
}

module.exports = {
  login,
  getUsuarioInfo,
}
