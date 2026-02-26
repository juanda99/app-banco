require('dotenv').config()
const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`
const resetDatabase = require('./reset-db')
const mysql = require('mysql2/promise')

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

// Estadísticas de pruebas
const stats = {
  passed: 0,
  failed: 0,
  total: 0,
}

// Función de aserción simple
function expect(actual, expected, message) {
  stats.total++
  if (actual === expected) {
    stats.passed++
    console.log(`  ${colors.green}✓ PASS: ${message}${colors.reset}`)
    return true
  } else {
    stats.failed++
    console.log(
      `  ${colors.red}✗ FAIL: ${message}${colors.reset} (esperado: ${expected}, obtenido: ${actual})`,
    )
    return false
  }
}

function expectTrue(condition, message) {
  stats.total++
  if (condition) {
    stats.passed++
    console.log(`  ${colors.green}✓ PASS: ${message}${colors.reset}`)
    return true
  } else {
    stats.failed++
    console.log(`  ${colors.red}✗ FAIL: ${message}${colors.reset}`)
    return false
  }
}

// Función para hacer peticiones HTTP
async function request(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  // Información de depuración
  console.log(`  ${colors.cyan}[${method}] ${url}${colors.reset}`)
  if (body) {
    console.log(
      `  ${colors.reset}Body: ${JSON.stringify(body, null, 2)
        .split('\n')
        .join('\n  ')}${colors.reset}`,
    )
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    return { status: response.status, data }
  } catch (error) {
    console.error(
      `${colors.yellow}Error en la petición:${colors.reset}`,
      error.message,
    )
    throw error
  }
}

// Función para mostrar resultados
function showResult(title, result) {
  console.log(`${colors.cyan}${title}${colors.reset}`)
  console.log(JSON.stringify(result.data, null, 2))
  console.log(`${colors.green}Status: ${result.status}${colors.reset}`)
  console.log('')
}

// Función para pausar entre peticiones
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Ejecutar todas las pruebas
async function runTests() {
  console.log(`${colors.bright}=========================================`)
  console.log('  Pruebas de API REST - Sistema Bancario')
  console.log(`=========================================${colors.reset}\n`)

  try {
    // 0. Resetear la base de datos
    console.log(`${colors.blue}0. Resetear base de datos:${colors.reset}`)
    await resetDatabase()
    console.log(`${colors.green}  ✓ Base de datos reseteada${colors.reset}\n`)
    // 1. Obtener todos los usuarios
    console.log(
      `${colors.blue}1. GET - Obtener todos los usuarios:${colors.reset}`,
    )
    const usuarios = await request('GET', '/usuarios')
    expect(usuarios.status, 200, 'Status debe ser 200 OK')
    expectTrue(usuarios.data.success, 'Respuesta debe indicar éxito')
    expectTrue(
      Array.isArray(usuarios.data.data),
      'Data debe ser un array de usuarios',
    )
    showResult('Respuesta:', usuarios)
    await sleep(500)

    // 2. Obtener un usuario específico
    console.log(
      `${colors.blue}2. GET - Obtener usuario con ID 1:${colors.reset}`,
    )
    const usuario1 = await request('GET', '/usuarios/1')
    expect(usuario1.status, 200, 'Status debe ser 200 OK')
    expect(usuario1.data.data.id_usuario, 1, 'ID del usuario debe ser 1')
    showResult('Respuesta:', usuario1)
    await sleep(500)

    // 3. Obtener movimientos de un usuario
    console.log(
      `${colors.blue}3. GET - Obtener movimientos del usuario 1:${colors.reset}`,
    )
    const movimientos = await request('GET', '/movimientos/usuario/1')
    expect(movimientos.status, 200, 'Status debe ser 200 OK')
    expectTrue(
      Array.isArray(movimientos.data.data),
      'Data debe ser un array de movimientos',
    )
    showResult('Respuesta:', movimientos)
    await sleep(500)

    // 4. Crear un nuevo usuario
    console.log(
      `${colors.blue}4. POST - Crear un nuevo usuario:${colors.reset}`,
    )
    const nuevoUsuario = await request('POST', '/usuarios', {
      username: 'pedro',
      password_hash: 'password123',
      nombre: 'Pedro',
      apellido: 'Martínez',
      edad: 35,
      telefono: '+34622334455',
      saldo_actual: 800.0,
    })
    expect(nuevoUsuario.status, 201, 'Status debe ser 201 Created')
    expect(nuevoUsuario.data.data.nombre, 'Pedro', 'Nombre debe ser Pedro')
    showResult('Respuesta:', nuevoUsuario)
    await sleep(500)

    // 5. Realizar un abono
    console.log(
      `${colors.blue}5. POST - Realizar un abono de 150€ al usuario 1:${colors.reset}`,
    )
    const abono = await request('POST', '/movimientos/abono', {
      id_usuario: 1,
      importe: 150.0,
      concepto: 'Ingreso de nómina',
    })
    expect(abono.status, 201, 'Status debe ser 201 Created')
    expectTrue(abono.data.success, 'La respuesta debe ser exitosa')
    showResult('Respuesta:', abono)
    await sleep(500)

    // 6. Realizar una retirada
    console.log(
      `${colors.blue}6. POST - Realizar una retirada de 50€ del usuario 2:${colors.reset}`,
    )
    const retirada = await request('POST', '/movimientos/retirada', {
      id_usuario: 2,
      importe: 50.0,
      concepto: 'Retirada cajero',
    })
    expect(retirada.status, 201, 'Status debe ser 201 Created')
    expectTrue(retirada.data.success, 'La respuesta debe ser exitosa')
    showResult('Respuesta:', retirada)
    await sleep(500)

    // 7. Realizar un Bizum con número de teléfono válido
    console.log(
      `${colors.blue}7. POST - Bizum de 30€ del usuario 1 al teléfono +34600333444 (Ana):${colors.reset}`,
    )
    const bizum = await request('POST', '/movimientos/transferencia', {
      id_usuario_origen: 1,
      telefono_destino: '+34600333444',
      importe: 30.0,
      concepto: 'Bizum - Cena',
    })
    expect(bizum.status, 201, 'Status debe ser 201 Created')
    expectTrue(bizum.data.success, 'La respuesta debe ser exitosa')
    showResult('Respuesta:', bizum)
    await sleep(500)

    // 8. Verificar saldos actualizados
    console.log(
      `${colors.blue}8. GET - Verificar saldos actualizados:${colors.reset}`,
    )
    const usuariosActualizados = await request('GET', '/usuarios')
    expect(usuariosActualizados.status, 200, 'Status debe ser 200 OK')
    showResult('Respuesta:', usuariosActualizados)
    await sleep(500)

    console.log(
      `${colors.bright}${colors.yellow}=========================================`,
    )
    console.log('  Pruebas de Casos de Error')
    console.log(`=========================================${colors.reset}\n`)

    // 9. Error: Bizum a teléfono no registrado
    console.log(
      `${colors.blue}9. POST (ERROR) - Bizum a teléfono no registrado:${colors.reset}`,
    )
    try {
      const bizumError = await request('POST', '/movimientos/transferencia', {
        id_usuario_origen: 1,
        telefono_destino: '+34999999999',
        importe: 10.0,
        concepto: 'Bizum a teléfono inexistente',
      })
      expect(bizumError.status, 404, 'Status debe ser 404 Not Found')
      showResult('Respuesta:', bizumError)
    } catch (error) {
      expectTrue(true, `Error capturado correctamente: ${error.message}`)
      console.log(
        `${colors.yellow}Error esperado: ${error.message}${colors.reset}\n`,
      )
    }
    await sleep(500)

    // 10. Error: Retirada con saldo insuficiente
    console.log(
      `${colors.blue}10. POST (ERROR) - Retirada con saldo insuficiente:${colors.reset}`,
    )
    try {
      const retiradaError = await request('POST', '/movimientos/retirada', {
        id_usuario: 3,
        importe: 99999.0,
        concepto: 'Retirada imposible',
      })
      expect(retiradaError.status, 400, 'Status debe ser 400 Bad Request')
      showResult('Respuesta:', retiradaError)
    } catch (error) {
      expectTrue(true, `Error capturado correctamente: ${error.message}`)
      console.log(
        `${colors.yellow}Error esperado: ${error.message}${colors.reset}\n`,
      )
    }
    await sleep(500)

    // 11. Error: Bizum con saldo insuficiente
    console.log(
      `${colors.blue}11. POST (ERROR) - Bizum con saldo insuficiente:${colors.reset}`,
    )
    try {
      const bizumSaldoError = await request(
        'POST',
        '/movimientos/transferencia',
        {
          id_usuario_origen: 3,
          telefono_destino: '+34600111222',
          importe: 99999.0,
          concepto: 'Bizum imposible',
        },
      )
      expect(bizumSaldoError.status, 400, 'Status debe ser 400 Bad Request')
      showResult('Respuesta:', bizumSaldoError)
    } catch (error) {
      expectTrue(true, `Error capturado correctamente: ${error.message}`)
      console.log(
        `${colors.yellow}Error esperado: ${error.message}${colors.reset}\n`,
      )
    }
    await sleep(500)

    // 12. Error: Bizum a tu propio teléfono
    console.log(
      `${colors.blue}12. POST (ERROR) - Bizum a tu propio teléfono:${colors.reset}`,
    )
    try {
      // Primero obtenemos el teléfono del usuario 1
      const user = await request('GET', '/usuarios/1')
      const bizumPropio = await request('POST', '/movimientos/transferencia', {
        id_usuario_origen: 1,
        telefono_destino: user.data.data.telefono,
        importe: 10.0,
        concepto: 'Bizum a mi mismo',
      })
      expect(bizumPropio.status, 400, 'Status debe ser 400 Bad Request')
      showResult('Respuesta:', bizumPropio)
    } catch (error) {
      expectTrue(true, `Error capturado correctamente: ${error.message}`)
      console.log(
        `${colors.yellow}Error esperado: ${error.message}${colors.reset}\n`,
      )
    }
    await sleep(500)

    // 13. Error: Abono con datos inválidos
    console.log(
      `${colors.blue}13. POST (ERROR) - Abono con importe negativo:${colors.reset}`,
    )
    try {
      const abonoError = await request('POST', '/movimientos/abono', {
        id_usuario: 1,
        importe: -50.0,
        concepto: 'Abono inválido',
      })
      expect(abonoError.status, 400, 'Status debe ser 400 Bad Request')
      showResult('Respuesta:', abonoError)
    } catch (error) {
      expectTrue(true, `Error capturado correctamente: ${error.message}`)
      console.log(
        `${colors.yellow}Error esperado: ${error.message}${colors.reset}\n`,
      )
    }
    await sleep(500)

    // 14. Error: Usuario no encontrado
    console.log(
      `${colors.blue}14. GET (ERROR) - Usuario no encontrado:${colors.reset}`,
    )
    try {
      const usuarioNoExiste = await request('GET', '/usuarios/99999')
      expect(usuarioNoExiste.status, 404, 'Status debe ser 404 Not Found')
      showResult('Respuesta:', usuarioNoExiste)
    } catch (error) {
      expectTrue(true, `Error capturado correctamente: ${error.message}`)
      console.log(
        `${colors.yellow}Error esperado: ${error.message}${colors.reset}\n`,
      )
    }
    await sleep(500)

    // 15. Obtener todos los movimientos (resumen)
    console.log(
      `${colors.blue}15. GET - Obtener todos los movimientos (resumen):${colors.reset}`,
    )
    const todosMovimientos = await request('GET', '/movimientos')
    showResult('Respuesta (primeros 5):', {
      status: todosMovimientos.status,
      data: {
        success: todosMovimientos.data.success,
        total: todosMovimientos.data.data.length,
        primeros_5: todosMovimientos.data.data.slice(0, 5),
      },
    })

    console.log(
      `${colors.bright}${colors.green}=========================================`,
    )
    console.log('  ✅ Todas las pruebas completadas')
    console.log(`=========================================${colors.reset}`)
    console.log(`\n${colors.cyan}Resumen de Aserciones:${colors.reset}`)

    const summaryColor = stats.failed === 0 ? colors.green : colors.yellow
    console.log(
      `  • Aserciones totales: ${stats.total}`,
    )
    console.log(
      `  • Pasadas: ${colors.green}${stats.passed}${colors.reset}`,
    )
    console.log(
      `  • Fallidas: ${stats.failed > 0 ? colors.red : colors.green}${stats.failed}${colors.reset}`,
    )

    if (stats.failed > 0) {
      console.log(`\n${colors.red}⚠️ Se encontraron fallos en las pruebas.${colors.reset}`)
      process.exit(1)
    } else {
      console.log(`\n${colors.green}✨ ¡Excelente! Todas las aserciones han pasado.${colors.reset}`)
    }
  } catch (error) {
    console.error(
      `${colors.yellow}\n❌ Error durante las pruebas:${colors.reset}`,
      error.message,
    )
    process.exit(1)
  }
}

// Verificar que el servidor está corriendo
async function checkServer(retries = 1, delay = 1000) {
  const url = `http://localhost:${process.env.PORT || 3000}`

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url)
      if (!response.ok && response.status !== 404) {
        throw new Error(`Servidor responde con status ${response.status}`)
      }
      return true
    } catch (error) {
      if (i < retries) {
        // console.log(`  (Reintentando conexión al servidor en ${delay}ms...)`)
        await sleep(delay)
        continue
      }

      console.error(
        `\n${colors.red}❌ ERROR: El servidor backend no está disponible en ${url}${colors.reset}`,
      )
      console.log(
        `${colors.yellow}Sugerencia: Asegúrate de que el servidor esté corriendo ('npm start').${colors.reset}\n`,
      )
      return false
    }
  }
}

// Verificar conexión a la base de datos
async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    })
    await connection.end()
    return true
  } catch (error) {
    console.error(
      `\n${colors.red}❌ ERROR: No se puede conectar a la base de datos MySQL (${process.env.DB_NAME})${colors.reset}`,
    )
    console.log(
      `${colors.yellow}Detalle: ${error.message}${colors.reset}`,
    )
    console.log(
      `${colors.yellow}Sugerencia: Asegúrate de que los contenedores de Docker estén corriendo ('docker compose up -d').${colors.reset}\n`,
    )
    return false
  }
}

// Punto de entrada
; (async () => {
  // 1. Comprobar BD antes de nada
  const dbOk = await checkDatabase()
  if (!dbOk) process.exit(1)

  // 2. Comprobar Servidor antes de resetear
  const serverInitialOk = await checkServer(0) // Sin reintentos al principio
  if (!serverInitialOk) process.exit(1)

  // 3. Resetear Base de Datos
  await resetDatabase()

  // 4. Verificar que el servidor sigue vivo (el pool de conexiones puede tardar un poco en reconectar)
  const serverPostResetOk = await checkServer(3, 1000) // 3 reintentos, 1s cada uno
  if (!serverPostResetOk) {
    console.error(`${colors.red}❌ El servidor parece haberse caído después del reset de la base de datos.${colors.reset}`)
    process.exit(1)
  }

  // 5. Ejecutar los tests
  await runTests()
})()
