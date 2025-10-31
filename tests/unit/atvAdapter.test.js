const atvAdapter = require('../../src/services/atvAdapter');
const config = require('../../src/config');

describe('ATV Adapter Unit Tests', () => {
  beforeEach(() => {
    // Reset adapter state before each test
    atvAdapter.isInitialized = false;
    atvAdapter.sdk = null;
  });

  describe('Initialization', () => {
    it('should initialize in simulated mode when no keys are configured', async () => {
      await atvAdapter.init();
      
      expect(atvAdapter.isInitialized).toBe(true);
      expect(atvAdapter.mode).toBe('SIMULATED');
      expect(atvAdapter.sdk).toBeDefined();
      expect(atvAdapter.sdk.mode).toBe('SIMULATED');
    });

    it('should get status correctly', () => {
      const status = atvAdapter.getStatus();
      
      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('mode');
      expect(status).toHaveProperty('timestamp');
      expect(status).toHaveProperty('sdk');
    });
  });

  describe('Emitir Comprobante', () => {
    beforeEach(async () => {
      await atvAdapter.init();
    });

    it('should emit simulated invoice successfully', async () => {
      const payload = {
        emisor: {
          nombre: 'Test Emisor',
          identificacion: '123456789',
        },
        receptor: {
          nombre: 'Test Receptor',
          identificacion: '987654321',
        },
        totales: {
          total: 1000,
        },
        moneda: 'CRC',
      };

      const result = await atvAdapter.emitirComprobante(payload);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('mode', 'SIMULATED');
      expect(result).toHaveProperty('consecutivo');
      expect(result).toHaveProperty('clave');
      expect(result).toHaveProperty('estado', 'SIMULATED_EMITIDO');
      expect(result).toHaveProperty('xml');
      expect(result).toHaveProperty('metadata');

      // Validate consecutivo format (20 digits)
      expect(result.consecutivo).toMatch(/^[0-9]{20}$/);
      
      // Validate clave format (50 characters)
      expect(result.clave).toMatch(/^[0-9A-Za-z]{50}$/);
    });

    it('should fail when adapter is not initialized', async () => {
      atvAdapter.isInitialized = false;

      await expect(atvAdapter.emitirComprobante({}))
        .rejects
        .toThrow('ATVAdapter no está inicializado');
    });

    it('should generate sequential consecutivos', async () => {
      const payload = {
        emisor: { nombre: 'Test', identificacion: '123456789' },
        receptor: { nombre: 'Test', identificacion: '987654321' },
      };

      const result1 = await atvAdapter.emitirComprobante(payload);
      const result2 = await atvAdapter.emitirComprobante(payload);

      expect(result1.consecutivo).not.toBe(result2.consecutivo);
      expect(result1.clave).not.toBe(result2.clave);
    });
  });

  describe('Validar Comprobante', () => {
    let testClave;

    beforeEach(async () => {
      await atvAdapter.init();
      
      // Generate test clave
      const emitResult = await atvAdapter.emitirComprobante({
        emisor: { nombre: 'Test', identificacion: '123456789' },
        receptor: { nombre: 'Test', identificacion: '987654321' },
      });
      testClave = emitResult.clave;
    });

    it('should validate simulated invoice successfully', async () => {
      const result = await atvAdapter.validarComprobante(testClave);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('mode', 'SIMULATED');
      expect(result).toHaveProperty('clave', testClave);
      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('mensajes');
      expect(result).toHaveProperty('estado', 'VALIDADO_SIMULADO');
    });

    it('should fail when adapter is not initialized', async () => {
      atvAdapter.isInitialized = false;

      await expect(atvAdapter.validarComprobante('test-clave'))
        .rejects
        .toThrow('ATVAdapter no está inicializado');
    });
  });

  describe('Enviar Comprobante', () => {
    let testClave;

    beforeEach(async () => {
      await atvAdapter.init();
      
      const emitResult = await atvAdapter.emitirComprobante({
        emisor: { nombre: 'Test', identificacion: '123456789' },
        receptor: { nombre: 'Test', identificacion: '987654321' },
      });
      testClave = emitResult.clave;
    });

    it('should send simulated invoice successfully', async () => {
      const result = await atvAdapter.enviarComprobante(testClave);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('mode', 'SIMULATED');
      expect(result).toHaveProperty('clave', testClave);
      expect(result).toHaveProperty('estado', 'ENVIADO_SIMULADO');
      expect(result).toHaveProperty('numeroComprobante');
      expect(result).toHaveProperty('respuestaHacienda');
      expect(result.respuestaHacienda).toHaveProperty('codigo', '01');
    });
  });

  describe('Consultar Comprobante', () => {
    let testClave;

    beforeEach(async () => {
      await atvAdapter.init();
      
      const emitResult = await atvAdapter.emitirComprobante({
        emisor: { nombre: 'Test', identificacion: '123456789' },
        receptor: { nombre: 'Test', identificacion: '987654321' },
      });
      testClave = emitResult.clave;
    });

    it('should query simulated invoice successfully', async () => {
      const result = await atvAdapter.consultarComprobante(testClave);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('mode', 'SIMULATED');
      expect(result).toHaveProperty('clave', testClave);
      expect(result).toHaveProperty('estado', 'PROCESADO_SIMULADO');
      expect(result).toHaveProperty('estadoHacienda', 'ACEPTADO');
      expect(result).toHaveProperty('detalles');
    });
  });

  describe('Helper Methods', () => {
    beforeEach(async () => {
      await atvAdapter.init();
    });

    it('should generate valid consecutivos', () => {
      const consecutivo = atvAdapter._generarConsecutivo();
      
      expect(consecutivo).toMatch(/^[0-9]+$/);
      expect(consecutivo.length).toBe(20);
    });

    it('should generate valid claves', () => {
      const consecutivo = '00100101000000000001';
      const payload = {
        emisor: { identificacion: '123456789', nombre: 'Test' },
      };
      
      const clave = atvAdapter._generarClave(consecutivo, payload);
      
      expect(clave).toMatch(/^[0-9A-Za-z]+$/);
      expect(clave.length).toBe(50);
    });

    it('should generate valid XML structure', () => {
      const payload = {
        emisor: { nombre: 'Test Emisor', identificacion: '123456789' },
        receptor: { nombre: 'Test Receptor', identificacion: '987654321' },
        totales: { subtotal: 1000, impuesto: 130, total: 1130 },
        moneda: 'CRC',
      };
      const clave = '12345678901234567890123456789012345678901234567890';
      const consecutivo = '00100101000000000001';
      
      const xml = atvAdapter._generarXMLSimulado(payload, clave, consecutivo);
      
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<FacturaElectronica');
      expect(xml).toContain(`<Clave>${clave}</Clave>`);
      expect(xml).toContain(`<NumeroConsecutivo>${consecutivo}</NumeroConsecutivo>`);
      expect(xml).toContain('<Emisor>');
      expect(xml).toContain('<Receptor>');
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = atvAdapter._generarHashSimulado('input1');
      const hash2 = atvAdapter._generarHashSimulado('input2');
      
      expect(hash1).not.toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
      expect(hash2).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate valid numero comprobante', () => {
      const numero = atvAdapter._generarNumeroComprobante();
      
      expect(numero).toMatch(/^[0-9]{9}$/);
      expect(numero.length).toBe(9);
    });
  });
});