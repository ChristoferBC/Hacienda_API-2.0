const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const logger = require('./utils/logger');
const facturaRoutes = require('./routes/facturas');
const atvAdapter = require('./services/atvAdapter');

/**
 * Aplicación principal de Express
 * Configura middleware, rutas y manejo de errores
 */

const app = express();

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Middleware CORS
app.use(cors({
  origin: config.isDevelopment() ? true : process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Middleware de parsing
app.use(express.json({ 
  limit: config.maxFileSize || '10MB',
  verify: (req, res, buf) => {
    // Validar que el JSON sea válido antes de procesarlo
    try {
      JSON.parse(buf);
    } catch (e) {
      const error = new Error('JSON inválido');
      error.status = 400;
      throw error;
    }
  },
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: config.maxFileSize || '10MB' 
}));

// Middleware de logging de requests
app.use(logger.logRequest);

// Middleware para agregar información de configuración a req
app.use((req, res, next) => {
  req.config = config;
  req.logger = logger;
  next();
});

// Middleware de información del sistema
app.use('/api', (req, res, next) => {
  res.set({
    'X-API-Version': '1.0.0',
    'X-System-Mode': config.mode,
    'X-Node-Env': config.nodeEnv,
  });
  next();
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mode: config.mode,
    nodeEnv: config.nodeEnv,
    version: '1.0.0',
  });
});

// Ruta de información del sistema
app.get('/info', (req, res) => {
  const atvStatus = atvAdapter.getStatus();
  
  res.json({
    application: {
      name: 'Hacienda API',
      version: '1.0.0',
      description: 'API REST para facturación electrónica',
    },
    system: {
      mode: config.mode,
      nodeEnv: config.nodeEnv,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    atv: {
      initialized: atvStatus.initialized,
      mode: atvStatus.mode,
    },
    endpoints: [
      'GET /health',
      'GET /info',
      'POST /api/facturas/emitir',
      'POST /api/facturas/validar',
      'POST /api/facturas/enviar',
      'GET /api/facturas/status',
      'GET /api/facturas',
      'GET /api/facturas/:consecutivo',
      'DELETE /api/facturas/:consecutivo (solo desarrollo)',
    ],
  });
});

// Rutas de la API
app.use('/api/facturas', facturaRoutes);

// Ruta por defecto para la raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Facturación Electrónica - Hacienda Costa Rica',
    version: '1.0.0',
    mode: config.mode,
    documentation: '/info',
    healthCheck: '/health',
    apiBase: '/api/facturas',
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  logger.warn(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    message: `No se encontró ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /info',
      'POST /api/facturas/emitir',
      'POST /api/facturas/validar',
      'POST /api/facturas/enviar',
      'GET /api/facturas/status',
      'GET /api/facturas',
      'GET /api/facturas/:consecutivo',
    ],
  });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  // Log del error
  logger.logError(error, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
  });

  // Determinar el código de estado
  let statusCode = error.status || error.statusCode || 500;
  
  // Tipos específicos de error
  if (error.name === 'ValidationError') {
    statusCode = 400;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
  } else if (error.name === 'CastError') {
    statusCode = 400;
  }

  // Respuesta de error
  const errorResponse = {
    success: false,
    error: error.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
  };

  // Incluir stack trace solo en desarrollo
  if (config.isDevelopment()) {
    errorResponse.stack = error.stack;
    errorResponse.details = {
      name: error.name,
      code: error.code,
    };
  }

  // Errores específicos de JSON parsing
  if (error.type === 'entity.parse.failed') {
    errorResponse.error = 'JSON inválido en el cuerpo de la solicitud';
    statusCode = 400;
  }

  // Errores de payload demasiado grande
  if (error.type === 'entity.too.large') {
    errorResponse.error = `Payload demasiado grande. Máximo permitido: ${config.maxFileSize}`;
    statusCode = 413;
  }

  res.status(statusCode).json(errorResponse);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('Recibida señal SIGTERM. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Recibida señal SIGINT. Cerrando servidor...');
  process.exit(0);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', { reason, promise });
  process.exit(1);
});

// Inicializar ATV adapter al arrancar la aplicación
const initializeATV = async () => {
  try {
    await atvAdapter.init();
    logger.info('ATV Adapter inicializado correctamente');
  } catch (error) {
    logger.error('Error al inicializar ATV Adapter:', error);
    // No terminar la aplicación, continuar en modo de error
  }
};

// Inicializar de forma asíncrona
initializeATV();

module.exports = app;