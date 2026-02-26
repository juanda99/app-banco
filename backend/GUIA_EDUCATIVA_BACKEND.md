# 📚 Guía Educativa Completa del Backend - Sistema Bancario

## 🎯 Introducción

Este documento explica detalladamente cómo funciona el backend de nuestro sistema bancario. Está diseñado para estudiantes de JavaScript que quieren entender cómo crear una API REST profesional con Node.js, Express y MySQL.

---

## 📁 Estructura del Proyecto

```
backend/
├── config/               # Configuración de la aplicación
│   └── database.js      # Conexión a la base de datos
├── controllers/         # Lógica de negocio
│   ├── auth.controller.js
│   ├── usuarios.controller.js
│   └── movimientos.controller.js
├── routes/             # Definición de rutas (endpoints)
│   ├── auth.routes.js
│   ├── usuarios.routes.js
│   └── movimientos.routes.js
├── server.js           # Punto de entrada de la aplicación
├── test-api.js         # Tests automatizados
├── package.json        # Dependencias del proyecto
└── .env               # Variables de entorno (configuración)
```

### ¿Por qué esta estructura?

Esta organización sigue el patrón **MVC (Model-View-Controller)** adaptado para APIs:

- **Rutas (Routes)**: Definen las URLs que los usuarios pueden visitar
- **Controladores (Controllers)**: Contienen la lógica de lo que hace cada ruta
- **Configuración (Config)**: Separa la configuración del código principal

---

## 📦 Archivo: `package.json`

```json
{
  "name": "banco-backend",
  "version": "2.0.0",
  "description": "Backend API REST para gestión de cuentas bancarias",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node test-api.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Explicación de Dependencias:

1. **express**: Framework web para Node.js que facilita crear servidores y APIs
   - Sin Express: Tendrías que escribir mucho código para manejar peticiones HTTP
   - Con Express: Puedes crear rutas fácilmente con `app.get()`, `app.post()`, etc.

2. **mysql2**: Driver (conector) para comunicarse con la base de datos MySQL
   - Permite ejecutar consultas SQL desde JavaScript
   - Soporta Promises (async/await) para código más limpio

3. **dotenv**: Carga variables de entorno desde un archivo `.env`
   - ¿Por qué? Para no poner contraseñas directamente en el código
   - Las contraseñas quedan en `.env` que no se sube a Git

4. **cors**: Permite que navegadores web accedan a tu API
   - Sin CORS: Solo Node.js podría consumir tu API
   - Con CORS: Navegadores, apps móviles, etc. pueden usarla

5. **nodemon** (desarrollo): Reinicia automáticamente el servidor cuando cambias código
   - Sin nodemon: Tienes que parar y reiniciar manualmente
   - Con nodemon: Se reinicia automáticamente al guardar cambios

---

## 🗄️ Archivo: `config/database.js`

```javascript
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
```

### Conceptos Clave Explicados:

#### 1. ¿Qué es un Pool de Conexiones?

Imagina una piscina (pool) con 10 conexiones a la base de datos:

- Sin pool: Cada petición crea una nueva conexión (lento) ❌
- Con pool: Las conexiones se reutilizan entre peticiones (rápido) ✅

```javascript
// Configuración del pool
connectionLimit: 10,  // Máximo 10 conexiones simultáneas
waitForConnections: true,  // Si están todas ocupadas, espera
queueLimit: 0  // Sin límite de peticiones en cola
```

#### 2. ¿Qué es `process.env`?

`process.env` contiene las variables de entorno. En lugar de escribir:

```javascript
// ❌ MAL - Contraseña visible en el código
password: 'miPassword123'
```

Usamos:

```javascript
// ✅ BIEN - Contraseña en archivo .env
password: process.env.DB_PASSWORD
```

#### 3. ¿Por qué `.promise()`?

MySQL2 puede trabajar con callbacks o Promises. Las Promises son más modernas:

```javascript
// Estilo antiguo (callbacks)
pool.query('SELECT * FROM usuarios', (error, results) => {
  if (error) throw error
  console.log(results)
})

// Estilo moderno (async/await con Promises)
const [results] = await promisePool.query('SELECT * FROM usuarios')
console.log(results)
```

#### 4. La función `testConnection()`

```javascript
const testConnection = async () => {
  try {
    // Intenta obtener una conexión del pool
    const connection = await promisePool.getConnection()
    console.log('✅ Conexión exitosa')

    // IMPORTANTE: Siempre libera la conexión
    connection.release()
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}
```

**¿Por qué `connection.release()`?**

- Si no liberas la conexión, el pool se queda sin conexiones disponibles
- Es como devolver un libro a la biblioteca para que otros puedan usarlo

---

## 🚀 Archivo: `server.js` (Corazón de la Aplicación)

```javascript
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
    })
  } catch (error) {
    console.error('Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

startServer()
```

### Desglose Línea por Línea:

#### Paso 1: Importaciones

```javascript
const express = require('express')
```

- `require()` importa un módulo (paquete)
- Similar a `import` en JavaScript moderno
- `express` es el framework que usaremos

```javascript
const { testConnection } = require('./config/database')
```

- Importamos solo `testConnection` del archivo database.js
- Las llaves `{}` indican "destructuring" (extraer una propiedad específica)

#### Paso 2: Crear la Aplicación

```javascript
const app = express()
```

- `app` es nuestra aplicación web
- Aquí definiremos todas las rutas y configuraciones

```javascript
const PORT = process.env.PORT || 3000
```

- Operador `||` (OR): "Usa PORT del .env, si no existe, usa 3000"
- Permite flexibilidad en diferentes entornos

#### Paso 3: Middlewares

**¿Qué es un Middleware?**
Un middleware es una función que se ejecuta ANTES de llegar a tus rutas.

```
Petición → Middleware 1 → Middleware 2 → Tu Ruta → Respuesta
```

```javascript
app.use(cors())
```

**CORS (Cross-Origin Resource Sharing)**

- Permite que otros dominios accedan a tu API
- Sin esto, un sitio web en `https://miapp.com` no podría llamar a tu API

```javascript
app.use(express.json())
```

**Parser JSON**

- Convierte el body de la petición a un objeto JavaScript
- Ejemplo: `{"nombre": "Juan"}` → `req.body.nombre = "Juan"`

```javascript
app.use(express.urlencoded({ extended: true }))
```

**Parser URL-encoded**

- Procesa formularios HTML tradicionales
- Ejemplo: `nombre=Juan&edad=30` → `req.body.nombre = "Juan"`

#### Paso 4: Definir Rutas

```javascript
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API REST de Banco - Bienvenido',
  })
})
```

**Anatomía de una Ruta:**

- `app.get()`: Método HTTP GET (obtener datos)
- `'/'`: URL del endpoint (ruta raíz)
- `(req, res) => {}`: Función que maneja la petición
  - `req` (request): Lo que el cliente envió
  - `res` (response): Lo que devolveremos

**Ejemplo de uso:**

```bash
curl http://localhost:3000/
# Devuelve: {"success": true, "message": "..."}
```

```javascript
app.use('/api/usuarios', usuariosRoutes)
```

**Montaje de Rutas**

- Todas las rutas de `usuariosRoutes` tendrán el prefijo `/api/usuarios`
- Si usuariosRoutes tiene `router.get('/')`, la URL completa será `/api/usuarios/`

#### Paso 5: Ruta 404 (No Encontrado)

```javascript
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
  })
})
```

- `'*'` captura CUALQUIER ruta que no se haya definido antes
- `.status(404)` indica "Not Found"

#### Paso 6: Iniciar el Servidor

```javascript
const startServer = async () => {
  try {
    await testConnection() // Verifica la base de datos primero
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Error:', error)
    process.exit(1) // Salir con código de error
  }
}

startServer()
```

**¿Por qué async/await?**

- `testConnection()` es asíncrono (tarda tiempo)
- `await` espera a que termine antes de continuar
- Si falla la conexión a la BD, no tiene sentido iniciar el servidor

---

## 🛣️ Archivo: `routes/usuarios.routes.js`

```javascript
const express = require('express')
const router = express.Router()
const usuariosController = require('../controllers/usuarios.controller')

// Rutas para usuarios
router.get('/', usuariosController.getAllUsuarios)
router.get('/:id', usuariosController.getUsuarioById)
router.post('/', usuariosController.createUsuario)
router.put('/:id', usuariosController.updateUsuario)
router.delete('/:id', usuariosController.deleteUsuario)

module.exports = router
```

### Conceptos Importantes:

#### 1. Router de Express

```javascript
const router = express.Router()
```

- `Router()` crea un mini-sistema de rutas
- Permite organizar rutas en archivos separados
- Se exporta y se monta en `server.js`

#### 2. Parámetros de Ruta

```javascript
router.get('/:id', usuariosController.getUsuarioById)
```

- `:id` es un parámetro dinámico
- Si visitas `/api/usuarios/5`, entonces `req.params.id = "5"`

**Ejemplo:**

```javascript
// URL: /api/usuarios/42
console.log(req.params.id) // "42"
```

#### 3. Métodos HTTP

| Método | Propósito        | Ejemplo                   |
| ------ | ---------------- | ------------------------- |
| GET    | Obtener datos    | Listar usuarios           |
| POST   | Crear nuevo      | Crear usuario             |
| PUT    | Actualizar todo  | Actualizar usuario entero |
| PATCH  | Actualizar parte | Actualizar solo el nombre |
| DELETE | Eliminar         | Eliminar usuario          |

#### 4. ¿Por qué separar en Controladores?

**❌ Sin Controladores (todo en rutas):**

```javascript
router.get('/', async (req, res) => {
  // 50 líneas de código aquí
  // Difícil de leer y mantener
})
```

**✅ Con Controladores (separados):**

```javascript
router.get('/', usuariosController.getAllUsuarios)
```

- Rutas: Solo definen URLs y métodos HTTP
- Controladores: Contienen la lógica
- Más limpio y fácil de mantener

---

## 🎮 Archivo: `controllers/usuarios.controller.js`

```javascript
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
```

### Desglose Profundo:

#### 1. Estructura Try-Catch

```javascript
try {
  // Código que puede fallar
  const [rows] = await pool.query('...')
} catch (error) {
  // Qué hacer si falla
  console.error('Error:', error)
}
```

**¿Por qué es necesario?**

- Las consultas a la BD pueden fallar (BD caída, SQL incorrecto, etc.)
- Sin try-catch, la app se crashearía
- Con try-catch, capturamos el error y devolvemos una respuesta elegante

#### 2. Destructuring en Consultas

```javascript
const [rows] = await pool.query('SELECT * FROM usuarios')
```

**¿Por qué `[rows]`?**

- `pool.query()` devuelve un array: `[datos, metadata]`
- Solo nos interesan los datos
- Destructuring extrae solo el primer elemento

Es equivalente a:

```javascript
const result = await pool.query('SELECT * FROM usuarios')
const rows = result[0] // Solo los datos
```

#### 3. Consultas SQL con Parámetros

```javascript
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params // Extraer id de la URL
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [id], // El ? se reemplaza por este valor
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
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message,
    })
  }
}
```

**¿Por qué usar `?` en lugar de interpolar?**

❌ **PELIGROSO (SQL Injection):**

```javascript
// NUNCA HAGAS ESTO
const query = `SELECT * FROM usuarios WHERE id = ${id}`
```

Si `id = "1 OR 1=1"`, obtendría TODOS los usuarios.

✅ **SEGURO (Prepared Statements):**

```javascript
pool.query('SELECT * FROM usuarios WHERE id = ?', [id])
```

MySQL escapa automáticamente los valores peligrosos.

#### 4. Crear un Usuario (POST)

```javascript
const createUsuario = async (req, res) => {
  try {
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
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message,
    })
  }
}
```

**Puntos Importantes:**

1. **Validación de Datos:**

```javascript
if (!nombre || !apellido || !edad || !telefono) {
  return res.status(400).json({...});
}
```

- Siempre valida los datos antes de guardarlos
- `status(400)` = Bad Request (petición incorrecta)
- `return` detiene la ejecución

2. **Operador OR para Valores por Defecto:**

```javascript
saldo_actual || 0
```

- Si `saldo_actual` es `undefined`, `null`, o `""`, usa `0`

3. **insertId:**

```javascript
result.insertId
```

- Cuando haces un INSERT, MySQL devuelve el ID del nuevo registro
- Útil para devolver el objeto completo al cliente

---

## 💰 Archivo: `controllers/movimientos.controller.js`

### Ejemplo Completo: Crear un Abono

```javascript
const createAbono = async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { id_usuario, importe, concepto } = req.body

    // 1. Validar datos
    if (!id_usuario || !importe || importe <= 0) {
      connection.release()
      return res.status(400).json({
        success: false,
        message: 'id_usuario e importe (mayor a 0) son requeridos',
      })
    }

    // 2. Obtener saldo actual
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

    // 3. Calcular nuevo saldo
    const nuevoSaldo = parseFloat(usuario[0].saldo_actual) + parseFloat(importe)

    // 4. Actualizar saldo del usuario
    await connection.query(
      'UPDATE usuarios SET saldo_actual = ? WHERE id_usuario = ?',
      [nuevoSaldo, id_usuario],
    )

    // 5. Registrar movimiento
    const [result] = await connection.query(
      `INSERT INTO movimientos (id_usuario, fecha_hora, tipo, direccion, importe, saldo_final, concepto)
       VALUES (?, NOW(), 'abono', 'entrada', ?, ?, ?)`,
      [id_usuario, importe, nuevoSaldo, concepto || 'Abono'],
    )

    // 6. Confirmar transacción
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
```

### Conceptos Avanzados:

#### 1. Transacciones (Transactions)

**¿Qué es una Transacción?**
Una transacción agrupa varias operaciones que deben ejecutarse TODAS o NINGUNA.

**Ejemplo del problema sin transacciones:**

1. Restas €100 de la cuenta A ✅
2. _[CRASH del servidor]_ 💥
3. Sumas €100 a la cuenta B ❌ (nunca se ejecuta)

**Resultado:** ¡€100 desaparecieron del sistema!

**Con transacciones:**

```javascript
await connection.beginTransaction() // Inicia
// ... operaciones ...
await connection.commit() // Confirma TODO
// O si hay error:
await connection.rollback() // Cancela TODO
```

#### 2. getConnection() vs pool.query()

```javascript
// Para operaciones simples
const [rows] = await pool.query('SELECT...')

// Para transacciones (múltiples operaciones relacionadas)
const connection = await pool.getConnection()
await connection.beginTransaction()
// ... varias queries ...
await connection.commit()
connection.release() // ¡IMPORTANTE!
```

#### 3. Finally Block

```javascript
try {
  // Código que puede fallar
} catch (error) {
  // Manejo de errores
} finally {
  connection.release() // Siempre se ejecuta
}
```

**¿Por qué finally?**

- Se ejecuta SIEMPRE (éxito o error)
- Garantiza que liberamos la conexión
- Sin esto, el pool se quedaría sin conexiones

#### 4. Bizum (Transferencias por Teléfono)

```javascript
const createTransferencia = async (req, res) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const { id_usuario_origen, telefono_destino, importe, concepto } = req.body

    // Validar datos
    if (!id_usuario_origen || !telefono_destino || !importe || importe <= 0) {
      connection.release()
      return res.status(400).json({
        success: false,
        message: 'id_usuario_origen, telefono_destino e importe son requeridos',
      })
    }

    // Obtener usuario origen
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

    // Buscar usuario destino por teléfono
    const [usuarioDestino] = await connection.query(
      'SELECT * FROM usuarios WHERE telefono = ?',
      [telefono_destino],
    )

    if (usuarioDestino.length === 0) {
      await connection.rollback()
      connection.release()
      return res.status(404).json({
        success: false,
        message: 'El número de teléfono destino no está registrado',
      })
    }

    // Verificar que no sea el mismo usuario
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

    // Calcular nuevos saldos
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

    // Confirmar transacción
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
```

**Flujo de una Transferencia:**

1. ✅ Validar datos de entrada
2. ✅ Verificar que existe el usuario origen
3. ✅ Buscar usuario destino por teléfono
4. ✅ Verificar que no sea auto-transferencia
5. ✅ Verificar saldo suficiente
6. ✅ Actualizar saldo origen (resta)
7. ✅ Actualizar saldo destino (suma)
8. ✅ Registrar movimiento de salida
9. ✅ Registrar movimiento de entrada
10. ✅ Confirmar transacción

**Si cualquier paso falla → Rollback cancela TODO**

---

## 🧪 Archivo: `test-api.js`

```javascript
const BASE_URL = 'http://localhost:3000/api'

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
}

async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options)
  const data = await response.json()
  return { status: response.status, data }
}

function showResult(title, result) {
  console.log(`${colors.blue}${title}${colors.reset}`)
  console.log(JSON.stringify(result.data, null, 2))
  console.log(`${colors.green}Status: ${result.status}${colors.reset}\n`)
}

async function runTests() {
  console.log('Iniciando tests...\n')

  // Test 1: Obtener usuarios
  const usuarios = await request('GET', '/usuarios')
  showResult('1. GET /usuarios', usuarios)

  // Test 2: Crear usuario
  const nuevoUsuario = await request('POST', '/usuarios', {
    nombre: 'Test',
    apellido: 'Usuario',
    edad: 25,
    telefono: '+34111111111',
    saldo_actual: 100,
  })
  showResult('2. POST /usuarios', nuevoUsuario)

  // Test 3: Bizum exitoso
  const bizum = await request('POST', '/movimientos/transferencia', {
    id_usuario_origen: 1,
    telefono_destino: '+34600333444',
    importe: 10.0,
    concepto: 'Test Bizum',
  })
  showResult('3. POST /movimientos/transferencia', bizum)

  // Test 4: Error - Teléfono no registrado
  try {
    const bizumError = await request('POST', '/movimientos/transferencia', {
      id_usuario_origen: 1,
      telefono_destino: '+34999999999',
      importe: 10.0,
    })
    showResult('4. Error esperado - Teléfono no existe', bizumError)
  } catch (error) {
    console.log(
      `${colors.yellow}Error capturado correctamente${colors.reset}\n`,
    )
  }
}

runTests()
```

### Conceptos de Testing:

#### 1. ¿Por qué hacer tests?

**Sin tests:**

- Cambias código → ¿Funciona? → Pruebas manualmente (lento)
- ¿Rompiste algo? → No lo sabes hasta que un usuario se queja

**Con tests:**

- Cambias código → Ejecutas `npm test` → Sabes inmediatamente si algo se rompió
- Puedes refactorizar con confianza

#### 2. Fetch API

```javascript
const response = await fetch(url, options)
```

- `fetch()` hace peticiones HTTP
- Devuelve una Promise (por eso usamos `await`)
- Similar a `axios`, pero nativo en Node.js moderno

#### 3. Códigos de Color en Terminal

```javascript
const colors = {
  green: '\x1b[32m',
  reset: '\x1b[0m',
}

console.log(`${colors.green}✅ Éxito${colors.reset}`)
```

- `\x1b[32m` son códigos ANSI para colores
- `reset` vuelve al color normal
- Hace los logs más legibles

---

## 🔐 Variables de Entorno (`.env`)

```env
PORT=3000
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=banco
DB_PORT=3306
```

### ¿Por qué usar .env?

1. **Seguridad:**
   - Las contraseñas no están en el código
   - `.env` está en `.gitignore` (no se sube a Git)

2. **Flexibilidad:**
   - Desarrollo: `DB_HOST=localhost`
   - Producción: `DB_HOST=servidor-produccion.com`
   - Mismo código, diferentes configuraciones

3. **Mejores Prácticas:**
   - Estándar en la industria
   - Facilita el despliegue en diferentes entornos

---

## 🎓 Conceptos Avanzados de JavaScript

### 1. Async/Await vs Promises

```javascript
// Con Promises (forma antigua)
pool
  .query('SELECT...')
  .then(([rows]) => {
    console.log(rows)
    return pool.query('INSERT...')
  })
  .then(([result]) => {
    console.log(result)
  })
  .catch((error) => {
    console.error(error)
  })

// Con Async/Await (forma moderna)
try {
  const [rows] = await pool.query('SELECT...')
  console.log(rows)
  const [result] = await pool.query('INSERT...')
  console.log(result)
} catch (error) {
  console.error(error)
}
```

**Ventajas de Async/Await:**

- Código más limpio y legible
- Se parece más a código síncrono
- Fácil manejo de errores con try-catch

### 2. Destructuring

```javascript
// Sin destructuring
const nombre = req.body.nombre
const apellido = req.body.apellido
const edad = req.body.edad

// Con destructuring
const { nombre, apellido, edad } = req.body

// En arrays
const result = await pool.query('...')
const rows = result[0]
const metadata = result[1]

// Equivalente con destructuring
const [rows, metadata] = await pool.query('...')
```

### 3. Arrow Functions

```javascript
// Función tradicional
function sumar(a, b) {
  return a + b
}

// Arrow function
const sumar = (a, b) => {
  return a + b
}

// Arrow function (forma corta)
const sumar = (a, b) => a + b

// En callbacks
app.get('/', (req, res) => {
  res.json({ message: 'Hola' })
})
```

### 4. Template Literals

```javascript
// Concatenación tradicional
const mensaje = 'Hola ' + nombre + ', tienes ' + edad + ' años'

// Template literals
const mensaje = `Hola ${nombre}, tienes ${edad} años`

// En SQL
const query = `
  INSERT INTO usuarios (nombre, apellido)
  VALUES (?, ?)
`
```

### 5. Módulos (require vs import)

```javascript
// CommonJS (Node.js tradicional)
const express = require('express')
module.exports = { function1, function2 }

// ES6 Modules (moderno)
import express from 'express'
export { function1, function2 }
```

Este proyecto usa CommonJS porque es el estándar en Node.js.

---

## 📊 Flujo Completo de una Petición

```
1. Cliente hace petición
   ↓
2. Servidor recibe en puerto 3000
   ↓
3. Express ejecuta middlewares:
   - CORS
   - JSON parser
   ↓
4. Express busca la ruta coincidente
   ↓
5. Llama al controlador correspondiente
   ↓
6. Controlador:
   - Valida datos
   - Consulta base de datos
   - Procesa lógica de negocio
   ↓
7. Devuelve respuesta JSON
   ↓
8. Cliente recibe la respuesta
```

### Ejemplo Completo:

```
Cliente:
POST /api/usuarios
Body: {"nombre": "Juan", "apellido": "Pérez", ...}

↓ Middlewares ejecutados
↓ Ruta encontrada: app.use('/api/usuarios', usuariosRoutes)
↓ En usuariosRoutes: router.post('/', createUsuario)
↓
Controlador createUsuario:
  1. Extrae datos de req.body
  2. Valida datos
  3. INSERT INTO usuarios...
  4. Devuelve res.status(201).json({...})
↓
Cliente recibe:
{
  "success": true,
  "message": "Usuario creado",
  "data": {...}
}
```

---

## 🎯 Mejores Prácticas Seguidas en este Proyecto

### 1. Separación de Responsabilidades

- Rutas: Solo definen URLs
- Controladores: Lógica de negocio
- Config: Configuración separada

### 2. Manejo de Errores

- Try-catch en todas las funciones async
- Mensajes de error descriptivos
- Códigos HTTP apropiados

### 3. Seguridad

- Prepared statements (protección contra SQL injection)
- Variables de entorno para credenciales
- CORS configurado

### 4. Transacciones

- Operaciones atómicas para transferencias
- Rollback en caso de error
- Garantía de integridad de datos

### 5. Validaciones

- Validar datos antes de procesar
- Verificar existencia de recursos
- Verificar condiciones de negocio (ej: saldo suficiente)

### 6. Código Limpio

- Nombres descriptivos de variables y funciones
- Comentarios explicativos
- Código formateado consistentemente

---

## 🚀 Próximos Pasos para Aprender Más

### 1. Agregar Autenticación

```javascript
// JWT (JSON Web Tokens)
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
  // Verificar usuario y contraseña
  const token = jwt.sign({ userId: user.id }, 'secret')
  res.json({ token })
}

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization
  const decoded = jwt.verify(token, 'secret')
  req.userId = decoded.userId
  next()
}

router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: `Usuario ${req.userId} autenticado` })
})
```

### 2. Validación con Librerías

```javascript
// express-validator
const { body, validationResult } = require('express-validator')

router.post(
  '/usuarios',
  body('email').isEmail(),
  body('edad').isInt({ min: 18 }),
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    // ... resto del código
  },
)
```

### 3. Paginación

```javascript
const getAllUsuarios = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit

  const [rows] = await pool.query('SELECT * FROM usuarios LIMIT ? OFFSET ?', [
    limit,
    offset,
  ])

  res.json({ data: rows, page, limit })
}
```

### 4. Logging Profesional

```javascript
// winston
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

logger.info('Usuario creado', { userId: 123 })
logger.error('Error en la BD', { error: err.message })
```

---

## 📚 Recursos para Seguir Aprendiendo

### Documentación Oficial:

- **Express**: https://expressjs.com/
- **MySQL2**: https://github.com/sidorares/node-mysql2
- **Node.js**: https://nodejs.org/docs

### Cursos Recomendados:

- freeCodeCamp - Back End Development
- The Odin Project - NodeJS
- MDN Web Docs - JavaScript

### Conceptos a Dominar:

1. **Promesas y Async/Await**
2. **Callbacks**
3. **Middlewares en Express**
4. **RESTful APIs**
5. **Bases de Datos Relacionales**
6. **HTTP y códigos de estado**
7. **Autenticación y Autorización**
8. **Testing (Jest, Mocha)**

---

## ✅ Checklist de Conceptos Cubiertos

- [x] Estructura de proyecto Node.js
- [x] Express.js y middlewares
- [x] Rutas y controladores
- [x] Conexión a MySQL con pool
- [x] Consultas SQL con prepared statements
- [x] Transacciones de base de datos
- [x] Manejo de errores con try-catch
- [x] Async/Await
- [x] Variables de entorno
- [x] API RESTful
- [x] Códigos de estado HTTP
- [x] Validación de datos
- [x] Módulos de Node.js (require/module.exports)
- [x] Arrow functions
- [x] Destructuring
- [x] Template literals
- [x] Tests automatizados

---

## 💡 Conclusión

Este backend es un ejemplo completo y profesional de cómo construir una API REST con Node.js. Has aprendido:

1. **Arquitectura**: Cómo organizar un proyecto backend
2. **Express**: Crear servidor, rutas y middlewares
3. **Bases de Datos**: Conectar, consultar y usar transacciones
4. **JavaScript Moderno**: Async/await, destructuring, arrow functions
5. **Buenas Prácticas**: Seguridad, validación, manejo de errores

¡Sigue practicando y construyendo proyectos! La mejor forma de aprender es haciendo. 🚀

---

**¿Preguntas frecuentes que puedas tener?**

**P: ¿Por qué usar Express en lugar de Node.js puro?**
R: Express simplifica mucho el código. Lo que serían 50 líneas en Node.js puro son 5 líneas con Express.

**P: ¿Es necesario usar async/await?**
R: No es obligatorio, pero hace el código mucho más legible y fácil de mantener.

**P: ¿Cómo aprendo más sobre SQL?**
R: Practica con MySQL Workbench o phpMyAdmin. Empieza con SELECT, INSERT, UPDATE, DELETE.

**P: ¿Es este código listo para producción?**
R: Está muy bien estructurado, pero para producción necesitarías añadir: autenticación, rate limiting, logging más robusto, y tests unitarios.

---

¡Feliz aprendizaje! 🎉
