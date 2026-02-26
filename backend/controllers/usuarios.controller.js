const { pool } = require('../config/database')

// Obtener todos los usuarios
const getAllUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios ORDER BY id_usuario',
    )
    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message,
    })
  }
}

// Obtener un usuario por ID
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [id],
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      })
    }

    res.json({
      success: true,
      data: rows[0],
    })
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message,
    })
  }
}

// Crear un nuevo usuario
const createUsuario = async (req, res) => {
  try {
    const {
      username,
      password_hash,
      nombre,
      apellido,
      edad,
      telefono,
      saldo_actual,
    } = req.body

    // Validaciones básicas
    if (!username || !password_hash || !nombre || !apellido || !edad || !telefono) {
      return res.status(400).json({
        success: false,
        message:
          'Faltan campos requeridos: username, password_hash, nombre, apellido, edad, telefono',
      })
    }

    const [result] = await pool.query(
      'INSERT INTO usuarios (username, password_hash, nombre, apellido, edad, telefono, saldo_actual) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        username,
        password_hash,
        nombre,
        apellido,
        edad,
        telefono,
        saldo_actual || 0,
      ],
    )

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id_usuario: result.insertId,
        nombre,
        apellido,
        edad,
        telefono,
        saldo_actual: saldo_actual || 0,
      },
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message,
    })
  }
}

// Actualizar un usuario
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, apellido, edad, telefono } = req.body

    // Verificar que el usuario existe
    const [existing] = await pool.query(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [id],
    )
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      })
    }

    await pool.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, edad = ?, telefono = ? WHERE id_usuario = ?',
      [nombre, apellido, edad, telefono, id],
    )

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
    })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message,
    })
  }
}

// Eliminar un usuario
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar que el usuario existe
    const [existing] = await pool.query(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [id],
    )
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      })
    }

    await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [id])

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message,
    })
  }
}

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
}
