const request = require('supertest');
const app = require('../../src/app');
const invoiceStorage = require('../../src/services/invoiceStorage');
const atvAdapter = require('../../src/services/atvAdapter');
const { EjemploFactura } = require('../../src/models/facturaModel');

describe('Facturas API Integration Tests', () => {
  let server;
  const testConsecutivo = '00100101000000000001';

  beforeAll(async () => {
    // Inicializar ATV adapter para las pruebas
    await atvAdapter.init();
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('mode');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /info', () => {
    it('should return system information', async () => {
      const response = await request(app).get('/info');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('application');
      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('atv');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('POST /api/facturas/emitir', () => {
    it('should emit a new invoice successfully', async () => {
      const response = await request(app)
        .post('/api/facturas/emitir')
        .send(EjemploFactura)
        .expect('Content-Type', /json/);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('consecutivo');
      expect(response.body).toHaveProperty('clave');
      expect(response.body).toHaveProperty('estado');
      expect(response.body).toHaveProperty('archivos');
      expect(response.body.archivos).toHaveProperty('json');
    });

    it('should return validation error for invalid invoice data', async () => {
      const invalidInvoice = {
        ...EjemploFactura,
        emisor: {
          ...EjemploFactura.emisor,
          nombre: '', // Campo requerido vacío
        },
      };

      const response = await request(app)
        .post('/api/facturas/emitir')
        .send(invalidInvoice);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });

    it('should return error for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/facturas/emitir')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/facturas/validar', () => {
    let testClave;

    beforeAll(async () => {
      // Emitir una factura para usar en las validaciones
      const emitResponse = await request(app)
        .post('/api/facturas/emitir')
        .send(EjemploFactura);
      
      testClave = emitResponse.body.clave;
    });

    it('should validate invoice by clave', async () => {
      const response = await request(app)
        .post('/api/facturas/validar')
        .send({ clave: testClave });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('valid');
      expect(response.body).toHaveProperty('clave', testClave);
    });

    it('should validate invoice payload structurally', async () => {
      const response = await request(app)
        .post('/api/facturas/validar')
        .send({ payload: EjemploFactura });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('validacionEstructural');
      expect(response.body.validacionEstructural).toHaveProperty('valid', true);
    });

    it('should return error for invalid clave format', async () => {
      const response = await request(app)
        .post('/api/facturas/validar')
        .send({ clave: 'invalid-clave' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return error when no validation parameters provided', async () => {
      const response = await request(app)
        .post('/api/facturas/validar')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/facturas/enviar', () => {
    let testClave;
    let testConsecutivo;

    beforeAll(async () => {
      // Emitir una factura para usar en el envío
      const emitResponse = await request(app)
        .post('/api/facturas/emitir')
        .send(EjemploFactura);
      
      testClave = emitResponse.body.clave;
      testConsecutivo = emitResponse.body.consecutivo;
    });

    it('should send invoice by clave', async () => {
      const response = await request(app)
        .post('/api/facturas/enviar')
        .send({ clave: testClave });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('estado');
      expect(response.body).toHaveProperty('respuestaHacienda');
    });

    it('should send invoice by consecutivo', async () => {
      const response = await request(app)
        .post('/api/facturas/enviar')
        .send({ consecutivo: testConsecutivo });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('clave', testClave);
    });

    it('should return error when no parameters provided', async () => {
      const response = await request(app)
        .post('/api/facturas/enviar')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return error for non-existent consecutivo', async () => {
      const response = await request(app)
        .post('/api/facturas/enviar')
        .send({ consecutivo: '99999999999999999999' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/facturas/status', () => {
    it('should return system status', async () => {
      const response = await request(app).get('/api/facturas/status');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('sistema');
      expect(response.body).toHaveProperty('storage');
      expect(response.body).toHaveProperty('config');
    });
  });

  describe('GET /api/facturas', () => {
    beforeAll(async () => {
      // Emitir algunas facturas para las pruebas de listado
      await request(app)
        .post('/api/facturas/emitir')
        .send(EjemploFactura);
      
      await request(app)
        .post('/api/facturas/emitir')
        .send(EjemploFactura);
    });

    it('should list invoices with default parameters', async () => {
      const response = await request(app).get('/api/facturas');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('facturas');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.facturas)).toBe(true);
    });

    it('should list invoices with filters', async () => {
      const response = await request(app)
        .get('/api/facturas')
        .query({ status: 'pending', limit: 10 });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });

    it('should return error for invalid status filter', async () => {
      const response = await request(app)
        .get('/api/facturas')
        .query({ status: 'invalid' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/facturas/:consecutivo', () => {
    let testConsecutivo;

    beforeAll(async () => {
      // Emitir una factura para consultar
      const emitResponse = await request(app)
        .post('/api/facturas/emitir')
        .send(EjemploFactura);
      
      testConsecutivo = emitResponse.body.consecutivo;
    });

    it('should get invoice by consecutivo', async () => {
      const response = await request(app)
        .get(`/api/facturas/${testConsecutivo}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('consecutivo', testConsecutivo);
      expect(response.body).toHaveProperty('encontrada', true);
      expect(response.body).toHaveProperty('contenido');
    });

    it('should get invoice without content when requested', async () => {
      const response = await request(app)
        .get(`/api/facturas/${testConsecutivo}`)
        .query({ includeContent: 'false' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('archivos');
      expect(response.body).not.toHaveProperty('contenido');
    });

    it('should return 404 for non-existent invoice', async () => {
      const response = await request(app)
        .get('/api/facturas/99999999999999999999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return error for invalid consecutivo format', async () => {
      const response = await request(app)
        .get('/api/facturas/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/facturas/:consecutivo', () => {
    let testConsecutivo;

    beforeEach(async () => {
      // Emitir una factura para eliminar en cada test
      const emitResponse = await request(app)
        .post('/api/facturas/emitir')
        .send(EjemploFactura);
      
      testConsecutivo = emitResponse.body.consecutivo;
    });

    it('should delete invoice in development mode', async () => {
      // Asegurar que estamos en modo desarrollo
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .delete(`/api/facturas/${testConsecutivo}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('archivosEliminados');

      // Restaurar entorno
      process.env.NODE_ENV = originalEnv;
    });

    it('should reject deletion in production mode', async () => {
      // Simular modo producción
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .delete(`/api/facturas/${testConsecutivo}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('success', false);

      // Restaurar entorno
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('availableEndpoints');
    });

    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/facturas/emitir')
        .set('Content-Type', 'application/json')
        .send('{"malformed": json}');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle payload too large', async () => {
      const largePayload = {
        ...EjemploFactura,
        observaciones: 'x'.repeat(1000000), // String muy grande
      };

      const response = await request(app)
        .post('/api/facturas/emitir')
        .send(largePayload);
      
      // Dependiendo de la configuración, puede ser 413 o 400
      expect([400, 413]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});