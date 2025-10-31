const winston = require('winston');
const path = require('path');
const fs = require('fs');

/**
 * Configuración del logger usando Winston
 * Proporciona logging estructurado para la aplicación
 */

// Crear directorio de logs si no existe
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configuración de formatos
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Agregar metadata si existe
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    if (metaStr) {
      log += `\n${metaStr}`;
    }
    
    return log;
  })
);

// Configuración de transportes
const transports = [
  // Log de errores
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Log combinado
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 10,
  }),
];

// Agregar console transport en desarrollo
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || 'info',
    })
  );
} else {
  // En producción, solo errores y warnings a consola
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      level: 'warn',
    })
  );
}

// Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'hacienda-api',
    version: process.env.npm_package_version || '1.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  transports,
  
  // Manejar excepciones no capturadas
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat,
    }),
  ],
  
  // Manejar rechazos de promesas no capturadas
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat,
    }),
  ],
});

// Agregar métodos de utilidad
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger.log(logLevel, 'HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      contentLength: res.get('Content-Length'),
    });
  });
  
  next();
};

logger.logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    ...context,
  });
};

logger.logValidationError = (validationErrors, context = {}) => {
  logger.warn('Validation Error', {
    errors: validationErrors,
    ...context,
  });
};

logger.logATV = (operation, data, context = {}) => {
  logger.info(`ATV Operation: ${operation}`, {
    operation,
    data,
    ...context,
  });
};

logger.logStorage = (operation, details, context = {}) => {
  logger.info(`Storage Operation: ${operation}`, {
    operation,
    details,
    ...context,
  });
};

// Logging de inicio de aplicación
logger.info('Logger initialized', {
  logLevel: logger.level,
  nodeEnv: process.env.NODE_ENV,
  logsDir,
  transports: transports.map(t => t.constructor.name),
});

module.exports = logger;