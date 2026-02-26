const express = require('express')
const router = express.Router()
const movimientosController = require('../controllers/movimientos.controller')

// Rutas para movimientos
router.get('/', movimientosController.getAllMovimientos)
router.get(
  '/usuario/:id_usuario',
  movimientosController.getMovimientosByUsuario,
)
router.post('/abono', movimientosController.createAbono)
router.post('/retirada', movimientosController.createRetirada)
router.post('/transferencia', movimientosController.createTransferencia)

module.exports = router
