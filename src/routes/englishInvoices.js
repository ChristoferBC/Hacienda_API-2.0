const express = require('express');
const EnglishInvoiceController = require('../controllers/englishInvoiceController');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * English Invoice Routes
 * All routes for international invoice operations in English
 * Base route: /api/en/invoices
 */

/**
 * @route   POST /api/en/invoices/issue
 * @desc    Issue a new electronic invoice (English version)
 * @access  Public
 * @body    {Object} invoiceData - Complete invoice data in English format
 * @returns {Object} Success response with invoice details, key, and consecutive number
 * @example
 * Request Body:
 * {
 *   "documentType": "01",
 *   "currencyCode": "USD",
 *   "exchangeRate": 1,
 *   "issuer": {
 *     "name": "Company Name",
 *     "identification": "123456789",
 *     "identificationType": "02",
 *     "email": "company@example.com"
 *   },
 *   "receiver": {
 *     "name": "Client Name",
 *     "identification": "987654321",
 *     "identificationType": "01",
 *     "email": "client@example.com"
 *   },
 *   "serviceDetail": [...],
 *   "invoiceSummary": {...}
 * }
 */
router.post('/issue', async (req, res) => {
  logger.info('POST /api/en/invoices/issue - English invoice issuance request');
  await EnglishInvoiceController.issueInvoice(req, res);
});

/**
 * @route   POST /api/en/invoices/validate
 * @desc    Validate an English invoice (by key/consecutive or by payload)
 * @access  Public
 * @body    {Object} validationData - Key/consecutive pair or invoice payload
 * @returns {Object} Validation result with status and details
 * @example
 * Request Body Option 1 (Key validation):
 * {
 *   "key": "50612345678901234567890123456789012345678901",
 *   "consecutive": "12345678901234567890"
 * }
 * 
 * Request Body Option 2 (Payload validation):
 * {
 *   "payload": {
 *     "documentType": "01",
 *     "issuer": {...},
 *     "receiver": {...}
 *   }
 * }
 */
router.post('/validate', async (req, res) => {
  logger.info('POST /api/en/invoices/validate - English invoice validation request');
  await EnglishInvoiceController.validateInvoice(req, res);
});

/**
 * @route   POST /api/en/invoices/send
 * @desc    Send an English invoice to tax administration
 * @access  Public
 * @body    {Object} sendData - Key or consecutive number
 * @returns {Object} Send operation result with receipt information
 * @example
 * Request Body:
 * {
 *   "key": "50612345678901234567890123456789012345678901",
 *   "consecutive": "12345678901234567890"
 * }
 */
router.post('/send', async (req, res) => {
  logger.info('POST /api/en/invoices/send - English invoice send request');
  await EnglishInvoiceController.sendInvoice(req, res);
});

/**
 * @route   GET /api/en/invoices/:consecutive
 * @desc    Query a specific invoice by consecutive number (English version)
 * @access  Public
 * @param   {string} consecutive - 20-digit consecutive number
 * @query   {boolean} includeContent - Whether to include full invoice content
 * @returns {Object} Invoice details with English and Spanish formats
 * @example
 * GET /api/en/invoices/12345678901234567890?includeContent=true
 */
router.get('/:consecutive', async (req, res) => {
  const { consecutive } = req.params;
  logger.info(`GET /api/en/invoices/${consecutive} - English invoice query request`);
  await EnglishInvoiceController.queryInvoice(req, res);
});

/**
 * @route   GET /api/en/invoices
 * @desc    List invoices with English metadata and filtering
 * @access  Public
 * @query   {string} status - Filter by status (all, sent, pending, error)
 * @query   {boolean} includeContent - Whether to include invoice content
 * @query   {number} limit - Maximum number of results (default: 50)
 * @query   {number} offset - Pagination offset (default: 0)
 * @returns {Object} Paginated list of invoices with English support
 * @example
 * GET /api/en/invoices?status=sent&limit=20&offset=0&includeContent=false
 */
router.get('/', async (req, res) => {
  logger.info('GET /api/en/invoices - English invoice list request', {
    query: req.query,
  });
  await EnglishInvoiceController.listInvoices(req, res);
});

/**
 * @route   GET /api/en/invoices/health/check
 * @desc    Health check for English invoice API
 * @access  Public
 * @returns {Object} API health status and capabilities
 */
router.get('/health/check', (req, res) => {
  logger.info('GET /api/en/invoices/health/check - English API health check');
  
  res.status(200).json({
    success: true,
    service: 'Hacienda API - English Invoice Service',
    status: 'healthy',
    language: 'english',
    timestamp: new Date().toISOString(),
    capabilities: [
      'invoice_issuance',
      'invoice_validation',
      'invoice_sending',
      'invoice_querying',
      'invoice_listing',
      'english_spanish_conversion',
      'bilingual_support',
    ],
    endpoints: [
      'POST /api/en/invoices/issue',
      'POST /api/en/invoices/validate',
      'POST /api/en/invoices/send',
      'GET /api/en/invoices/:consecutive',
      'GET /api/en/invoices',
      'GET /api/en/invoices/health/check',
    ],
    version: require('../../package.json').version,
    mode: process.env.ATV_MODE || 'SIMULATED',
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Error handler middleware for English routes
 */
router.use((error, req, res, next) => {
  logger.error('English invoice route error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  res.status(error.statusCode || 500).json({
    success: false,
    error: 'English Invoice API Error',
    message: error.message || 'An unexpected error occurred in the English invoice service',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    requestId: req.id || `REQ_${Date.now()}`,
    language: 'english',
    details: process.env.NODE_ENV === 'development' ? {
      stack: error.stack,
      originalError: error,
    } : undefined,
  });
});

/**
 * 404 handler for English routes
 */
router.use('*', (req, res) => {
  logger.warn('English invoice route not found:', {
    path: req.path,
    method: req.method,
    originalUrl: req.originalUrl,
  });

  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: 'The requested English invoice endpoint was not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    language: 'english',
    availableEndpoints: [
      'POST /api/en/invoices/issue',
      'POST /api/en/invoices/validate',
      'POST /api/en/invoices/send',
      'GET /api/en/invoices/:consecutive',
      'GET /api/en/invoices',
      'GET /api/en/invoices/health/check',
    ],
  });
});

module.exports = router;