
-- =============================================
-- Tabla usuarios
-- =============================================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    edad INT NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    saldo_actual DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- =============================================
-- Tabla movimientos
-- =============================================
CREATE TABLE movimientos (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    tipo ENUM('abono','retirada','transferencia') NOT NULL,
    direccion ENUM('entrada','salida') NOT NULL,
    importe DECIMAL(10,2) NOT NULL,
    saldo_final DECIMAL(10,2) NOT NULL,
    concepto VARCHAR(255),
    id_usuario_relacionado INT NULL,

    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_usuario_relacionado) REFERENCES usuarios(id_usuario)
);

-- =============================================
-- Datos de prueba: usuarios
-- =============================================
-- Contraseña para todos: "password123"
INSERT INTO usuarios (username, password_hash, nombre, apellido, edad, telefono, saldo_actual) VALUES
('juan', 'password123', 'Juan', 'Pérez', 30, '+34600111222', 450.00),
('ana', 'password123', 'Ana', 'López', 28, '+34600333444', 950.00),
('carlos', 'password123', 'Carlos', 'Ruiz', 40, '+34600555666', 300.00);

-- =============================================
-- Datos de prueba: movimientos
-- =============================================

-- Abono inicial Juan
INSERT INTO movimientos
(id_usuario, fecha_hora, tipo, direccion, importe, saldo_final, concepto, id_usuario_relacionado)
VALUES
(1, '2026-02-17 09:00:00', 'abono', 'entrada', 500.00, 500.00, 'Ingreso inicial', NULL);

-- Retirada Juan
INSERT INTO movimientos
(id_usuario, fecha_hora, tipo, direccion, importe, saldo_final, concepto, id_usuario_relacionado)
VALUES
(1, '2026-02-17 10:00:00', 'retirada', 'salida', 50.00, 450.00, 'Retirada cajero', NULL);

-- Transferencia Juan -> Ana (Bizum)
INSERT INTO movimientos
(id_usuario, fecha_hora, tipo, direccion, importe, saldo_final, concepto, id_usuario_relacionado)
VALUES
(1, '2026-02-17 11:00:00', 'transferencia', 'salida', 50.00, 450.00, 'Bizum a Ana López', 2);

INSERT INTO movimientos
(id_usuario, fecha_hora, tipo, direccion, importe, saldo_final, concepto, id_usuario_relacionado)
VALUES
(2, '2026-02-17 11:00:00', 'transferencia', 'entrada', 50.00, 1050.00, 'Bizum de Juan Pérez', 1);

-- Transferencia Ana -> Carlos
INSERT INTO movimientos
(id_usuario, fecha_hora, tipo, direccion, importe, saldo_final, concepto, id_usuario_relacionado)
VALUES
(2, '2026-02-17 12:30:00', 'transferencia', 'salida', 100.00, 950.00, 'Bizum a Carlos Ruiz', 3);

INSERT INTO movimientos
(id_usuario, fecha_hora, tipo, direccion, importe, saldo_final, concepto, id_usuario_relacionado)
VALUES
(3, '2026-02-17 12:30:00', 'transferencia', 'entrada', 100.00, 300.00, 'Bizum de Ana López', 2);
