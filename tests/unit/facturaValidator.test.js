const FacturaValidator = require('../../src/validators/facturaValidator');
const { EjemploFactura } = require('../../src/models/facturaModel');

describe('FacturaValidator Unit Tests', () => {
  describe('validateFactura', () => {
    it('should validate complete valid invoice', () => {
      const result = FacturaValidator.validateFactura(EjemploFactura);

      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('errors', []);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('emisor');
      expect(result.data).toHaveProperty('receptor');
      expect(result.data).toHaveProperty('detalleServicio');
      expect(result.data).toHaveProperty('resumenFactura');
    });

    it('should reject invoice with missing required fields', () => {
      const invalidInvoice = {
        ...EjemploFactura,
        emisor: undefined,
      };

      const result = FacturaValidator.validateFactura(invalidInvoice);

      expect(result).toHaveProperty('valid', false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toHaveProperty('field');
      expect(result.errors[0]).toHaveProperty('message');
    });

    it('should reject invoice with invalid emisor identificacion', () => {
      const invalidInvoice = {
        ...EjemploFactura,
        emisor: {
          ...EjemploFactura.emisor,
          identificacion: '123', // Too short
        },
      };

      const result = FacturaValidator.validateFactura(invalidInvoice);

      expect(result).toHaveProperty('valid', false);
      expect(result.errors.some(e => e.field.includes('identificacion'))).toBe(true);
    });

    it('should reject invoice with invalid email format', () => {
      const invalidInvoice = {
        ...EjemploFactura,
        emisor: {
          ...EjemploFactura.emisor,
          correoElectronico: 'invalid-email',
        },
      };

      const result = FacturaValidator.validateFactura(invalidInvoice);

      expect(result).toHaveProperty('valid', false);
      expect(result.errors.some(e => e.field.includes('correoElectronico'))).toBe(true);
    });

    it('should reject invoice with empty detalleServicio', () => {
      const invalidInvoice = {
        ...EjemploFactura,
        detalleServicio: [],
      };

      const result = FacturaValidator.validateFactura(invalidInvoice);

      expect(result).toHaveProperty('valid', false);
      expect(result.errors.some(e => e.field.includes('detalleServicio'))).toBe(true);
    });

    it('should reject invoice with invalid line numbers', () => {
      const invalidInvoice = {
        ...EjemploFactura,
        detalleServicio: [
          {
            ...EjemploFactura.detalleServicio[0],
            numeroLinea: 1,
          },
          {
            ...EjemploFactura.detalleServicio[1],
            numeroLinea: 3, // Should be 2
          },
        ],
      };

      const result = FacturaValidator.validateFactura(invalidInvoice);

      expect(result).toHaveProperty('valid', false);
      expect(result.errors.some(e => e.field.includes('numeroLinea'))).toBe(true);
    });

    it('should reject invoice with incorrect calculations', () => {
      const invalidInvoice = {
        ...EjemploFactura,
        detalleServicio: [
          {
            ...EjemploFactura.detalleServicio[0],
            montoTotal: 15000, // Should be 20000 (2 * 10000)
          },
        ],
      };

      const result = FacturaValidator.validateFactura(invalidInvoice);

      expect(result).toHaveProperty('valid', false);
      expect(result.errors.some(e => e.field.includes('montoTotal'))).toBe(true);
    });

    it('should validate with options', () => {
      const result = FacturaValidator.validateFactura(EjemploFactura, {
        abortEarly: true,
        allowUnknown: false,
      });

      expect(result).toHaveProperty('valid', true);
    });
  });

  describe('validateClave', () => {
    it('should validate correct clave format', () => {
      const validClave = '50612345678901234567890123456789012345678901234567';
      const result = FacturaValidator.validateClave(validClave);

      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('data', validClave);
    });

    it('should reject clave with incorrect length', () => {
      const invalidClave = '123456789'; // Too short
      const result = FacturaValidator.validateClave(invalidClave);

      expect(result).toHaveProperty('valid', false);
      expect(result.errors[0]).toHaveProperty('field', 'clave');
    });

    it('should reject clave with invalid characters', () => {
      const invalidClave = '1234567890123456789012345678901234567890123456789@';
      const result = FacturaValidator.validateClave(invalidClave);

      expect(result).toHaveProperty('valid', false);
    });
  });

  describe('validateConsecutivo', () => {
    it('should validate correct consecutivo format', () => {
      const validConsecutivo = '00100101000000000001';
      const result = FacturaValidator.validateConsecutivo(validConsecutivo);

      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('data', validConsecutivo);
    });

    it('should reject consecutivo with incorrect length', () => {
      const invalidConsecutivo = '123'; // Too short
      const result = FacturaValidator.validateConsecutivo(invalidConsecutivo);

      expect(result).toHaveProperty('valid', false);
    });

    it('should reject consecutivo with non-numeric characters', () => {
      const invalidConsecutivo = '0010010100000000000a';
      const result = FacturaValidator.validateConsecutivo(invalidConsecutivo);

      expect(result).toHaveProperty('valid', false);
    });
  });

  describe('validateEmisor', () => {
    it('should validate correct emisor', () => {
      const result = FacturaValidator.validateEmisor(EjemploFactura.emisor);

      expect(result).toHaveProperty('valid', true);
      expect(result.data).toHaveProperty('nombre');
      expect(result.data).toHaveProperty('identificacion');
    });

    it('should reject emisor without required fields', () => {
      const invalidEmisor = {
        nombre: 'Test',
        // Missing identificacion
      };

      const result = FacturaValidator.validateEmisor(invalidEmisor);

      expect(result).toHaveProperty('valid', false);
    });
  });

  describe('validateReceptor', () => {
    it('should validate correct receptor', () => {
      const result = FacturaValidator.validateReceptor(EjemploFactura.receptor);

      expect(result).toHaveProperty('valid', true);
      expect(result.data).toHaveProperty('nombre');
      expect(result.data).toHaveProperty('identificacion');
    });
  });

  describe('validateDetalle', () => {
    it('should validate correct detalle', () => {
      const result = FacturaValidator.validateDetalle(EjemploFactura.detalleServicio);

      expect(result).toHaveProperty('valid', true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should reject empty detalle', () => {
      const result = FacturaValidator.validateDetalle([]);

      expect(result).toHaveProperty('valid', false);
    });

    it('should reject detalle with invalid item', () => {
      const invalidDetalle = [{
        numeroLinea: 1,
        descripcion: 'Test',
        cantidad: -1, // Invalid negative quantity
        precioUnitario: 100,
      }];

      const result = FacturaValidator.validateDetalle(invalidDetalle);

      expect(result).toHaveProperty('valid', false);
    });
  });

  describe('validateTotales', () => {
    it('should validate correct totales', () => {
      const result = FacturaValidator.validateTotales(EjemploFactura.resumenFactura);

      expect(result).toHaveProperty('valid', true);
      expect(result.data).toHaveProperty('totalComprobante');
    });

    it('should reject totales without required fields', () => {
      const invalidTotales = {
        totalVenta: 1000,
        // Missing other required fields
      };

      const result = FacturaValidator.validateTotales(invalidTotales);

      expect(result).toHaveProperty('valid', false);
    });
  });

  describe('Business Logic Validation', () => {
    it('should validate correct business calculations', () => {
      const result = FacturaValidator.validateBusinessLogic(EjemploFactura);

      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('errors', []);
    });

    it('should detect incorrect line total calculation', () => {
      const invalidData = {
        ...EjemploFactura,
        detalleServicio: [
          {
            ...EjemploFactura.detalleServicio[0],
            cantidad: 2,
            precioUnitario: 10000,
            montoTotal: 15000, // Should be 20000
            descuento: 0,
            subtotal: 15000,
            impuesto: {
              ...EjemploFactura.detalleServicio[0].impuesto,
              monto: 1950,
            },
            montoTotalLinea: 16950,
          },
        ],
        resumenFactura: {
          ...EjemploFactura.resumenFactura,
          totalVenta: 15000,
          totalVentaNeta: 15000,
          totalGravado: 15000,
          totalImpuesto: 1950,
          totalComprobante: 16950,
        },
      };

      const result = FacturaValidator.validateBusinessLogic(invalidData);

      expect(result).toHaveProperty('valid', false);
      expect(result.errors.some(e => e.message.includes('Monto total incorrecto'))).toBe(true);
    });

    it('should detect incorrect total calculations', () => {
      const invalidData = {
        ...EjemploFactura,
        resumenFactura: {
          ...EjemploFactura.resumenFactura,
          totalVenta: 50000, // Incorrect total
        },
      };

      const result = FacturaValidator.validateBusinessLogic(invalidData);

      expect(result).toHaveProperty('valid', false);
      expect(result.errors.some(e => e.message.includes('Total de venta incorrecto'))).toBe(true);
    });
  });

  describe('getSchemas', () => {
    it('should return all available schemas', () => {
      const schemas = FacturaValidator.getSchemas();

      expect(schemas).toHaveProperty('factura');
      expect(schemas).toHaveProperty('emisor');
      expect(schemas).toHaveProperty('receptor');
      expect(schemas).toHaveProperty('item');
      expect(schemas).toHaveProperty('totales');
      expect(schemas).toHaveProperty('impuesto');
      expect(schemas).toHaveProperty('clave');
      expect(schemas).toHaveProperty('consecutivo');
    });
  });
});