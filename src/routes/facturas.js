const express = require('express');
const FacturaController = require('../controllers/facturaController');

const router = express.Router();

/**
 * Rutas para operaciones de facturas electrónicas
 */

/**
 * @route POST /api/facturas/emitir
 * @desc Emite una nueva factura electrónica
 * @access Public
 */
router.post('/emitir', FacturaController.emitirFactura);

/**
 * @route POST /api/facturas/validar
 * @desc Valida una factura o comprobante
 * @access Public
 */
router.post('/validar', FacturaController.validarFactura);

/**
 * @route POST /api/facturas/enviar
 * @desc Envía una factura a Hacienda (simulado)
 * @access Public
 */
router.post('/enviar', FacturaController.enviarFactura);

/**
 * @route GET /api/facturas/status
 * @desc Obtiene el estado del sistema de facturación
 * @access Public
 */
router.get('/status', FacturaController.obtenerEstadoSistema);

/**
 * @route GET /api/facturas
 * @desc Lista todas las facturas con filtros opcionales
 * @query {string} status - Estado de las facturas (all, pending, sent)
 * @query {string} includeContent - Incluir contenido completo (true, false)
 * @query {number} limit - Límite de resultados (máx 100)
 * @query {number} offset - Offset para paginación
 * @access Public
 */
router.get('/', FacturaController.listarFacturas);

/**
 * @route GET /api/facturas/:consecutivo
 * @desc Consulta una factura específica por consecutivo
 * @param {string} consecutivo - Número consecutivo de la factura (20 dígitos)
 * @query {string} includeContent - Incluir contenido completo (true, false)
 * @access Public
 */
router.get('/:consecutivo', FacturaController.consultarFactura);

/**
 * @route DELETE /api/facturas/:consecutivo
 * @desc Elimina una factura (solo en desarrollo)
 * @param {string} consecutivo - Número consecutivo de la factura
 * @access Development only
 */
router.delete('/:consecutivo', FacturaController.eliminarFactura);

module.exports = router;