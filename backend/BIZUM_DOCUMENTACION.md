# Sistema de Transferencias Bizum - Documentación

## 📱 Características del Sistema Bizum

El sistema de transferencias ha sido implementado siguiendo el modelo de Bizum, donde las transferencias se realizan **mediante número de teléfono** en lugar de IDs de usuario.

## 🔄 Endpoint de Transferencia (Bizum)

### POST /api/movimientos/transferencia

Realiza una transferencia de dinero entre dos usuarios utilizando el número de teléfono del destinatario.

**Request Body:**

```json
{
  "id_usuario_origen": 1,
  "telefono_destino": "+34600333444",
  "importe": 50.0,
  "concepto": "Bizum - Cena" // Opcional
}
```

**Respuesta Exitosa (201):**

```json
{
  "success": true,
  "message": "Bizum realizado exitosamente",
  "data": {
    "usuario_origen": {
      "id": 1,
      "nombre": "Juan Pérez",
      "saldo_anterior": "500.00",
      "saldo_nuevo": 450
    },
    "usuario_destino": {
      "id": 2,
      "nombre": "Ana López",
      "telefono": "+34600333444",
      "saldo_anterior": "300.00",
      "saldo_nuevo": 350
    }
  }
}
```

## ❌ Casos de Error Implementados

### 1. Teléfono No Registrado (404)

Cuando el número de teléfono destino no existe en el sistema:

```json
{
  "success": false,
  "message": "El número de teléfono destino no está registrado en el sistema"
}
```

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/api/movimientos/transferencia \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario_origen": 1,
    "telefono_destino": "+34999999999",
    "importe": 10.00
  }'
```

### 2. Saldo Insuficiente en Transferencia (400)

Cuando el usuario origen no tiene suficiente saldo:

```json
{
  "success": false,
  "message": "Saldo insuficiente para realizar la transferencia"
}
```

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/api/movimientos/transferencia \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario_origen": 3,
    "telefono_destino": "+34600111222",
    "importe": 99999.00
  }'
```

### 3. Saldo Insuficiente en Retirada (400)

Cuando el usuario intenta retirar más dinero del disponible:

```json
{
  "success": false,
  "message": "Saldo insuficiente para realizar la retirada"
}
```

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/api/movimientos/retirada \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 1,
    "importe": 99999.00
  }'
```

### 4. Bizum a Tu Propio Número (400)

Cuando intentas enviar Bizum a tu propio teléfono:

```json
{
  "success": false,
  "message": "No se puede transferir a la misma cuenta"
}
```

### 5. Datos Inválidos (400)

Cuando faltan campos requeridos o los valores son inválidos:

```json
{
  "success": false,
  "message": "id_usuario_origen, telefono_destino e importe (mayor a 0) son requeridos"
}
```

### 6. Usuario No Encontrado (404)

Cuando el usuario origen no existe:

```json
{
  "success": false,
  "message": "Usuario origen no encontrado"
}
```

## 🧪 Tests Automatizados

Ejecuta la suite completa de tests con:

```bash
npm test
```

### Tests de Funcionalidad (8)

1. ✅ Obtener todos los usuarios
2. ✅ Obtener un usuario específico
3. ✅ Obtener movimientos de un usuario
4. ✅ Crear un nuevo usuario
5. ✅ Realizar un abono
6. ✅ Realizar una retirada
7. ✅ Realizar un Bizum (con número de teléfono)
8. ✅ Verificar saldos actualizados

### Tests de Errores (6)

9. ✅ Bizum a teléfono no registrado
10. ✅ Retirada con saldo insuficiente
11. ✅ Bizum con saldo insuficiente
12. ✅ Bizum a tu propio teléfono
13. ✅ Abono con importe negativo
14. ✅ Usuario no encontrado

## 🔐 Validaciones de Seguridad

El sistema implementa las siguientes validaciones:

1. **Verificación de teléfono:** Se valida que el número de teléfono destino exista en el sistema
2. **Validación de saldo:** Se verifica que haya saldo suficiente antes de cualquier operación de salida
3. **Prevención de auto-transferencias:** No se permite enviar Bizum a tu propio número
4. **Transacciones atómicas:** Todas las operaciones bancarias usan transacciones para garantizar integridad
5. **Liberación de conexiones:** Se asegura que todas las conexiones a la base de datos se liberen correctamente
6. **Validación de datos:** Se verifican todos los campos requeridos antes de procesar

## 📊 Flujo de una Transferencia Bizum

```
1. Usuario origen envía Bizum con teléfono destino
   ↓
2. Sistema valida datos (origen, teléfono, importe)
   ↓
3. Sistema busca usuario con ese teléfono
   ↓
4. Sistema verifica saldo suficiente
   ↓
5. Inicia transacción atómica
   ↓
6. Actualiza saldo de origen (resta)
   ↓
7. Actualiza saldo de destino (suma)
   ↓
8. Registra movimiento de salida
   ↓
9. Registra movimiento de entrada
   ↓
10. Commit de transacción
    ↓
11. Retorna confirmación con detalles
```

## 💡 Ejemplos Prácticos

### Enviar un Bizum exitoso

```bash
curl -X POST http://localhost:3000/api/movimientos/transferencia \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario_origen": 1,
    "telefono_destino": "+34600333444",
    "importe": 25.00,
    "concepto": "Pago cena"
  }'
```

### Ver movimientos de un usuario

```bash
curl http://localhost:3000/api/movimientos/usuario/1
```

### Verificar saldo actual

```bash
curl http://localhost:3000/api/usuarios/1
```

## 🔍 Códigos de Estado HTTP

- **200 OK:** Petición exitosa (GET)
- **201 Created:** Recurso creado exitosamente (POST)
- **400 Bad Request:** Datos inválidos o saldo insuficiente
- **404 Not Found:** Recurso no encontrado (usuario o teléfono)
- **500 Internal Server Error:** Error del servidor

## 📝 Notas Importantes

- Todos los importes deben ser números positivos mayores que 0
- Los números de teléfono deben incluir el prefijo internacional (ej: +34)
- Las transferencias son inmediatas y se reflejan en tiempo real
- El concepto es opcional; si no se proporciona, se genera automáticamente
- Todas las operaciones generan registros en la tabla de movimientos
