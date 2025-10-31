#!/usr/bin/env node

/**
 * Servidor principal de la aplicación
 * Punto de entrada para la API de facturación electrónica
 */

const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

/**
 * Obtener puerto de la configuración
 */
const port = normalizePort(config.port);
app.set('port', port);

/**
 * Crear servidor HTTP
 */
const http = require('http');
const server = http.createServer(app);

/**
 * Escuchar en el puerto proporcionado
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalizar puerto en número, cadena o false
 */
function normalizePort(val) {
  const portNumber = parseInt(val, 10);

  if (Number.isNaN(portNumber)) {
    // named pipe
    return val;
  }

  if (portNumber >= 0) {
    // port number
    return portNumber;
  }

  return false;
}

/**
 * Manejador de eventos de error del servidor HTTP
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // manejar errores específicos de escucha con mensajes amigables
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      logger.error('Server error:', error);
      throw error;
  }
}

/**
 * Manejador de eventos "listening" del servidor HTTP
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;

  logger.info(`Servidor iniciado correctamente`, {
    message: `Escuchando en ${bind}`,
    port: addr.port,
    mode: config.mode,
    nodeEnv: config.nodeEnv,
    pid: process.pid,
    timestamp: new Date().toISOString(),
  });

  // Log de configuración inicial
  logger.info('Configuración del sistema:', {
    config: config.toObject(),
  });

  // Mostrar información útil en consola
  console.log('🚀 Servidor Hacienda API iniciado');
  console.log(`📍 URL: http://localhost:${addr.port}`);
  console.log(`🔧 Modo: ${config.mode}`);
  console.log(`🌍 Entorno: ${config.nodeEnv}`);
  console.log(`📁 Directorio de facturas: ${config.invoicesDir}`);
  console.log('');
  console.log('📋 Endpoints disponibles:');
  console.log('  GET  /               - Información de la API');
  console.log('  GET  /health         - Health check');
  console.log('  GET  /info           - Información del sistema');
  console.log('  POST /api/facturas/emitir    - Emitir factura');
  console.log('  POST /api/facturas/validar   - Validar factura');
  console.log('  POST /api/facturas/enviar    - Enviar factura');
  console.log('  GET  /api/facturas/status    - Estado del sistema');
  console.log('  GET  /api/facturas           - Listar facturas');
  console.log('  GET  /api/facturas/:id       - Consultar factura');
  
  if (config.isDevelopment()) {
    console.log('  DELETE /api/facturas/:id     - Eliminar factura (desarrollo)');
  }
  console.log('');
  
  if (config.mode === 'SIMULATED') {
    console.log('⚠️  MODO SIMULADO: Las operaciones no se envían a Hacienda');
    console.log('   Para usar el SDK real, configure las variables ATV_* en .env');
  } else {
    console.log('✅ MODO REAL: Conectado al SDK de ATV');
  }
  
  console.log('');
}

/**
 * Función de limpieza al cerrar el servidor
 */
function gracefulShutdown(signal) {
  logger.info(`Recibida señal ${signal}. Cerrando servidor...`);
  
  server.close(() => {
    logger.info('Servidor HTTP cerrado');
    
    // Aquí se pueden agregar otras tareas de limpieza
    // como cerrar conexiones a bases de datos, etc.
    
    logger.info('Proceso terminado correctamente');
    process.exit(0);
  });
  
  // Forzar salida si el cierre no se completa en 10 segundos
  setTimeout(() => {
    logger.error('Forzando terminación del proceso');
    process.exit(1);
  }, 10000);
}

// Manejar señales de terminación
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Excepción no capturada:', {
    error: error.message,
    stack: error.stack,
  });
  
  // Intentar cerrar el servidor antes de salir
  server.close(() => {
    process.exit(1);
  });
  
  // Forzar salida si no se cierra en 5 segundos
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', {
    reason: reason,
    promise: promise,
  });
  
  // En este caso no salimos del proceso inmediatamente
  // pero registramos el error para investigación
});

// Exportar servidor para testing
module.exports = server;