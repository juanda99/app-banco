# Backend - API REST Banco

API REST para gestión de cuentas bancarias desarrollada con Node.js, Express y MySQL.

## 🚀 Características

- Gestión completa de usuarios (CRUD)
- Gestión de movimientos bancarios
- Operaciones bancarias: abonos, retiradas y transferencias
- Conexión a base de datos MySQL
- Manejo de transacciones atómicas

## 📋 Requisitos previos

- Node.js (v14 o superior)
- MySQL (v8)
- Docker y Docker Compose (opcional)

## 🔧 Instalación

1. Instalar dependencias:

```bash
cd backend
npm install
```

2. Configurar variables de entorno:
   El archivo `.env` ya está configurado con los valores por defecto:

```env
PORT=3000
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=banco
DB_PORT=3306
```

3. Asegurarse de que la base de datos MySQL esté corriendo:

```bash
# Desde el directorio raíz del proyecto
docker compose up -d
```

4. Iniciar el servidor:

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Endpoints de la API

### Autenticación

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "juan",
  "password": "password123"
}

Respuesta exitosa (200):
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "usuario": {
      "id_usuario": 1,
      "username": "juan",
      "nombre": "Juan",
      "apellido": "Pérez",
      "telefono": "+34600111222",
      "saldo_actual": 450.00
    }
  }
}
```

#### Obtener información del usuario autenticado

```http
GET /api/auth/user/:id_usuario

Respuesta (200):
{
  "success": true,
  "data": {
    "usuario": {...}
  }
}
```

**Usuarios de prueba:**

- Username: `juan`, Password: `password123`
- Username: `ana`, Password: `password123`
- Username: `carlos`, Password: `password123`

---

### Usuarios

#### Obtener todos los usuarios

```http
GET /api/usuarios
```

#### Obtener un usuario por ID

```http
GET /api/usuarios/:id
```

#### Crear un nuevo usuario

```http
POST /api/usuarios
Content-Type: application/json

{
  "nombre": "María",
  "apellido": "García",
  "edad": 35,
  "telefono": "+34600777888",
  "saldo_actual": 1000.00
}
```

#### Actualizar un usuario

```http
PUT /api/usuarios/:id
Content-Type: application/json

{
  "nombre": "María",
  "apellido": "García",
  "edad": 36,
  "telefono": "+34600777999"
}
```

#### Eliminar un usuario

```http
DELETE /api/usuarios/:id
```

### Movimientos

#### Obtener todos los movimientos

```http
GET /api/movimientos
```

#### Obtener movimientos de un usuario

```http
GET /api/movimientos/usuario/:id_usuario
```

#### Crear un abono

```http
POST /api/movimientos/abono
Content-Type: application/json

{
  "id_usuario": 1,
  "importe": 100.00,
  "concepto": "Ingreso de nómina"
}
```

#### Crear una retirada

```http
POST /api/movimientos/retirada
Content-Type: application/json

{
  "id_usuario": 1,
  "importe": 50.00,
  "concepto": "Retirada de efectivo"
}
```

#### Crear una transferencia (Bizum)

```http
POST /api/movimientos/transferencia
Content-Type: application/json

{
  "id_usuario_origen": 1,
  "telefono_destino": "+34600333444",
  "importe": 75.00,
  "concepto": "Bizum"
}
```

**Nota:** Las transferencias (Bizum) se realizan mediante número de teléfono. El sistema buscará automáticamente al usuario registrado con ese teléfono.

## 🗂️ Estructura del proyecto

```
backend/
├── config/
│   └── database.js              # Configuración de conexión a MySQL
├── controllers/
│   ├── auth.controller.js       # Login y autenticación
│   ├── usuarios.controller.js   # Lógica de negocio de usuarios
│   └── movimientos.controller.js # Lógica de negocio de movimientos
├── routes/
│   ├── auth.routes.js           # Rutas de autenticación (login)
│   ├── usuarios.routes.js       # Rutas de usuarios
│   └── movimientos.routes.js    # Rutas de movimientos
├── .env                         # Variables de entorno
├── .gitignore                   # Archivos ignorados por Git
├── check-locks.js               # Verificación de bloqueos de base de datos
├── package.json                 # Dependencias del proyecto
├── reset-db.js                  # Script para resetear la base de datos
├── server.js                    # Punto de entrada de la aplicación
└── README.md                    # Este archivo
```

## 🧪 Pruebas de la API

Hay dos formas de probar la API:

### Opción 1: Script automatizado en Node.js (Recomendado)

```bash
npm test
```

Este script ejecutará automáticamente todas las pruebas y mostrará los resultados formateados con colores.

### Opción 2: Script en Bash

```bash
./test-api.sh
```

## 💡 Ejemplos de uso con curl

### Login de usuario

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan",
    "password": "password123"
  }'
```

### Obtener información del usuario autenticado

```bash
curl http://localhost:3000/api/auth/user/1
```

### Obtener todos los usuarios

```bash
curl http://localhost:3000/api/usuarios
```

### Crear un nuevo usuario

```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pedro",
    "apellido": "Martínez",
    "edad": 28,
    "telefono": "+34611222333",
    "saldo_actual": 500.00
  }'
```

### Realizar un abono

```bash
curl -X POST http://localhost:3000/api/movimientos/abono \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "importe": 200.00,
    "concepto": "Ingreso"
  }'
```

### Realizar una transferencia (Bizum)

```bash
curl -X POST http://localhost:3000/api/movimientos/transferencia \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario_origen": 1,
    "telefono_destino": "+34600333444",
    "importe": 50.00,
    "concepto": "Pago entre amigos"
  }'
```

## 🔒 Características de seguridad y validación

- **Validación de datos de entrada:** Todos los endpoints validan que los datos requeridos estén presentes
- **Transacciones atómicas:** Todas las operaciones bancarias se ejecutan en transacciones para garantizar la integridad
- **Verificación de saldo:** El sistema verifica que haya saldo suficiente antes de retiradas y transferencias
- **Validación de teléfonos:** Las transferencias (Bizum) verifican que el teléfono destino esté registrado
- **Prevención de auto-transferencias:** No se permite enviar Bizum a tu propio número
- **Manejo de errores robusto:** Respuestas claras y específicas para cada tipo de error

### Códigos de error comunes

- **400 Bad Request:** Datos inválidos o saldo insuficiente
- **404 Not Found:** Usuario o teléfono no encontrado
- **500 Internal Server Error:** Error del servidor

## 🛠️ Tecnologías utilizadas

- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **MySQL2** - Driver de MySQL con soporte para Promises
- **dotenv** - Gestión de variables de entorno
- **cors** - Middleware para habilitar CORS

## 📝 Notas

- Todas las operaciones bancarias (abonos, retiradas, transferencias) se realizan dentro de transacciones para garantizar la integridad de los datos
- Los saldos se actualizan automáticamente al realizar operaciones
- Las transferencias crean dos movimientos: uno de salida y otro de entrada

## 🤝 Contribuir

Si deseas contribuir al proyecto, por favor:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
