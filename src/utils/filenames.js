const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

/**
 * Utilidades para generar nombres de archivos y gestionar consecutivos
 */

/**
 * Ruta del archivo de consecutivos
 */
const CONSECUTIVO_FILE = path.resolve(config.consecutiveFile || './src/data/consecutivo.json');

/**
 * Datos por defecto para el archivo de consecutivos
 */
const DEFAULT_CONSECUTIVO_DATA = {
  current: 1,
  lastUpdated: null,
  format: 'YYYYMMDDHHMMSS',
  prefix: '00100101000000',
};

/**
 * Genera un nuevo número consecutivo
 * @returns {Promise<string>} Número consecutivo de 20 dígitos
 */
async function generateConsecutivo() {
  try {
    // Asegurar que el directorio existe
    await fs.ensureDir(path.dirname(CONSECUTIVO_FILE));

    // Leer datos actuales o crear archivo
    let data;
    try {
      data = await fs.readJSON(CONSECUTIVO_FILE);
    } catch (error) {
      // Archivo no existe, crear con datos por defecto
      data = { ...DEFAULT_CONSECUTIVO_DATA };
      await fs.writeJSON(CONSECUTIVO_FILE, data, { spaces: 2 });
    }

    // Incrementar el consecutivo
    const currentNumber = data.current || 1;
    const newConsecutivo = generateConsecutivoNumber(currentNumber);

    // Actualizar y guardar
    data.current = currentNumber + 1;
    data.lastUpdated = new Date().toISOString();
    data.lastGenerated = newConsecutivo;

    await fs.writeJSON(CONSECUTIVO_FILE, data, { spaces: 2 });

    return newConsecutivo;
  } catch (error) {
    console.error('Error al generar consecutivo:', error);
    // Fallback: generar basado en timestamp
    return generateTimestampBasedConsecutivo();
  }
}

/**
 * Genera un número consecutivo basado en un número secuencial
 * @param {number} sequenceNumber - Número secuencial
 * @returns {string} Consecutivo de 20 dígitos
 */
function generateConsecutivoNumber(sequenceNumber) {
  // Formato: establecimiento(3) + punto_venta(3) + tipo(2) + secuencia(12)
  const establecimiento = '001';     // 3 dígitos
  const puntoVenta = '001';          // 3 dígitos  
  const tipoComprobante = '01';      // 2 dígitos (01 = Factura)
  const secuencia = sequenceNumber.toString().padStart(12, '0'); // 12 dígitos

  return `${establecimiento}${puntoVenta}${tipoComprobante}${secuencia}`;
}

/**
 * Genera un consecutivo basado en timestamp (fallback)
 * @returns {string} Consecutivo de 20 dígitos
 */
function generateTimestampBasedConsecutivo() {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-10); // Últimos 10 dígitos del timestamp
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  // Formato: 001 + 001 + 01 + timestamp(10) + random(2)
  return `00100101${timestamp}${random}`;
}

/**
 * Valida si un consecutivo tiene el formato correcto
 * @param {string} consecutivo - Consecutivo a validar
 * @returns {boolean} True si es válido
 */
function validateConsecutivo(consecutivo) {
  return typeof consecutivo === 'string' && 
         consecutivo.length === 20 && 
         /^[0-9]+$/.test(consecutivo);
}

/**
 * Extrae información de un consecutivo
 * @param {string} consecutivo - Consecutivo a analizar
 * @returns {Object} Información extraída
 */
function parseConsecutivo(consecutivo) {
  if (!validateConsecutivo(consecutivo)) {
    throw new Error('Consecutivo inválido');
  }

  return {
    establecimiento: consecutivo.substring(0, 3),
    puntoVenta: consecutivo.substring(3, 6),
    tipoComprobante: consecutivo.substring(6, 8),
    secuencia: consecutivo.substring(8, 20),
    valid: true,
  };
}

/**
 * Genera un nombre de archivo para factura JSON
 * @param {string} consecutivo - Número consecutivo
 * @param {string} suffix - Sufijo adicional opcional
 * @returns {string} Nombre de archivo
 */
function generateInvoiceJSONFilename(consecutivo, suffix = '') {
  const timestamp = generateFileTimestamp();
  const suffixPart = suffix ? `_${suffix}` : '';
  return `FACTURA_${consecutivo}_${timestamp}${suffixPart}.json`;
}

/**
 * Genera un nombre de archivo para factura XML
 * @param {string} consecutivo - Número consecutivo
 * @returns {string} Nombre de archivo
 */
function generateInvoiceXMLFilename(consecutivo) {
  return `FACTURA_${consecutivo}.xml`;
}

/**
 * Genera un nombre de archivo para metadatos de envío
 * @param {string} consecutivo - Número consecutivo
 * @returns {string} Nombre de archivo
 */
function generateSentMetaFilename(consecutivo) {
  const timestamp = generateFileTimestamp();
  return `ENVIO_${consecutivo}_${timestamp}.json`;
}

/**
 * Genera un timestamp para nombres de archivo
 * @returns {string} Timestamp formateado
 */
function generateFileTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .split('.')[0];
}

/**
 * Extrae el consecutivo de un nombre de archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string|null} Consecutivo extraído o null si no se encuentra
 */
function extractConsecutivoFromFilename(filename) {
  const match = filename.match(/FACTURA_([0-9]{20})_/);
  return match ? match[1] : null;
}

/**
 * Genera un hash simple para identificar archivos
 * @param {string} content - Contenido a hashear
 * @returns {string} Hash simple
 */
function generateSimpleHash(content) {
  let hash = 0;
  const str = String(content);
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32bit integer
  }
  
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Obtiene estadísticas del archivo de consecutivos
 * @returns {Promise<Object>} Estadísticas
 */
async function getConsecutivoStats() {
  try {
    const data = await fs.readJSON(CONSECUTIVO_FILE);
    return {
      currentNumber: data.current || 1,
      lastUpdated: data.lastUpdated,
      lastGenerated: data.lastGenerated,
      nextConsecutivo: generateConsecutivoNumber(data.current || 1),
      fileExists: true,
      filePath: CONSECUTIVO_FILE,
    };
  } catch (error) {
    return {
      currentNumber: 1,
      lastUpdated: null,
      lastGenerated: null,
      nextConsecutivo: generateConsecutivoNumber(1),
      fileExists: false,
      filePath: CONSECUTIVO_FILE,
      error: error.message,
    };
  }
}

/**
 * Resetea el contador de consecutivos (solo para desarrollo)
 * @param {number} startNumber - Número inicial
 * @returns {Promise<void>}
 */
async function resetConsecutivo(startNumber = 1) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Reset de consecutivo no permitido en producción');
  }

  const data = {
    ...DEFAULT_CONSECUTIVO_DATA,
    current: startNumber,
    lastUpdated: new Date().toISOString(),
    resetAt: new Date().toISOString(),
  };

  await fs.ensureDir(path.dirname(CONSECUTIVO_FILE));
  await fs.writeJSON(CONSECUTIVO_FILE, data, { spaces: 2 });

  return data;
}

/**
 * Sanitiza un nombre de archivo para evitar caracteres problemáticos
 * @param {string} filename - Nombre de archivo
 * @returns {string} Nombre sanitizado
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')  // Caracteres problemáticos en Windows
    .replace(/[\x00-\x1f\x80-\x9f]/g, '') // Caracteres de control
    .replace(/^\.+/, '')  // Puntos al inicio
    .substring(0, 255);   // Limitar longitud
}

/**
 * Obtiene información de un archivo de forma segura
 * @param {string} filePath - Ruta del archivo
 * @returns {Promise<Object>} Información del archivo o null
 */
async function getFileInfoSafe(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      exists: true,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
    };
  }
}

module.exports = {
  generateConsecutivo,
  generateConsecutivoNumber,
  generateTimestampBasedConsecutivo,
  validateConsecutivo,
  parseConsecutivo,
  generateInvoiceJSONFilename,
  generateInvoiceXMLFilename,
  generateSentMetaFilename,
  generateFileTimestamp,
  extractConsecutivoFromFilename,
  generateSimpleHash,
  getConsecutivoStats,
  resetConsecutivo,
  sanitizeFilename,
  getFileInfoSafe,
};