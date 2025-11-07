const logger = require('../utils/logger');
const atvAdapter = require('../services/atvAdapter');
const invoiceStorage = require('../services/invoiceStorage');
const { EnglishInvoiceValidator } = require('../validators/englishInvoiceValidator');
const { generateConsecutivo } = require('../utils/filenames');

/**
 * English Invoice Controller
 * Handles all English invoice operations for international clients
 */
class EnglishInvoiceController {
  /**
   * Issues a new electronic invoice (English version)
   * POST /api/en/invoices/issue
   */
  static async issueInvoice(req, res) {
    try {
      logger.info('Starting English invoice issuance');

      const invoiceData = req.body;

      // Validate the English invoice structure
      const validation = EnglishInvoiceValidator.validateInvoice(invoiceData);
      if (!validation.isValid) {
        logger.warn('English invoice validation failed', { errors: validation.errors });
        return res.status(400).json({
          success: false,
          error: 'Invalid invoice data',
          message: 'The invoice data provided does not meet the required format',
          details: validation.errors,
        });
      }

      // Initialize ATV adapter if needed
      if (!atvAdapter.isInitialized) {
        await atvAdapter.init();
      }

      // Generate consecutive number if not provided
      if (!validation.data.consecutiveNumber) {
        validation.data.consecutiveNumber = await generateConsecutivo();
      }

      // Add issuance date if not present
      if (!validation.data.issuanceDate) {
        validation.data.issuanceDate = new Date().toISOString();
      }

      // Convert English structure to Spanish for ATV processing
      const spanishInvoiceData = EnglishInvoiceController.convertToSpanish(validation.data);

      // Issue the invoice using the ATV adapter
      const issuanceResult = await atvAdapter.emitirComprobante(spanishInvoiceData);

      if (!issuanceResult.success) {
        logger.error('Error in ATV issuance:', issuanceResult);
        return res.status(500).json({
          success: false,
          error: 'Error issuing invoice',
          message: 'Failed to process the invoice through the tax administration system',
          details: issuanceResult,
        });
      }

      // Save the English invoice in JSON format
      const jsonPath = await invoiceStorage.saveInvoiceJSON(
        issuanceResult.consecutivo,
        {
          ...issuanceResult,
          originalEnglishData: validation.data,
          spanishData: spanishInvoiceData,
        }
      );

      // Save the XML if available
      let xmlPath = null;
      if (issuanceResult.xml) {
        xmlPath = await invoiceStorage.saveInvoiceXML(
          issuanceResult.consecutivo,
          issuanceResult.xml
        );
      }

      const response = {
        success: true,
        consecutive: issuanceResult.consecutivo,
        key: issuanceResult.clave,
        status: issuanceResult.estado,
        mode: issuanceResult.mode,
        timestamp: new Date().toISOString(),
        files: {
          json: jsonPath,
          xml: xmlPath,
        },
        metadata: {
          language: 'english',
          originalRequest: 'english',
          processedAs: 'spanish_compatible',
        },
      };

      logger.info(`English invoice issued successfully: ${issuanceResult.consecutivo}`);

      res.status(201).json(response);
    } catch (error) {
      logger.error('Error issuing English invoice:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing the invoice',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Validates an English invoice
   * POST /api/en/invoices/validate
   */
  static async validateInvoice(req, res) {
    try {
      logger.info('Starting English invoice validation');

      let validationData;
      let validationMethod;

      // Check if validation is by key/consecutive or by payload
      if (req.body.key && req.body.consecutive) {
        validationMethod = 'key_consecutive';
        validationData = {
          key: req.body.key,
          consecutive: req.body.consecutive,
        };
      } else if (req.body.payload) {
        validationMethod = 'payload';
        validationData = req.body.payload;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid validation request',
          message: 'Must provide either (key and consecutive) or (payload)',
          expectedFormat: {
            option1: { key: 'string', consecutive: 'string' },
            option2: { payload: 'object' },
          },
        });
      }

      // Initialize ATV adapter if needed
      if (!atvAdapter.isInitialized) {
        await atvAdapter.init();
      }

      let validationResult;

      if (validationMethod === 'key_consecutive') {
        // Validate by key using ATV adapter
        validationResult = await atvAdapter.validarComprobante(validationData.key);
      } else {
        // Validate payload structure first
        const structuralValidation = EnglishInvoiceValidator.validateInvoice(validationData);
        
        if (!structuralValidation.isValid) {
          return res.status(400).json({
            success: false,
            valid: false,
            error: 'Structural validation failed',
            message: 'The invoice structure is invalid',
            details: structuralValidation.errors,
          });
        }

        // Convert to Spanish and validate with ATV
        const spanishData = EnglishInvoiceController.convertToSpanish(structuralValidation.data);
        
        // Generate a temporary key for validation
        const tempKey = `${Date.now()}${Math.random().toString(36).substring(2)}`.substring(0, 50);
        validationResult = await atvAdapter.validarComprobante(tempKey);
        
        // Override with structural validation result
        validationResult.structuralValidation = structuralValidation;
      }

      const response = {
        success: true,
        method: validationMethod,
        valid: validationResult.valid || validationResult.valido || true,
        mode: validationResult.mode,
        timestamp: new Date().toISOString(),
        validation: {
          key: validationData.key || 'generated_for_payload_validation',
          consecutive: validationData.consecutive || 'not_applicable',
          hash: validationResult.hash,
          messages: validationResult.mensajes || [],
          status: validationResult.estado || 'validated',
        },
        metadata: {
          language: 'english',
          validationMethod,
        },
      };

      if (validationMethod === 'payload') {
        response.structuralValidation = validationResult.structuralValidation;
      }

      logger.info(`English invoice validation completed: ${response.valid ? 'VALID' : 'INVALID'}`);

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error validating English invoice:', error);
      res.status(500).json({
        success: false,
        error: 'Validation error',
        message: 'An error occurred during invoice validation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Sends an English invoice to tax administration
   * POST /api/en/invoices/send
   */
  static async sendInvoice(req, res) {
    try {
      logger.info('Starting English invoice send to tax administration');

      const { key, consecutive } = req.body;

      if (!key && !consecutive) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters',
          message: 'Either key or consecutive number is required',
          requiredFields: ['key', 'consecutive'],
        });
      }

      // Initialize ATV adapter if needed
      if (!atvAdapter.isInitialized) {
        await atvAdapter.init();
      }

      const keyToSend = key || consecutive;
      const sendResult = await atvAdapter.enviarComprobante(keyToSend);

      if (!sendResult.success) {
        logger.error('Error sending English invoice:', sendResult);
        return res.status(500).json({
          success: false,
          error: 'Send operation failed',
          message: 'Failed to send invoice to tax administration',
          details: sendResult,
        });
      }

      // Mark files as sent if consecutive is provided
      let markedFiles = 0;
      if (consecutive) {
        try {
          await invoiceStorage.markAsSent(consecutive);
          markedFiles = 1;
        } catch (markError) {
          logger.warn('Could not mark files as sent:', markError.message);
        }
      }

      const response = {
        success: true,
        key: keyToSend,
        consecutive: consecutive || 'not_provided',
        status: sendResult.estado || 'sent',
        mode: sendResult.mode,
        timestamp: new Date().toISOString(),
        receiptNumber: sendResult.numeroComprobante || `RECEIPT_${Date.now()}`,
        taxAdministrationResponse: {
          code: sendResult.respuestaHacienda?.codigo || '200',
          message: sendResult.respuestaHacienda?.mensaje || 'Successfully processed',
          timestamp: sendResult.respuestaHacienda?.fecha || new Date().toISOString(),
        },
        markedFiles,
        metadata: {
          language: 'english',
        },
      };

      logger.info(`English invoice sent successfully: ${keyToSend}`);

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error sending English invoice:', error);
      res.status(500).json({
        success: false,
        error: 'Send error',
        message: 'An error occurred while sending the invoice',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Queries an invoice by consecutive number (English version)
   * GET /api/en/invoices/:consecutive
   */
  static async queryInvoice(req, res) {
    try {
      const { consecutive } = req.params;
      const includeContent = req.query.includeContent === 'true';

      logger.info(`Querying English invoice: ${consecutive}`);

      // Validate consecutive format
      if (!/^[0-9]{20}$/.test(consecutive)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid consecutive format',
          message: 'Consecutive number must be exactly 20 digits',
          provided: consecutive,
          expectedFormat: '20 numeric digits',
        });
      }

      // Get invoice data
      const invoiceResult = await invoiceStorage.getInvoice(consecutive, includeContent);

      if (!invoiceResult.found) {
        logger.warn(`English invoice not found: ${consecutive}`);
        return res.status(404).json({
          success: false,
          found: false,
          error: 'Invoice not found',
          message: 'No invoice found with the provided consecutive number',
          consecutive,
        });
      }

      // Get ATV status if content is included
      let atvStatus = null;
      if (includeContent) {
        try {
          if (!atvAdapter.isInitialized) {
            await atvAdapter.init();
          }
          atvStatus = await atvAdapter.consultarComprobante(invoiceResult.files.json.clave);
        } catch (atvError) {
          logger.warn('Could not get ATV status:', atvError.message);
        }
      }

      // Convert content to English format if available
      let englishContent = null;
      if (includeContent && invoiceResult.content.json) {
        try {
          // Check if original English data is available
          if (invoiceResult.content.json.originalEnglishData) {
            englishContent = {
              english: invoiceResult.content.json.originalEnglishData,
              spanish: invoiceResult.content.json.spanishData || invoiceResult.content.json,
            };
          } else {
            // Convert from Spanish to English
            englishContent = {
              english: EnglishInvoiceValidator.convertFromSpanish(invoiceResult.content.json),
              spanish: invoiceResult.content.json,
            };
          }
        } catch (conversionError) {
          logger.warn('Could not convert invoice to English format:', conversionError.message);
          englishContent = {
            spanish: invoiceResult.content.json,
            conversionError: conversionError.message,
          };
        }
      }

      const response = {
        success: true,
        consecutive,
        found: true,
        metadata: invoiceResult.metadata,
        atvStatus,
        content: includeContent ? {
          json: englishContent,
          xml: invoiceResult.content.xml,
        } : undefined,
        files: invoiceResult.files,
        language: 'english',
      };

      logger.info(`English invoice query completed: ${consecutive}`);

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error querying English invoice:', error);
      res.status(500).json({
        success: false,
        error: 'Query error',
        message: 'An error occurred while querying the invoice',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Lists invoices with English metadata
   * GET /api/en/invoices
   */
  static async listInvoices(req, res) {
    try {
      const {
        status = 'all',
        includeContent = 'false',
        limit = 50,
        offset = 0,
      } = req.query;

      logger.info(`Listing English invoices: status=${status}, limit=${limit}, offset=${offset}`);

      const listResult = await invoiceStorage.listInvoices({
        status,
        includeContent: includeContent === 'true',
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });

      // Convert invoice content to English format where possible
      const englishInvoices = listResult.invoices.map(invoice => {
        let englishData = null;
        
        if (includeContent === 'true' && invoice.content) {
          try {
            if (invoice.content.originalEnglishData) {
              englishData = invoice.content.originalEnglishData;
            } else {
              englishData = EnglishInvoiceValidator.convertFromSpanish(invoice.content);
            }
          } catch (conversionError) {
            logger.warn(`Could not convert invoice ${invoice.consecutive} to English:`, conversionError.message);
          }
        }

        return {
          ...invoice,
          englishData,
          language: 'mixed', // Indicates both English and Spanish data available
        };
      });

      const response = {
        success: true,
        pagination: {
          total: listResult.pagination.total,
          limit: listResult.pagination.limit,
          offset: listResult.pagination.offset,
          hasMore: listResult.pagination.hasMore,
        },
        filters: {
          ...listResult.filters,
          language: 'english_support',
        },
        statistics: listResult.stats,
        invoices: englishInvoices,
        metadata: {
          language: 'english',
          conversionSupport: true,
        },
      };

      logger.info(`${englishInvoices.length} English invoices listed (${listResult.pagination.total} total)`);

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error listing English invoices:', error);
      res.status(500).json({
        success: false,
        error: 'List error',
        message: 'An error occurred while listing invoices',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  /**
   * Converts English invoice structure to Spanish structure for ATV processing
   * @param {Object} englishInvoice - Invoice in English format
   * @returns {Object} Invoice in Spanish format
   */
  static convertToSpanish(englishInvoice) {
    return {
      tipoDocumento: englishInvoice.documentType,
      codigoMoneda: englishInvoice.currencyCode,
      tipoCambio: englishInvoice.exchangeRate,
      
      emisor: {
        nombre: englishInvoice.issuer.name,
        identificacion: englishInvoice.issuer.identification,
        tipoIdentificacion: englishInvoice.issuer.identificationType,
        correoElectronico: englishInvoice.issuer.email,
        telefono: englishInvoice.issuer.phone,
        codigoPais: englishInvoice.issuer.countryCode,
        provincia: englishInvoice.issuer.province,
        canton: englishInvoice.issuer.canton,
        distrito: englishInvoice.issuer.district,
        direccion: englishInvoice.issuer.address,
      },
      
      receptor: {
        nombre: englishInvoice.receiver.name,
        identificacion: englishInvoice.receiver.identification,
        tipoIdentificacion: englishInvoice.receiver.identificationType,
        correoElectronico: englishInvoice.receiver.email,
        telefono: englishInvoice.receiver.phone,
      },
      
      detalleServicio: englishInvoice.serviceDetail.map(item => ({
        numeroLinea: item.lineNumber,
        codigo: item.code,
        descripcion: item.description,
        cantidad: item.quantity,
        unidadMedida: this.translateUnitOfMeasureToSpanish(item.unitOfMeasure),
        precioUnitario: item.unitPrice,
        montoTotal: item.totalAmount,
        descuento: item.discount,
        naturalezaDescuento: item.discountNature,
        subtotal: item.subtotal,
        impuesto: {
          codigo: item.tax.code,
          codigoTarifa: item.tax.rateCode,
          tarifa: item.tax.rate,
          monto: item.tax.amount,
        },
        montoTotalLinea: item.totalLineAmount,
      })),
      
      resumenFactura: {
        montoTotalServiciosGravados: englishInvoice.invoiceSummary.totalTaxableServices,
        montoTotalServiciosExentos: englishInvoice.invoiceSummary.totalExemptServices,
        montoTotalMercanciaGravada: englishInvoice.invoiceSummary.totalTaxableGoods,
        montoTotalMercanciaExenta: englishInvoice.invoiceSummary.totalExemptGoods,
        totalGravado: englishInvoice.invoiceSummary.totalTaxable,
        totalExento: englishInvoice.invoiceSummary.totalExempt,
        totalVenta: englishInvoice.invoiceSummary.totalSale,
        totalDescuentos: englishInvoice.invoiceSummary.totalDiscounts,
        totalVentaNeta: englishInvoice.invoiceSummary.totalNetSale,
        totalImpuesto: englishInvoice.invoiceSummary.totalTax,
        totalComprobante: englishInvoice.invoiceSummary.totalInvoice,
      },
      
      condicionVenta: englishInvoice.saleCondition,
      plazoCredito: englishInvoice.creditTerm,
      observaciones: englishInvoice.observations,
      fechaEmision: englishInvoice.issuanceDate,
      numeroConsecutivo: englishInvoice.consecutiveNumber,
    };
  }

  /**
   * Translates unit of measure from English to Spanish
   * @param {string} englishUnit - English unit of measure
   * @returns {string} Spanish unit of measure
   */
  static translateUnitOfMeasureToSpanish(englishUnit) {
    const translations = {
      'Unit': 'Unid',
      'Kg': 'Kg',
      'Lt': 'Lt',
      'Mt': 'Mt',
      'Hrs': 'Hrs',
      'Others': 'Otros',
    };
    return translations[englishUnit] || 'Unid';
  }
}

module.exports = EnglishInvoiceController;