const config = require('../config');
const logger = require('../utils/logger');
const { generateConsecutivo } = require('../utils/filenames');

/**
 * Adaptador para el SDK de ATV (@facturacr/atv-sdk)
 * Este adaptador funciona en dos modos:
 * - REAL: Utiliza el SDK oficial cuando las llaves están configuradas
 * - SIMULATED: Simula las respuestas del SDK cuando no hay llaves disponibles
 */
class ATVAdapter {
  constructor() {
    this.isInitialized = false;
    this.mode = config.mode;
    this.sdk = null;
  
    
    logger.info(`ATVAdapter inicializado en modo: ${this.mode}`);
  }

  /**
   * Inicializa el adaptador
   * @param {Object} customConfig - Configuración personalizada opcional
   */
  async init(customConfig = {}) {
    try {
      if (this.mode === 'REAL') {
        await this._initRealMode(customConfig);
      } else {
        await this._initSimulatedMode();
      }
      
      this.isInitialized = true;
      logger.info('ATVAdapter inicializado correctamente');
    } catch (error) {
      logger.error('Error al inicializar ATVAdapter:', error);
      throw new Error(`Error al inicializar ATV: ${error.message}`);
    }
  }

  /**
   * Inicializa el modo real usando el SDK oficial
   */
  async _initRealMode(customConfig) {
    try {
      // En producción, aquí se cargaría el SDK real
      // const ATV = require('@facturacr/atv-sdk');
      // this.sdk = new ATV({
      //   keyPath: config.atv.keyPath,
      //   certPath: config.atv.certPath,
      //   clientId: config.atv.clientId,
      //   username: config.atv.username,
      //   pin: config.atv.pin,
      //   ...customConfig
      // });
      // await this.sdk.init();
      
      logger.info('SDK de ATV inicializado en modo REAL');
    } catch (error) {
      logger.warn('Error al inicializar SDK real, cambiando a modo simulado:', error.message);
      this.mode = 'SIMULATED';
      await this._initSimulatedMode();
    }
  }

  /**
   * Inicializa el modo simulado
   */
  async _initSimulatedMode() {
    // Simulación de inicialización
    this.sdk = {
      mode: 'SIMULATED',
      initialized: true,
      timestamp: new Date().toISOString(),
    };
    
    logger.info('ATVAdapter inicializado en modo SIMULADO');
  }

  /**
   * Emite un comprobante electrónico
   * @param {Object} payload - Datos del comprobante
   * @returns {Object} Resultado de la emisión
   */
  async emitirComprobante(payload) {
    this._ensureInitialized();

    if (this.mode === 'REAL') {
      return await this._emitirComprobanteReal(payload);
    } else {
      return await this._emitirComprobanteSimulado(payload);
    }
  }

  /**
   * Emite un comprobante usando el SDK real
   */
  async _emitirComprobanteReal(payload) {
    try {
      // En producción, aquí se usaría el SDK real
      // const resultado = await this.sdk.emitirComprobante(payload);
      // return resultado;
      
      throw new Error('SDK real no disponible');
    } catch (error) {
      logger.error('Error en emisión real:', error);
      throw error;
    }
  }

  /**
   * Simula la emisión de un comprobante
   */
  async _emitirComprobanteSimulado(payload) {
    const consecutivo = await this._generarConsecutivo();
    const clave = this._generarClave(consecutivo, payload);
    const timestamp = new Date().toISOString();

    const resultado = {
      success: true,
      mode: 'SIMULATED',
      consecutivo,
      clave,
      estado: 'SIMULATED_EMITIDO',
      timestamp,
      xml: this._generarXMLSimulado(payload, clave, consecutivo),
      payload: payload,
      metadata: {
        emisor: payload.emisor?.nombre || 'Emisor de prueba',
        receptor: payload.receptor?.nombre || 'Receptor de prueba',
        total: payload.totales?.total || 0,
        moneda: payload.moneda || 'CRC',
      },
    };

    logger.info(`Comprobante simulado emitido: ${consecutivo}`);
    return resultado;
  }

  /**
   * Valida un comprobante
   * @param {string} clave - Clave del comprobante
   * @returns {Object} Resultado de la validación
   */
  async validarComprobante(clave) {
    this._ensureInitialized();

    if (this.mode === 'REAL') {
      return await this._validarComprobanteReal(clave);
    } else {
      return await this._validarComprobanteSimulado(clave);
    }
  }

  /**
   * Valida usando el SDK real
   */
  async _validarComprobanteReal(clave) {
    try {
      // const resultado = await this.sdk.validarComprobante(clave);
      // return resultado;
      throw new Error('SDK real no disponible');
    } catch (error) {
      logger.error('Error en validación real:', error);
      throw error;
    }
  }

  /**
   * Simula la validación de un comprobante
   */
  async _validarComprobanteSimulado(clave) {
    const resultado = {
      success: true,
      mode: 'SIMULATED',
      clave,
      valid: true,
      timestamp: new Date().toISOString(),
      hash: this._generarHashSimulado(clave),
      mensajes: [],
      estado: 'VALIDADO_SIMULADO',
    };

    logger.info(`Comprobante simulado validado: ${clave}`);
    return resultado;
  }

  /**
   * Envía un comprobante a Hacienda
   * @param {string} clave - Clave del comprobante
   * @returns {Object} Resultado del envío
   */
  async enviarComprobante(clave) {
    this._ensureInitialized();

    if (this.mode === 'REAL') {
      return await this._enviarComprobanteReal(clave);
    } else {
      return await this._enviarComprobanteSimulado(clave);
    }
  }

  /**
   * Envía usando el SDK real
   */
  async _enviarComprobanteReal(clave) {
    try {
      // const resultado = await this.sdk.enviarComprobante(clave);
      // return resultado;
      throw new Error('SDK real no disponible');
    } catch (error) {
      logger.error('Error en envío real:', error);
      throw error;
    }
  }

  /**
   * Simula el envío de un comprobante
   */
  async _enviarComprobanteSimulado(clave) {
    const timestamp = new Date().toISOString();
    
    const resultado = {
      success: true,
      mode: 'SIMULATED',
      clave,
      estado: 'ENVIADO_SIMULADO',
      timestamp,
      numeroComprobante: this._generarNumeroComprobante(),
      respuestaHacienda: {
        codigo: '01', // Código simulado de aceptación
        mensaje: 'Comprobante recibido correctamente (SIMULADO)',
        fecha: timestamp,
      },
    };

    logger.info(`Comprobante simulado enviado: ${clave}`);
    return resultado;
  }

  /**
   * Consulta el estado de un comprobante
   * @param {string} clave - Clave del comprobante
   * @returns {Object} Estado del comprobante
   */
  async consultarComprobante(clave) {
    this._ensureInitialized();

    if (this.mode === 'REAL') {
      return await this._consultarComprobanteReal(clave);
    } else {
      return await this._consultarComprobanteSimulado(clave);
    }
  }

  /**
   * Consulta usando el SDK real
   */
  async _consultarComprobanteReal(clave) {
    try {
      // const resultado = await this.sdk.consultarComprobante(clave);
      // return resultado;
      throw new Error('SDK real no disponible');
    } catch (error) {
      logger.error('Error en consulta real:', error);
      throw error;
    }
  }

  /**
   * Simula la consulta de un comprobante
   */
  async _consultarComprobanteSimulado(clave) {
    const resultado = {
      success: true,
      mode: 'SIMULATED',
      clave,
      estado: 'PROCESADO_SIMULADO',
      timestamp: new Date().toISOString(),
      estadoHacienda: 'ACEPTADO',
      detalles: {
        fechaEmision: new Date().toISOString(),
        fechaProcesamiento: new Date().toISOString(),
        codigoRespuesta: '01',
        mensajeRespuesta: 'Aceptado (SIMULADO)',
      },
    };

    logger.info(`Estado consultado para comprobante simulado: ${clave}`);
    return resultado;
  }

  /**
   * Verifica si el adaptador está inicializado
   */
  _ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('ATVAdapter no está inicializado. Llama a init() primero.');
    }
  }

  /**
   * Genera un consecutivo simulado
   */
  async _generarConsecutivo() {
    return await generateConsecutivo();
  }

  /**
   * Genera una clave simulada de 50 dígitos
   */
  _generarClave(consecutivo, payload) {
    const paisCodigo = '506'; // Costa Rica
    const fechaEmision = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const emisorId = (payload.emisor?.identificacion || '123456789').padStart(12, '0');
    const tipoComprobante = '01'; // Factura electrónica
    const situacion = '1'; // Normal
    const codigoSeguridad = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    
    // Construir clave: país(3) + fecha(8) + emisor(12) + consecutivo(20) + situación(1) + código(8)
    const clave = `${paisCodigo}${fechaEmision}${emisorId}${consecutivo}${situacion}${codigoSeguridad}`;
    return clave.padEnd(50, '0').slice(0, 50);
  }

  /**
   * Genera XML simulado
   */
  _generarXMLSimulado(payload, clave, consecutivo) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<FacturaElectronica xmlns="https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/facturaElectronica">
  <Clave>${clave}</Clave>
  <CodigoActividad>001</CodigoActividad>
  <NumeroConsecutivo>${consecutivo}</NumeroConsecutivo>
  <FechaEmision>${new Date().toISOString()}</FechaEmision>
  <Emisor>
    <Nombre>${payload.emisor?.nombre || 'Emisor de Prueba'}</Nombre>
    <Identificacion>
      <Tipo>02</Tipo>
      <Numero>${payload.emisor?.identificacion || '123456789'}</Numero>
    </Identificacion>
  </Emisor>
  <Receptor>
    <Nombre>${payload.receptor?.nombre || 'Receptor de Prueba'}</Nombre>
    <Identificacion>
      <Tipo>01</Tipo>
      <Numero>${payload.receptor?.identificacion || '987654321'}</Numero>
    </Identificacion>
  </Receptor>
  <!-- Simulación: XML completo sería mucho más extenso -->
  <ResumenFactura>
    <CodigoTipoMoneda>
      <CodigoMoneda>${payload.moneda || 'CRC'}</CodigoMoneda>
      <TipoCambio>1</TipoCambio>
    </CodigoTipoMoneda>
    <TotalServGravados>0</TotalServGravados>
    <TotalServExentos>0</TotalServExentos>
    <TotalMercanciasGravadas>${payload.totales?.subtotal || 0}</TotalMercanciasGravadas>
    <TotalMercanciasExentas>0</TotalMercanciasExentas>
    <TotalGravado>${payload.totales?.subtotal || 0}</TotalGravado>
    <TotalExento>0</TotalExento>
    <TotalVenta>${payload.totales?.subtotal || 0}</TotalVenta>
    <TotalDescuentos>0</TotalDescuentos>
    <TotalVentaNeta>${payload.totales?.subtotal || 0}</TotalVentaNeta>
    <TotalImpuesto>${payload.totales?.impuesto || 0}</TotalImpuesto>
    <TotalComprobante>${payload.totales?.total || 0}</TotalComprobante>
  </ResumenFactura>
  <!-- SIMULADO: Este XML es una simplificación para propósitos de desarrollo -->
</FacturaElectronica>`;
  }

  /**
   * Genera un hash simulado
   */
  _generarHashSimulado(clave) {
    const chars = 'abcdef0123456789';
    let hash = '';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }

  /**
   * Genera un número de comprobante simulado
   */
  _generarNumeroComprobante() {
    return Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  }

  /**
   * Obtiene información del estado del adaptador
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      mode: this.mode,
      timestamp: new Date().toISOString(),
      sdk: this.sdk ? 'Loaded' : 'Not loaded',
    };
  }
}

// Crear instancia singleton
const atvAdapter = new ATVAdapter();

module.exports = atvAdapter;