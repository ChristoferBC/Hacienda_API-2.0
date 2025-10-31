const atvAdapter = require('../services/atvAdapter');
const invoiceStorage = require('../services/invoiceStorage');
const FacturaValidator = require('../validators/facturaValidator');
const logger = require('../utils/logger');
const { generateConsecutivo } = require('../utils/filenames');

/**
 * Controlador para operaciones de facturas electrónicas
 * Maneja la emisión, validación, envío y consulta de comprobantes
 */
class FacturaController {
  /**
   * Emite una nueva factura electrónica
   * POST /api/facturas/emitir
   */
  static async emitirFactura(req, res) {
    try {
      logger.info('Iniciando emisión de factura');

      // Validar payload de entrada
      const validationResult = FacturaValidator.validateFactura(req.body);
      if (!validationResult.valid) {
        logger.warn('Validación de factura fallida:', validationResult.errors);
        return res.status(400).json({
          success: false,
          error: 'Datos de factura inválidos',
          details: validationResult.errors,
        });
      }

      const facturaData = validationResult.data;

      // Asegurar que el adaptador esté inicializado
      if (!atvAdapter.isInitialized) {
        await atvAdapter.init();
      }

      // Generar consecutivo si no está presente
      if (!facturaData.numeroConsecutivo) {
        facturaData.numeroConsecutivo = await generateConsecutivo();
      }

      // Agregar fecha de emisión si no está presente
      if (!facturaData.fechaEmision) {
        facturaData.fechaEmision = new Date().toISOString();
      }

      // Emitir el comprobante usando el adaptador ATV
      const resultadoEmision = await atvAdapter.emitirComprobante(facturaData);

      if (!resultadoEmision.success) {
        logger.error('Error en emisión ATV:', resultadoEmision);
        return res.status(500).json({
          success: false,
          error: 'Error al emitir comprobante',
          details: resultadoEmision,
        });
      }

      // Guardar la factura en formato JSON
      const rutaJSON = await invoiceStorage.saveInvoiceJSON(
        resultadoEmision.consecutivo,
        resultadoEmision
      );

      // Guardar el XML si está disponible
      let rutaXML = null;
      if (resultadoEmision.xml) {
        rutaXML = await invoiceStorage.saveInvoiceXML(
          resultadoEmision.consecutivo,
          resultadoEmision.xml
        );
      }

      const response = {
        success: true,
        consecutivo: resultadoEmision.consecutivo,
        clave: resultadoEmision.clave,
        estado: resultadoEmision.estado,
        mode: resultadoEmision.mode,
        timestamp: resultadoEmision.timestamp,
        archivos: {
          json: rutaJSON,
          xml: rutaXML,
        },
        metadata: resultadoEmision.metadata || {},
      };

      logger.info(`Factura emitida exitosamente: ${resultadoEmision.consecutivo}`);
      res.status(201).json(response);
    } catch (error) {
      logger.error('Error al emitir factura:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
      });
    }
  }

  /**
   * Valida una factura o comprobante
   * POST /api/facturas/validar
   */
  static async validarFactura(req, res) {
    try {
      logger.info('Iniciando validación de factura');

      const { clave, consecutivo, payload } = req.body;

      // Validar que se proporcione clave, consecutivo o payload
      if (!clave && !consecutivo && !payload) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar clave, consecutivo o payload para validar',
        });
      }

      let claveAValidar = clave;
      let resultadoValidacion;

      // Si se proporciona payload, validarlo estructuralmente primero
      if (payload) {
        const validacionEstructural = FacturaValidator.validateFactura(payload);
        if (!validacionEstructural.valid) {
          return res.status(400).json({
            success: false,
            error: 'Payload inválido',
            details: validacionEstructural.errors,
          });
        }

        // Si no hay clave, generar una temporal para la validación
        if (!claveAValidar && !consecutivo) {
          logger.info('Validando payload sin clave - validación estructural únicamente');
          return res.json({
            success: true,
            validacionEstructural: {
              valid: true,
              errors: [],
            },
            modo: 'ESTRUCTURAL_SOLAMENTE',
            message: 'Validación estructural exitosa. Para validación completa proporcione clave o consecutivo.',
          });
        }
      }

      // Si se proporciona consecutivo pero no clave, buscar la factura
      if (consecutivo && !claveAValidar) {
        try {
          const facturaGuardada = await invoiceStorage.getInvoice(consecutivo);
          if (facturaGuardada && facturaGuardada.files && facturaGuardada.files.json) {
            claveAValidar = facturaGuardada.files.json.clave;
            logger.info(`Clave obtenida del consecutivo ${consecutivo}: ${claveAValidar}`);
          }
        } catch (error) {
          logger.warn(`No se pudo obtener clave del consecutivo ${consecutivo}:`, error.message);
        }
      }

      if (!claveAValidar) {
        return res.status(400).json({
          success: false,
          error: 'No se pudo determinar la clave para validar',
        });
      }

      // Validar formato de clave
      const claveValidation = FacturaValidator.validateClave(claveAValidar);
      if (!claveValidation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Formato de clave inválido',
          details: claveValidation.errors,
        });
      }

      // Asegurar que el adaptador esté inicializado
      if (!atvAdapter.isInitialized) {
        await atvAdapter.init();
      }

      // Validar usando el adaptador ATV
      resultadoValidacion = await atvAdapter.validarComprobante(claveAValidar);

      const response = {
        success: resultadoValidacion.success,
        clave: claveAValidar,
        consecutivo: consecutivo || null,
        valid: resultadoValidacion.valid,
        mode: resultadoValidacion.mode,
        timestamp: resultadoValidacion.timestamp,
        hash: resultadoValidacion.hash,
        mensajes: resultadoValidacion.mensajes || [],
        estado: resultadoValidacion.estado,
      };

      // Si también se validó payload, incluir resultado estructural
      if (payload) {
        response.validacionEstructural = {
          valid: true,
          errors: [],
        };
      }

      logger.info(`Factura validada: ${claveAValidar}, válida: ${resultadoValidacion.valid}`);
      res.json(response);
    } catch (error) {
      logger.error('Error al validar factura:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
      });
    }
  }

  /**
   * Envía una factura a Hacienda (simulado)
   * POST /api/facturas/enviar
   */
  static async enviarFactura(req, res) {
    try {
      logger.info('Iniciando envío de factura');

      const { clave, consecutivo } = req.body;

      // Validar que se proporcione clave o consecutivo
      if (!clave && !consecutivo) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar clave o consecutivo para enviar',
        });
      }

      let claveAEnviar = clave;
      let consecutivoAEnviar = consecutivo;

      // Si se proporciona consecutivo pero no clave, buscar la factura
      if (consecutivo && !claveAEnviar) {
        try {
          const facturaGuardada = await invoiceStorage.getInvoice(consecutivo);
          if (facturaGuardada && facturaGuardada.files && facturaGuardada.files.json) {
            claveAEnviar = facturaGuardada.files.json.clave;
            consecutivoAEnviar = consecutivo;
            logger.info(`Clave obtenida del consecutivo ${consecutivo}: ${claveAEnviar}`);
          } else {
            throw new Error('Factura no encontrada');
          }
        } catch (error) {
          return res.status(404).json({
            success: false,
            error: 'Factura no encontrada',
            message: error.message,
          });
        }
      }

      // Si se proporciona clave pero no consecutivo, intentar extraerlo
      if (claveAEnviar && !consecutivoAEnviar) {
        // En una implementación real, se podría extraer el consecutivo de la clave
        // Por simplicidad, buscaremos en storage
        logger.warn('Enviando con clave pero sin consecutivo - funcionalidad limitada para marcar como enviado');
      }

      // Validar formato de clave
      const claveValidation = FacturaValidator.validateClave(claveAEnviar);
      if (!claveValidation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Formato de clave inválido',
          details: claveValidation.errors,
        });
      }

      // Asegurar que el adaptador esté inicializado
      if (!atvAdapter.isInitialized) {
        await atvAdapter.init();
      }

      // Enviar usando el adaptador ATV (simulado)
      const resultadoEnvio = await atvAdapter.enviarComprobante(claveAEnviar);

      if (!resultadoEnvio.success) {
        logger.error('Error en envío ATV:', resultadoEnvio);
        return res.status(500).json({
          success: false,
          error: 'Error al enviar comprobante',
          details: resultadoEnvio,
        });
      }

      // Marcar factura como enviada si tenemos el consecutivo
      let resultadoMarcado = null;
      if (consecutivoAEnviar) {
        try {
          resultadoMarcado = await invoiceStorage.markAsSent(consecutivoAEnviar, {
            envioAt: resultadoEnvio.timestamp,
            respuestaHacienda: resultadoEnvio.respuestaHacienda,
            numeroComprobante: resultadoEnvio.numeroComprobante,
            mode: resultadoEnvio.mode,
          });
          logger.info(`Factura marcada como enviada: ${consecutivoAEnviar}`);
        } catch (error) {
          logger.warn('Error al marcar factura como enviada:', error.message);
          // No fallar el envío por este error
        }
      }

      const response = {
        success: true,
        clave: claveAEnviar,
        consecutivo: consecutivoAEnviar,
        estado: resultadoEnvio.estado,
        mode: resultadoEnvio.mode,
        timestamp: resultadoEnvio.timestamp,
        numeroComprobante: resultadoEnvio.numeroComprobante,
        respuestaHacienda: resultadoEnvio.respuestaHacienda,
        archivosMarcados: resultadoMarcado ? resultadoMarcado.moved.length : 0,
      };

      logger.info(`Factura enviada exitosamente: ${claveAEnviar}`);
      res.json(response);
    } catch (error) {
      logger.error('Error al enviar factura:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
      });
    }
  }

  /**
   * Consulta una factura por consecutivo
   * GET /api/facturas/:consecutivo
   */
  static async consultarFactura(req, res) {
    try {
      const { consecutivo } = req.params;
      const { includeContent = 'true' } = req.query;

      logger.info(`Consultando factura: ${consecutivo}`);

      // Validar formato de consecutivo
      const consecutivoValidation = FacturaValidator.validateConsecutivo(consecutivo);
      if (!consecutivoValidation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Formato de consecutivo inválido',
          details: consecutivoValidation.errors,
        });
      }

      // Buscar la factura en storage
      let facturaData;
      try {
        facturaData = await invoiceStorage.getInvoice(consecutivo);
      } catch (error) {
        if (error.message.includes('Factura no encontrada')) {
          return res.status(404).json({
            success: false,
            error: 'Factura no encontrada',
            consecutivo,
          });
        }
        throw error;
      }

      // Si se encontró la factura, consultar su estado en el adaptador ATV
      let estadoATV = null;
      if (facturaData.files && facturaData.files.json && facturaData.files.json.clave) {
        try {
          // Asegurar que el adaptador esté inicializado
          if (!atvAdapter.isInitialized) {
            await atvAdapter.init();
          }

          estadoATV = await atvAdapter.consultarComprobante(facturaData.files.json.clave);
        } catch (error) {
          logger.warn('Error al consultar estado en ATV:', error.message);
          estadoATV = {
            success: false,
            error: 'Error al consultar estado ATV',
            message: error.message,
          };
        }
      }

      const response = {
        success: true,
        consecutivo,
        encontrada: true,
        metadata: facturaData.metadata,
        estadoATV,
      };

      // Incluir contenido si se solicita
      if (includeContent === 'true') {
        response.contenido = {
          json: facturaData.files.json || null,
          xml: facturaData.files.xml || null,
        };
      } else {
        // Solo incluir metadatos básicos
        response.archivos = {
          json: facturaData.metadata.jsonFile || null,
          xml: facturaData.metadata.xmlFile || null,
        };
      }

      logger.info(`Factura consultada exitosamente: ${consecutivo}`);
      res.json(response);
    } catch (error) {
      logger.error('Error al consultar factura:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
      });
    }
  }

  /**
   * Lista todas las facturas
   * GET /api/facturas
   */
  static async listarFacturas(req, res) {
    try {
      const { 
        status = 'all', 
        includeContent = 'false', 
        limit = 50, 
        offset = 0 
      } = req.query;

      logger.info(`Listando facturas: status=${status}, limit=${limit}, offset=${offset}`);

      // Validar parámetros
      const validStatuses = ['all', 'pending', 'sent'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status inválido',
          validStatuses,
        });
      }

      const limitNum = Math.min(parseInt(limit, 10) || 50, 100); // Máximo 100
      const offsetNum = parseInt(offset, 10) || 0;

      // Obtener facturas del storage
      const todasLasFacturas = await invoiceStorage.listInvoices({
        includeContent: includeContent === 'true',
        status,
      });

      // Aplicar paginación
      const total = todasLasFacturas.length;
      const facturas = todasLasFacturas.slice(offsetNum, offsetNum + limitNum);

      // Obtener estadísticas del storage
      const stats = await invoiceStorage.getStorageStats();

      const response = {
        success: true,
        pagination: {
          total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < total,
        },
        filters: {
          status,
          includeContent: includeContent === 'true',
        },
        stats,
        facturas,
      };

      logger.info(`${facturas.length} facturas listadas (${total} total)`);
      res.json(response);
    } catch (error) {
      logger.error('Error al listar facturas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
      });
    }
  }

  /**
   * Obtiene el estado del sistema
   * GET /api/facturas/status
   */
  static async obtenerEstadoSistema(req, res) {
    try {
      logger.info('Consultando estado del sistema');

      // Estado del adaptador ATV
      const estadoATV = atvAdapter.getStatus();

      // Estadísticas de storage
      const statsStorage = await invoiceStorage.getStorageStats();

      const response = {
        success: true,
        timestamp: new Date().toISOString(),
        sistema: {
          modo: estadoATV.mode,
          adaptadorInicializado: estadoATV.initialized,
          sdk: estadoATV.sdk,
        },
        storage: statsStorage,
        config: {
          simulateIfNoKeys: process.env.SIMULATE_IF_NO_KEYS,
          nodeEnv: process.env.NODE_ENV,
          invoicesDir: process.env.INVOICES_DIR || './invoices',
        },
      };

      res.json(response);
    } catch (error) {
      logger.error('Error al obtener estado del sistema:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
      });
    }
  }

  /**
   * Elimina una factura (solo en desarrollo)
   * DELETE /api/facturas/:consecutivo
   */
  static async eliminarFactura(req, res) {
    try {
      // Solo permitir en desarrollo
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          error: 'Eliminación no permitida en producción',
        });
      }

      const { consecutivo } = req.params;

      logger.warn(`Eliminando factura (DESARROLLO): ${consecutivo}`);

      // Validar formato de consecutivo
      const consecutivoValidation = FacturaValidator.validateConsecutivo(consecutivo);
      if (!consecutivoValidation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Formato de consecutivo inválido',
          details: consecutivoValidation.errors,
        });
      }

      // Eliminar del storage
      const resultado = await invoiceStorage.deleteInvoice(consecutivo);

      const response = {
        success: true,
        consecutivo,
        archivosEliminados: resultado.deleted.length,
        errores: resultado.errors.length,
        detalles: resultado,
      };

      logger.warn(`Factura eliminada: ${consecutivo}, archivos: ${resultado.deleted.length}`);
      res.json(response);
    } catch (error) {
      if (error.message.includes('Factura no encontrada')) {
        return res.status(404).json({
          success: false,
          error: 'Factura no encontrada',
          consecutivo: req.params.consecutivo,
        });
      }

      logger.error('Error al eliminar factura:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message,
      });
    }
  }
}

module.exports = FacturaController;