const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno
dotenv.config();

/**
 * Configuración centralizada de la aplicación
 * Detecta automáticamente el modo de operación basado en la disponibilidad de llaves ATV
 */
class Config {
  constructor() {
    this.port = process.env.PORT || 3000;
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.logLevel = process.env.LOG_LEVEL || 'info';
    
    // Configuración de ATV
    this.atv = {
      keyPath: process.env.ATV_KEY_PATH,
      certPath: process.env.ATV_CERT_PATH,
      clientId: process.env.ATV_CLIENT_ID,
      username: process.env.ATV_USERNAME,
      pin: process.env.ATV_PIN,
    };
    
    // Configuración de simulación
    this.simulateIfNoKeys = process.env.SIMULATE_IF_NO_KEYS === 'true';
    
    // Rutas de archivos
    this.invoicesDir = process.env.INVOICES_DIR || './invoices';
    this.consecutiveFile = process.env.CONSECUTIVE_FILE || './src/data/consecutivo.json';
    
    // Configuración de la aplicación
    this.maxFileSize = process.env.MAX_FILE_SIZE || '10MB';
    this.allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES || 'application/json,application/xml,application/pdf').split(',');
    
    // Detectar modo de operación
    this.mode = this.detectMode();
  }

  /**
   * Detecta si el sistema debe operar en modo simulado o real
   * @returns {string} 'SIMULATED' o 'REAL'
   */
  detectMode() {
    const hasRequiredKeys = this.atv.keyPath && 
                           this.atv.certPath && 
                           this.atv.clientId;

    if (!hasRequiredKeys && this.simulateIfNoKeys) {
      return 'SIMULATED';
    }

    // Verificar si los archivos de llaves existen
    if (hasRequiredKeys) {
      try {
        if (fs.existsSync(this.atv.keyPath) && fs.existsSync(this.atv.certPath)) {
          return 'REAL';
        }
      } catch (error) {
        console.warn('Error al verificar archivos de llaves:', error.message);
      }
    }

    return 'SIMULATED';
  }

  /**
   * Indica si el sistema está en modo simulado
   * @returns {boolean}
   */
  isSimulated() {
    return this.mode === 'SIMULATED';
  }

  /**
   * Indica si el sistema está en modo de desarrollo
   * @returns {boolean}
   */
  isDevelopment() {
    return this.nodeEnv === 'development';
  }

  /**
   * Indica si el sistema está en modo de producción
   * @returns {boolean}
   */
  isProduction() {
    return this.nodeEnv === 'production';
  }

  /**
   * Obtiene la configuración completa como objeto
   * @returns {Object}
   */
  toObject() {
    return {
      port: this.port,
      nodeEnv: this.nodeEnv,
      mode: this.mode,
      logLevel: this.logLevel,
      atv: {
        ...this.atv,
        // Ocultar información sensible en logs
        keyPath: this.atv.keyPath ? '[CONFIGURADO]' : '[NO CONFIGURADO]',
        certPath: this.atv.certPath ? '[CONFIGURADO]' : '[NO CONFIGURADO]',
        pin: this.atv.pin ? '[CONFIGURADO]' : '[NO CONFIGURADO]',
      },
      invoicesDir: this.invoicesDir,
      consecutiveFile: this.consecutiveFile,
      maxFileSize: this.maxFileSize,
      allowedMimeTypes: this.allowedMimeTypes,
    };
  }
}

// Crear instancia singleton
const config = new Config();

module.exports = config;