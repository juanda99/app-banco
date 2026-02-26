const { pool } = require('../config/database')

// Obtener todos los movimientos
const getAllMovimientos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, 
             u.nombre as usuario_nombre, 
             u.apellido as usuario_apellido,
             ur.nombre as relacionado_nombre,
             ur.apellido as relacionado_apellido
      FROM movimientos m
      INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
      LEFT JOIN usuarios ur ON m.id_usuario_relacionado = ur.id_usuario
      ORDER BY m.fecha_hora DESC
    `)

    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error('Error al obtener movimientos:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos',
      error: error.message,
    })
  }
}

// Obtener movimientos de un usuario específico
const getMovimientosByUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params

    const [rows] = await pool.query(
      `
      SELECT m.*, 
             ur.nombre as relacionado_nombre,
             ur.apellido as relacionado_apellido
      FROM movimientos m
      LEFT JOIN usuarios ur ON m.id_usuario_relacionado = ur.id_usuario
      WHERE m.id_usuario = ?
      ORDER BY m.fecha_hora DESC
    `,
      [id_usuario],
    )

    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error('Error al obtener movimientos del usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos del usuario',
      error: error.message,
    })
  }
}

// Crear un abono
const createAbono = async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { id_usuario, importe, concepto } = req.body

    if (!id_usuario || !importe || importe <= 0) {
      connection.release()
      return res.status(400).json({
        success: false,
        message: 'id_usuario e importe (mayor a 0) son requeridos',
      })
    }

    // Obtener saldo actual
    const [usuario] = await connection.query(
      'SELECT saldo_actual FROM usuarios WHERE id_usuario = ?',
      [id_usuario],
    )
    if (usuario.length === 0) {
      await connection.rollback()
      connection.release()
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      })
    }

    const nuevoSaldo = parseFloat(usuario[0].saldo_actual) + parseFloat(importe)

    // Actualizar saldo del usuario
    await connection.query(
      'UPDATE usuarios SET saldo_actual = ? WHERE id_usuario = ?',
      [nuevoSaldo, id_usuario],
    )

    // Registrar movimiento
    const [result] = await connection.query(
      `INSERT INTO movimientos (id_usuario, fecha_hora, tipo, direccion, importe, saldo_final, concepto)
       VALUES (?, NOW(), 'abono', 'entrada', ?, ?, ?)`,
      [id_usuario, importe, nuevoSaldo, concepto || 'Abono'],
    )

    await connection.commit()

    res.status(201).json({
      success: true,
      message: 'Abono realizado exitosamente',
      data: {
        id_movimiento: result.insertId,
        saldo_anterior: usuario[0].saldo_actual,
        saldo_nuevo: nuevoSaldo,
      },
    })
  } catch (error) {
    await connection.rollback()
    console.error('Error al crear abono:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear abono',
      error: error.message,
    })
  } finally {
    connection.release()
  }
}

// Crear una retirada
const createRetirada = async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { id_usuario, importe, concepto } = req.body

    if (!id_usuario || !importe || importe <= 0) {
      connection.release()
      return res.status(400).json({
        success: false,
        message: 'id_usuario e importe (mayor a 0) son requeridos',
      })
    }

    // Obtener saldo actual
    const [usuario] = await connection.query(
      'SELECT saldo_actual FROM usuarios WHERE id_usuario = ?',
      [id_usuario],
    )
    if (usuario.length === 0) {
      await connection.rollback()
      connection.release()
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      })
    }

    // Verificar saldo suficiente
    if (parseFloat(usuario[0].saldo_actual) < parseFloat(importe)) {
      await connection.rollback()
      connection.release()
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente para realizar la retirada',
      })
    }

    const nuevoSaldo = parseFloat(usuario[0].saldo_actual) - parseFloat(importe)

    // Actualizar saldo del usuario
    await connection.query(
      'UPDATE usuarios SET saldo_actual = ? WHERE id_usuario = ?',
      [nuevoSaldo, id_usuario],
    )

    // Registrar movimiento
    const [result] = await connection.query(
      `INSERT INTO movimientos (id_usuario, fecha_hora, tipo, direccion, importe, saldo_final, concepto)
       VALUES (?, NOW(), 'retirada', 'salida', ?, ?, ?)`,
      [id_usuario, importe, nuevoSaldo, concepto || 'Retirada'],
    )

    await connection.commit()

    res.status(201).json({
      success: true,
      message: 'Retirada realizada exitosamente',
      data: {
        id_movimiento: result.insertId,
        saldo_anterior: usuario[0].saldo_actual,
        saldo_nuevo: nuevoSaldo,
      },
    })
  } catch (error) {
    await connection.rollback()
    console.error('Error al crear retirada:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear retirada',
      error: error.message,
    })
  } finally {
    connection.release()
  }
}

// Crear una transferencia (Bizum) mediante número de teléfono
const createTransferencia = async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { id_usuario_origen, telefono_destino, importe, concepto } = req.body

    if (!id_usuario_origen || !telefono_destino || !importe || importe <= 0) {
      connection.release()
      return res.status(400).json({
        success: false,
        message:
          'id_usuario_origen, telefono_destino e importe (mayor a 0) son requeridos',
      })
    }

    // Obtener datos del usuario origen
    const [usuarioOrigen] = await connection.query(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [id_usuario_origen],
    )

    if (usuarioOrigen.length === 0) {
      await connection.rollback()
      connection.release()
      return res.status(404).json({
        success: false,
        message: 'Usuario origen no encontrado',
      })
    }

    // Obtener datos del usuario destino por teléfono
    const [usuarioDestino] = await connection.query(
      'SELECT * FROM usuarios WHERE telefono = ?',
      [telefono_destino],
    )

    if (usuarioDestino.length === 0) {
      await connection.rollback()
      connection.release()
      return res.status(404).json({
        success: false,
        message:
          'El número de teléfono destino no está registrado en el sistema',
      })
    }

    if (usuarioOrigen[0].id_usuario === usuarioDestino[0].id_usuario) {
      await connection.rollback()
      connection.release()
      return res.status(400).json({
        success: false,
        message: 'No se puede transferir a la misma cuenta',
      })
    }

    // Verificar saldo suficiente
    if (parseFloat(usuarioOrigen[0].saldo_actual) < parseFloat(importe)) {
      await connection.rollback()
      connection.release()
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente para realizar la transferencia',
      })
    }

    const id_usuario_destino = usuarioDestino[0].id_usuario
    const nuevoSaldoOrigen =
      parseFloat(usuarioOrigen[0].saldo_actual) - parseFloat(importe)
    const nuevoSaldoDestino =
      parseFloat(usuarioDestino[0].saldo_actual) + parseFloat(importe)

    // Actualizar saldos
    await connection.query(
      'UPDATE usuarios SET saldo_actual = ? WHERE id_usuario = ?',
      [nuevoSaldoOrigen, id_usuario_origen],
    )
    await connection.query(
      'UPDATE usuarios SET saldo_actual = ? WHERE id_usuario = ?',
      [nuevoSaldoDestino, id_usuario_destino],
    )

    // Registrar movimiento de salida
    const conceptoSalida =
      concepto ||
      `Bizum a ${usuarioDestino[0].nombre} ${usuarioDestino[0].apellido}`
    await connection.query(
      `INSERT INTO movimientos (id_usuario, fecha_hora, tipo, direccion, importe, saldo_final, concepto, id_usuario_relacionado)
       VALUES (?, NOW(), 'transferencia', 'salida', ?, ?, ?, ?)`,
      [
        id_usuario_origen,
        importe,
        nuevoSaldoOrigen,
        conceptoSalida,
        id_usuario_destino,
      ],
    )

    // Registrar movimiento de entrada
    const conceptoEntrada =
      concepto ||
      `Bizum de ${usuarioOrigen[0].nombre} ${usuarioOrigen[0].apellido}`
    await connection.query(
      `INSERT INTO movimientos (id_usuario, fecha_hora, tipo, direccion, importe, saldo_final, concepto, id_usuario_relacionado)
       VALUES (?, NOW(), 'transferencia', 'entrada', ?, ?, ?, ?)`,
      [
        id_usuario_destino,
        importe,
        nuevoSaldoDestino,
        conceptoEntrada,
        id_usuario_origen,
      ],
    )

    await connection.commit()

    res.status(201).json({
      success: true,
      message: 'Bizum realizado exitosamente',
      data: {
        usuario_origen: {
          id: id_usuario_origen,
          nombre: `${usuarioOrigen[0].nombre} ${usuarioOrigen[0].apellido}`,
          saldo_anterior: usuarioOrigen[0].saldo_actual,
          saldo_nuevo: nuevoSaldoOrigen,
        },
        usuario_destino: {
          id: id_usuario_destino,
          nombre: `${usuarioDestino[0].nombre} ${usuarioDestino[0].apellido}`,
          telefono: telefono_destino,
          saldo_anterior: usuarioDestino[0].saldo_actual,
          saldo_nuevo: nuevoSaldoDestino,
        },
      },
    })
  } catch (error) {
    await connection.rollback()
    console.error('Error al crear transferencia:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear transferencia',
      error: error.message,
    })
  } finally {
    connection.release()
  }
}

module.exports = {
  getAllMovimientos,
  getMovimientosByUsuario,
  createAbono,
  createRetirada,
  createTransferencia,
}
