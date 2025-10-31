const fs = require('fs-extra');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Servicio para gestionar el almacenamiento de facturas en el sistema de archivos
 * Maneja tanto archivos JSON como XML y organiza los archivos por estado
 */
class InvoiceStorage {
  constructor() {
    this.invoicesDir = path.resolve(config.invoicesDir);
    this.sentDir = path.join(this.invoicesDir, 'sent');
    this._ensureDirectoriesExist();
  }

  /**
   * Asegura que los directorios necesarios existan
   */
  async _ensureDirectoriesExist() {
    try {
      await fs.ensureDir(this.invoicesDir);
      await fs.ensureDir(this.sentDir);
      logger.info('Directorios de facturas verificados/creados');
    } catch (error) {
      logger.error('Error al crear directorios:', error);
      throw new Error(`Error al crear directorios: ${error.message}`);
    }
  }

  /**
   * Guarda una factura en formato JSON
   * @param {string} consecutivo - Número consecutivo de la factura
   * @param {Object} facturaData - Datos de la factura
   * @returns {string} Ruta del archivo guardado
   */
  async saveInvoiceJSON(consecutivo, facturaData) {
    try {
      const timestamp = this._generateTimestamp();
      const filename = `FACTURA_${consecutivo}_${timestamp}.json`;
      const filePath = path.join(this.invoicesDir, filename);

      const dataToSave = {
        ...facturaData,
        metadata: {
          ...facturaData.metadata,
          savedAt: new Date().toISOString(),
          filename,
          filePath,
          format: 'JSON',
        },
      };

      await fs.writeJSON(filePath, dataToSave, { spaces: 2 });
      
      logger.info(`Factura JSON guardada: ${filename}`);
      return filePath;
    } catch (error) {
      logger.error('Error al guardar factura JSON:', error);
      throw new Error(`Error al guardar factura JSON: ${error.message}`);
    }
  }

  /**
   * Guarda el XML de una factura
   * @param {string} consecutivo - Número consecutivo de la factura
   * @param {string} xmlContent - Contenido XML de la factura
   * @returns {string} Ruta del archivo guardado
   */
  async saveInvoiceXML(consecutivo, xmlContent) {
    try {
      const filename = `FACTURA_${consecutivo}.xml`;
      const filePath = path.join(this.invoicesDir, filename);

      await fs.writeFile(filePath, xmlContent, 'utf8');
      
      logger.info(`Factura XML guardada: ${filename}`);
      return filePath;
    } catch (error) {
      logger.error('Error al guardar factura XML:', error);
      throw new Error(`Error al guardar factura XML: ${error.message}`);
    }
  }

  /**
   * Marca una factura como enviada moviéndola a la carpeta 'sent'
   * @param {string} consecutivo - Número consecutivo de la factura
   * @param {Object} envioMeta - Metadatos del envío
   * @returns {Object} Información sobre los archivos movidos
   */
  async markAsSent(consecutivo, envioMeta = {}) {
    try {
      const result = {
        moved: [],
        errors: [],
      };

      // Buscar archivos relacionados con el consecutivo
      const files = await this._findInvoiceFiles(consecutivo);
      
      if (files.length === 0) {
        throw new Error(`No se encontraron archivos para el consecutivo: ${consecutivo}`);
      }

      // Crear metadatos del envío
      const timestamp = new Date().toISOString();
      const metaData = {
        consecutivo,
        envioAt: timestamp,
        respuestaSimulada: envioMeta,
        archivosMovidos: [],
      };

      // Mover cada archivo a la carpeta 'sent'
      for (const file of files) {
        try {
          const sourcePath = path.join(this.invoicesDir, file);
          const destPath = path.join(this.sentDir, file);
          
          // Copiar el archivo en lugar de moverlo para mantener el original
          await fs.copy(sourcePath, destPath);
          
          metaData.archivosMovidos.push({
            original: sourcePath,
            enviado: destPath,
            timestamp,
          });
          
          result.moved.push(destPath);
          logger.info(`Archivo copiado a 'sent': ${file}`);
        } catch (fileError) {
          const errorMsg = `Error al mover ${file}: ${fileError.message}`;
          result.errors.push(errorMsg);
          logger.error(errorMsg);
        }
      }

      // Guardar metadatos del envío
      const metaFilename = `ENVIO_${consecutivo}_${this._generateTimestamp()}.json`;
      const metaFilePath = path.join(this.sentDir, metaFilename);
      await fs.writeJSON(metaFilePath, metaData, { spaces: 2 });
      result.moved.push(metaFilePath);

      logger.info(`Factura marcada como enviada: ${consecutivo}`);
      return result;
    } catch (error) {
      logger.error('Error al marcar factura como enviada:', error);
      throw new Error(`Error al marcar como enviada: ${error.message}`);
    }
  }

  /**
   * Obtiene una factura por su consecutivo
   * @param {string} consecutivo - Número consecutivo de la factura
   * @returns {Object} Datos de la factura y metadatos
   */
  async getInvoice(consecutivo) {
    try {
      const files = await this._findInvoiceFiles(consecutivo);
      
      if (files.length === 0) {
        throw new Error(`Factura no encontrada: ${consecutivo}`);
      }

      const result = {
        consecutivo,
        files: {},
        metadata: {
          foundAt: new Date().toISOString(),
          location: 'invoices',
        },
      };

      // Leer cada archivo encontrado
      for (const file of files) {
        const filePath = path.join(this.invoicesDir, file);
        const ext = path.extname(file).toLowerCase();
        
        try {
          if (ext === '.json') {
            result.files.json = await fs.readJSON(filePath);
          } else if (ext === '.xml') {
            result.files.xml = await fs.readFile(filePath, 'utf8');
          }
          
          // Agregar información del archivo
          const stats = await fs.stat(filePath);
          result.metadata[`${ext.replace('.', '')}File`] = {
            path: filePath,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
          };
        } catch (fileError) {
          logger.warn(`Error al leer archivo ${file}:`, fileError.message);
        }
      }

      // Verificar si también existe en 'sent'
      const sentFiles = await this._findSentFiles(consecutivo);
      if (sentFiles.length > 0) {
        result.metadata.sent = true;
        result.metadata.sentFiles = sentFiles.length;
      }

      logger.info(`Factura recuperada: ${consecutivo}`);
      return result;
    } catch (error) {
      if (error.message.includes('Factura no encontrada')) {
        throw error;
      }
      logger.error('Error al obtener factura:', error);
      throw new Error(`Error al obtener factura: ${error.message}`);
    }
  }

  /**
   * Lista todas las facturas disponibles
   * @param {Object} options - Opciones de filtrado
   * @returns {Array} Lista de facturas con metadatos básicos
   */
  async listInvoices(options = {}) {
    try {
      const { includeContent = false, status = 'all' } = options;
      const invoices = [];

      // Obtener archivos del directorio principal
      if (status === 'all' || status === 'pending') {
        const files = await fs.readdir(this.invoicesDir);
        const jsonFiles = files.filter(f => f.endsWith('.json') && f.startsWith('FACTURA_'));
        
        for (const file of jsonFiles) {
          const consecutivo = this._extractConsecutivoFromFilename(file);
          if (consecutivo) {
            const invoice = await this._getInvoiceBasicInfo(consecutivo, 'pending', includeContent);
            invoices.push(invoice);
          }
        }
      }

      // Obtener archivos del directorio 'sent'
      if (status === 'all' || status === 'sent') {
        const sentFiles = await fs.readdir(this.sentDir);
        const jsonFiles = sentFiles.filter(f => f.endsWith('.json') && f.startsWith('FACTURA_'));
        
        for (const file of jsonFiles) {
          const consecutivo = this._extractConsecutivoFromFilename(file);
          if (consecutivo) {
            const invoice = await this._getInvoiceBasicInfo(consecutivo, 'sent', includeContent);
            invoices.push(invoice);
          }
        }
      }

      logger.info(`Lista de facturas generada: ${invoices.length} facturas encontradas`);
      return invoices;
    } catch (error) {
      logger.error('Error al listar facturas:', error);
      throw new Error(`Error al listar facturas: ${error.message}`);
    }
  }

  /**
   * Elimina una factura y todos sus archivos relacionados
   * @param {string} consecutivo - Número consecutivo de la factura
   * @returns {Object} Resultado de la eliminación
   */
  async deleteInvoice(consecutivo) {
    try {
      const result = {
        deleted: [],
        errors: [],
      };

      // Eliminar archivos del directorio principal
      const files = await this._findInvoiceFiles(consecutivo);
      for (const file of files) {
        try {
          const filePath = path.join(this.invoicesDir, file);
          await fs.remove(filePath);
          result.deleted.push(filePath);
        } catch (error) {
          result.errors.push(`Error al eliminar ${file}: ${error.message}`);
        }
      }

      // Eliminar archivos del directorio 'sent'
      const sentFiles = await this._findSentFiles(consecutivo);
      for (const file of sentFiles) {
        try {
          const filePath = path.join(this.sentDir, file);
          await fs.remove(filePath);
          result.deleted.push(filePath);
        } catch (error) {
          result.errors.push(`Error al eliminar archivo enviado ${file}: ${error.message}`);
        }
      }

      if (result.deleted.length === 0 && result.errors.length === 0) {
        throw new Error(`Factura no encontrada: ${consecutivo}`);
      }

      logger.info(`Factura eliminada: ${consecutivo} (${result.deleted.length} archivos)`);
      return result;
    } catch (error) {
      logger.error('Error al eliminar factura:', error);
      throw new Error(`Error al eliminar factura: ${error.message}`);
    }
  }

  /**
   * Busca archivos relacionados con un consecutivo en el directorio principal
   */
  async _findInvoiceFiles(consecutivo) {
    try {
      const files = await fs.readdir(this.invoicesDir);
      return files.filter(file => 
        file.includes(consecutivo) && 
        (file.endsWith('.json') || file.endsWith('.xml')) &&
        file.startsWith('FACTURA_')
      );
    } catch (error) {
      logger.warn('Error al buscar archivos de factura:', error);
      return [];
    }
  }

  /**
   * Busca archivos relacionados con un consecutivo en el directorio 'sent'
   */
  async _findSentFiles(consecutivo) {
    try {
      const files = await fs.readdir(this.sentDir);
      return files.filter(file => 
        file.includes(consecutivo) && 
        (file.endsWith('.json') || file.endsWith('.xml'))
      );
    } catch (error) {
      logger.warn('Error al buscar archivos enviados:', error);
      return [];
    }
  }

  /**
   * Obtiene información básica de una factura
   */
  async _getInvoiceBasicInfo(consecutivo, status, includeContent) {
    try {
      const dir = status === 'sent' ? this.sentDir : this.invoicesDir;
      const jsonFile = await this._findJsonFile(consecutivo, dir);
      
      if (!jsonFile) {
        return null;
      }

      const filePath = path.join(dir, jsonFile);
      const stats = await fs.stat(filePath);
      
      const info = {
        consecutivo,
        status,
        filename: jsonFile,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };

      if (includeContent) {
        info.content = await fs.readJSON(filePath);
      }

      return info;
    } catch (error) {
      logger.warn(`Error al obtener info básica de ${consecutivo}:`, error);
      return null;
    }
  }

  /**
   * Busca el archivo JSON de una factura específica
   */
  async _findJsonFile(consecutivo, directory) {
    try {
      const files = await fs.readdir(directory);
      return files.find(file => 
        file.includes(consecutivo) && 
        file.endsWith('.json') && 
        file.startsWith('FACTURA_')
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Extrae el consecutivo del nombre de archivo
   */
  _extractConsecutivoFromFilename(filename) {
    const match = filename.match(/FACTURA_([^_]+)_/);
    return match ? match[1] : null;
  }

  /**
   * Genera un timestamp para nombres de archivo
   */
  _generateTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
  }

  /**
   * Obtiene estadísticas del almacenamiento
   * @returns {Object} Estadísticas del almacenamiento
   */
  async getStorageStats() {
    try {
      const stats = {
        directories: {
          invoices: this.invoicesDir,
          sent: this.sentDir,
        },
        counts: {
          pending: 0,
          sent: 0,
          total: 0,
        },
        sizes: {
          pending: 0,
          sent: 0,
          total: 0,
        },
      };

      // Estadísticas del directorio principal
      try {
        const files = await fs.readdir(this.invoicesDir);
        const invoiceFiles = files.filter(f => f.startsWith('FACTURA_') && f.endsWith('.json'));
        stats.counts.pending = invoiceFiles.length;
        
        for (const file of invoiceFiles) {
          const filePath = path.join(this.invoicesDir, file);
          const fileStats = await fs.stat(filePath);
          stats.sizes.pending += fileStats.size;
        }
      } catch (error) {
        logger.warn('Error al obtener stats del directorio principal:', error);
      }

      // Estadísticas del directorio 'sent'
      try {
        const sentFiles = await fs.readdir(this.sentDir);
        const sentInvoiceFiles = sentFiles.filter(f => f.startsWith('FACTURA_') && f.endsWith('.json'));
        stats.counts.sent = sentInvoiceFiles.length;
        
        for (const file of sentInvoiceFiles) {
          const filePath = path.join(this.sentDir, file);
          const fileStats = await fs.stat(filePath);
          stats.sizes.sent += fileStats.size;
        }
      } catch (error) {
        logger.warn('Error al obtener stats del directorio sent:', error);
      }

      stats.counts.total = stats.counts.pending + stats.counts.sent;
      stats.sizes.total = stats.sizes.pending + stats.sizes.sent;

      return stats;
    } catch (error) {
      logger.error('Error al obtener estadísticas de almacenamiento:', error);
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

// Crear instancia singleton
const invoiceStorage = new InvoiceStorage();

module.exports = invoiceStorage;