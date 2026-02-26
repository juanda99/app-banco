-- =============================================
-- MIGRACIÓN: Añadir campos de autenticación
-- =============================================

-- Añadir columnas de autenticación a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL AFTER id_usuario,
ADD COLUMN password_hash VARCHAR(255) NOT NULL AFTER username;

-- Actualizar usuarios existentes con credenciales de prueba
-- Contraseña: "password123" para todos (en producción usar bcrypt)
UPDATE usuarios SET username = 'juan', password_hash = 'password123' WHERE id_usuario = 1;
UPDATE usuarios SET username = 'ana', password_hash = 'password123' WHERE id_usuario = 2;
UPDATE usuarios SET username = 'carlos', password_hash = 'password123' WHERE id_usuario = 3;
