const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')

// POST /api/auth/login - Login de usuario
router.post('/login', authController.login)

// GET /api/auth/user/:id_usuario - Obtener info del usuario
router.get('/user/:id_usuario', authController.getUsuarioInfo)

module.exports = router
