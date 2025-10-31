const Joi = require('joi');

/**
 * Validador para facturas electrónicas usando Joi
 * Proporciona validación completa de todos los campos requeridos por Hacienda
 */

// Esquema para Emisor
const emisorSchema = Joi.object({
  nombre: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre del emisor es requerido',
      'string.max': 'El nombre del emisor no puede exceder 100 caracteres',
    }),
    
  identificacion: Joi.string()
    .pattern(/^[0-9]{9,12}$/)
    .required()
    .messages({
      'string.pattern.base': 'La identificación debe contener entre 9 y 12 dígitos',
      'string.empty': 'La identificación del emisor es requerida',
    }),
    
  tipoIdentificacion: Joi.string()
    .valid('01', '02', '03', '04')
    .default('02')
    .messages({
      'any.only': 'Tipo de identificación debe ser: 01 (Física), 02 (Jurídica), 03 (DIMEX), 04 (NITE)',
    }),
    
  correoElectronico: Joi.string()
    .email()
    .optional()
    .allow('')
    .messages({
      'string.email': 'El correo electrónico debe tener un formato válido',
    }),
    
  telefono: Joi.string()
    .max(20)
    .optional()
    .allow(''),
    
  codigoPais: Joi.string()
    .default('506'),
    
  provincia: Joi.string()
    .max(50)
    .optional()
    .allow(''),
    
  canton: Joi.string()
    .max(50)
    .optional()
    .allow(''),
    
  distrito: Joi.string()
    .max(50)
    .optional()
    .allow(''),
    
  direccion: Joi.string()
    .max(200)
    .optional()
    .allow(''),
});

// Esquema para Receptor
const receptorSchema = Joi.object({
  nombre: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre del receptor es requerido',
      'string.max': 'El nombre del receptor no puede exceder 100 caracteres',
    }),
    
  identificacion: Joi.string()
    .pattern(/^[0-9]{9,12}$/)
    .required()
    .messages({
      'string.pattern.base': 'La identificación debe contener entre 9 y 12 dígitos',
      'string.empty': 'La identificación del receptor es requerida',
    }),
    
  tipoIdentificacion: Joi.string()
    .valid('01', '02', '03', '04')
    .default('01')
    .messages({
      'any.only': 'Tipo de identificación debe ser: 01 (Física), 02 (Jurídica), 03 (DIMEX), 04 (NITE)',
    }),
    
  correoElectronico: Joi.string()
    .email()
    .optional()
    .allow('')
    .messages({
      'string.email': 'El correo electrónico debe tener un formato válido',
    }),
    
  telefono: Joi.string()
    .max(20)
    .optional()
    .allow(''),
});

// Esquema para Impuesto
const impuestoSchema = Joi.object({
  codigo: Joi.string()
    .valid('01', '02', '03', '04', '05', '06', '07', '08', '99')
    .default('01')
    .messages({
      'any.only': 'Código de impuesto inválido',
    }),
    
  codigoTarifa: Joi.string()
    .valid('01', '02', '03', '04', '05', '06', '07', '08')
    .default('08')
    .messages({
      'any.only': 'Código de tarifa de impuesto inválido',
    }),
    
  tarifa: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .default(13)
    .messages({
      'number.min': 'La tarifa debe ser mayor o igual a 0',
      'number.max': 'La tarifa no puede ser mayor a 100%',
    }),
    
  monto: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.min': 'El monto del impuesto debe ser mayor o igual a 0',
      'number.base': 'El monto del impuesto es requerido',
    }),
});

// Esquema para Item/Línea de detalle
const itemSchema = Joi.object({
  numeroLinea: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.min': 'El número de línea debe ser mayor a 0',
      'number.base': 'El número de línea es requerido',
    }),
    
  codigo: Joi.string()
    .max(20)
    .optional()
    .allow(''),
    
  descripcion: Joi.string()
    .max(200)
    .required()
    .messages({
      'string.empty': 'La descripción es requerida',
      'string.max': 'La descripción no puede exceder 200 caracteres',
    }),
    
  cantidad: Joi.number()
    .min(0.01)
    .precision(2)
    .required()
    .messages({
      'number.min': 'La cantidad debe ser mayor a 0',
      'number.base': 'La cantidad es requerida',
    }),
    
  unidadMedida: Joi.string()
    .valid('Unid', 'Kg', 'Lt', 'Mt', 'Hrs', 'Otros')
    .default('Unid')
    .messages({
      'any.only': 'Unidad de medida debe ser: Unid, Kg, Lt, Mt, Hrs, Otros',
    }),
    
  precioUnitario: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.min': 'El precio unitario debe ser mayor o igual a 0',
      'number.base': 'El precio unitario es requerido',
    }),
    
  montoTotal: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.min': 'El monto total debe ser mayor o igual a 0',
      'number.base': 'El monto total es requerido',
    }),
    
  descuento: Joi.number()
    .min(0)
    .precision(2)
    .default(0),
    
  naturalezaDescuento: Joi.string()
    .max(80)
    .optional()
    .allow(''),
    
  subtotal: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.min': 'El subtotal debe ser mayor o igual a 0',
      'number.base': 'El subtotal es requerido',
    }),
    
  impuesto: impuestoSchema.required(),
  
  montoTotalLinea: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.min': 'El monto total de línea debe ser mayor o igual a 0',
      'number.base': 'El monto total de línea es requerido',
    }),
});

// Esquema para Totales
const totalesSchema = Joi.object({
  montoTotalServiciosGravados: Joi.number()
    .min(0)
    .precision(2)
    .default(0),
    
  montoTotalServiciosExentos: Joi.number()
    .min(0)
    .precision(2)
    .default(0),
    
  montoTotalMercanciaGravada: Joi.number()
    .min(0)
    .precision(2)
    .default(0),
    
  montoTotalMercanciaExenta: Joi.number()
    .min(0)
    .precision(2)
    .default(0),
    
  totalGravado: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'El total gravado es requerido',
    }),
    
  totalExento: Joi.number()
    .min(0)
    .precision(2)
    .default(0),
    
  totalVenta: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'El total de venta es requerido',
    }),
    
  totalDescuentos: Joi.number()
    .min(0)
    .precision(2)
    .default(0),
    
  totalVentaNeta: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'El total de venta neta es requerido',
    }),
    
  totalImpuesto: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'El total de impuesto es requerido',
    }),
    
  totalComprobante: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'El total del comprobante es requerido',
    }),
});

// Esquema principal para Factura
const facturaSchema = Joi.object({
  tipoDocumento: Joi.string()
    .valid('01', '02', '03', '04', '05', '06', '07', '08', '09')
    .default('01')
    .messages({
      'any.only': 'Tipo de documento inválido',
    }),
    
  numeroConsecutivo: Joi.string()
    .pattern(/^[0-9]{20}$/)
    .optional()
    .messages({
      'string.pattern.base': 'El número consecutivo debe tener exactamente 20 dígitos',
    }),
    
  fechaEmision: Joi.string()
    .isoDate()
    .optional()
    .messages({
      'string.isoDate': 'La fecha de emisión debe estar en formato ISO 8601',
    }),
    
  codigoMoneda: Joi.string()
    .valid('CRC', 'USD', 'EUR')
    .default('CRC')
    .messages({
      'any.only': 'Código de moneda debe ser: CRC, USD, EUR',
    }),
    
  tipoCambio: Joi.number()
    .min(0.01)
    .precision(2)
    .default(1),
    
  emisor: emisorSchema.required(),
  
  receptor: receptorSchema.required(),
  
  detalleServicio: Joi.array()
    .items(itemSchema)
    .min(1)
    .max(1000)
    .required()
    .messages({
      'array.min': 'Debe incluir al menos un item en el detalle',
      'array.max': 'No puede incluir más de 1000 items',
      'array.base': 'El detalle de servicio es requerido',
    }),
    
  resumenFactura: totalesSchema.required(),
  
  condicionVenta: Joi.string()
    .valid('01', '02', '03', '04', '05', '99')
    .default('01')
    .messages({
      'any.only': 'Condición de venta inválida',
    }),
    
  plazoCredito: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.min': 'El plazo de crédito debe ser mayor o igual a 0',
    }),
    
  observaciones: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Las observaciones no pueden exceder 1000 caracteres',
    }),
});

// Esquema para validar clave de comprobante
const claveSchema = Joi.string()
  .length(50)
  .pattern(/^[0-9A-Za-z]+$/)
  .required()
  .messages({
    'string.length': 'La clave debe tener exactamente 50 caracteres',
    'string.pattern.base': 'La clave debe contener solo caracteres alfanuméricos',
    'string.empty': 'La clave es requerida',
  });

// Esquema para validar consecutivo
const consecutivoSchema = Joi.string()
  .length(20)
  .pattern(/^[0-9]+$/)
  .required()
  .messages({
    'string.length': 'El consecutivo debe tener exactamente 20 dígitos',
    'string.pattern.base': 'El consecutivo debe contener solo números',
    'string.empty': 'El consecutivo es requerido',
  });

/**
 * Clase principal del validador
 */
class FacturaValidator {
  /**
   * Valida una factura completa
   * @param {Object} factura - Datos de la factura
   * @param {Object} options - Opciones de validación
   * @returns {Object} Resultado de la validación
   */
  static validateFactura(factura, options = {}) {
    const { abortEarly = false, allowUnknown = false } = options;
    
    const result = facturaSchema.validate(factura, {
      abortEarly,
      allowUnknown,
      convert: true,
      stripUnknown: !allowUnknown,
    });

    if (result.error) {
      return {
        valid: false,
        errors: result.error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        })),
        data: null,
      };
    }

    // Validaciones adicionales de lógica de negocio
    const businessValidation = this.validateBusinessLogic(result.value);
    if (!businessValidation.valid) {
      return businessValidation;
    }

    return {
      valid: true,
      errors: [],
      data: result.value,
    };
  }

  /**
   * Valida una clave de comprobante
   * @param {string} clave - Clave a validar
   * @returns {Object} Resultado de la validación
   */
  static validateClave(clave) {
    const result = claveSchema.validate(clave);
    
    if (result.error) {
      return {
        valid: false,
        errors: result.error.details.map(detail => ({
          field: 'clave',
          message: detail.message,
          value: detail.context?.value,
        })),
      };
    }

    return {
      valid: true,
      errors: [],
      data: result.value,
    };
  }

  /**
   * Valida un consecutivo
   * @param {string} consecutivo - Consecutivo a validar
   * @returns {Object} Resultado de la validación
   */
  static validateConsecutivo(consecutivo) {
    const result = consecutivoSchema.validate(consecutivo);
    
    if (result.error) {
      return {
        valid: false,
        errors: result.error.details.map(detail => ({
          field: 'consecutivo',
          message: detail.message,
          value: detail.context?.value,
        })),
      };
    }

    return {
      valid: true,
      errors: [],
      data: result.value,
    };
  }

  /**
   * Valida solo el emisor
   * @param {Object} emisor - Datos del emisor
   * @returns {Object} Resultado de la validación
   */
  static validateEmisor(emisor) {
    const result = emisorSchema.validate(emisor);
    return this._formatValidationResult(result);
  }

  /**
   * Valida solo el receptor
   * @param {Object} receptor - Datos del receptor
   * @returns {Object} Resultado de la validación
   */
  static validateReceptor(receptor) {
    const result = receptorSchema.validate(receptor);
    return this._formatValidationResult(result);
  }

  /**
   * Valida el detalle de servicios
   * @param {Array} detalle - Detalle de servicios
   * @returns {Object} Resultado de la validación
   */
  static validateDetalle(detalle) {
    const schema = Joi.array().items(itemSchema).min(1).max(1000);
    const result = schema.validate(detalle);
    return this._formatValidationResult(result);
  }

  /**
   * Valida los totales
   * @param {Object} totales - Totales de la factura
   * @returns {Object} Resultado de la validación
   */
  static validateTotales(totales) {
    const result = totalesSchema.validate(totales);
    return this._formatValidationResult(result);
  }

  /**
   * Validaciones de lógica de negocio
   * @param {Object} factura - Factura validada por esquema
   * @returns {Object} Resultado de la validación
   */
  static validateBusinessLogic(factura) {
    const errors = [];

    // Validar que los números de línea sean secuenciales
    const lineas = factura.detalleServicio;
    for (let i = 0; i < lineas.length; i++) {
      if (lineas[i].numeroLinea !== i + 1) {
        errors.push({
          field: `detalleServicio[${i}].numeroLinea`,
          message: `El número de línea debe ser ${i + 1}, recibido: ${lineas[i].numeroLinea}`,
          value: lineas[i].numeroLinea,
        });
      }

      // Validar cálculos de la línea
      const linea = lineas[i];
      const montoEsperado = linea.cantidad * linea.precioUnitario;
      if (Math.abs(linea.montoTotal - montoEsperado) > 0.01) {
        errors.push({
          field: `detalleServicio[${i}].montoTotal`,
          message: `Monto total incorrecto. Esperado: ${montoEsperado}, recibido: ${linea.montoTotal}`,
          value: linea.montoTotal,
        });
      }

      const subtotalEsperado = linea.montoTotal - linea.descuento;
      if (Math.abs(linea.subtotal - subtotalEsperado) > 0.01) {
        errors.push({
          field: `detalleServicio[${i}].subtotal`,
          message: `Subtotal incorrecto. Esperado: ${subtotalEsperado}, recibido: ${linea.subtotal}`,
          value: linea.subtotal,
        });
      }

      const impuestoEsperado = (linea.subtotal * linea.impuesto.tarifa) / 100;
      if (Math.abs(linea.impuesto.monto - impuestoEsperado) > 0.01) {
        errors.push({
          field: `detalleServicio[${i}].impuesto.monto`,
          message: `Impuesto incorrecto. Esperado: ${impuestoEsperado}, recibido: ${linea.impuesto.monto}`,
          value: linea.impuesto.monto,
        });
      }

      const totalLineaEsperado = linea.subtotal + linea.impuesto.monto;
      if (Math.abs(linea.montoTotalLinea - totalLineaEsperado) > 0.01) {
        errors.push({
          field: `detalleServicio[${i}].montoTotalLinea`,
          message: `Total de línea incorrecto. Esperado: ${totalLineaEsperado}, recibido: ${linea.montoTotalLinea}`,
          value: linea.montoTotalLinea,
        });
      }
    }

    // Validar totales generales
    const totales = factura.resumenFactura;
    const totalVentaCalculado = lineas.reduce((sum, linea) => sum + linea.montoTotal, 0);
    if (Math.abs(totales.totalVenta - totalVentaCalculado) > 0.01) {
      errors.push({
        field: 'resumenFactura.totalVenta',
        message: `Total de venta incorrecto. Calculado: ${totalVentaCalculado}, recibido: ${totales.totalVenta}`,
        value: totales.totalVenta,
      });
    }

    const totalDescuentosCalculado = lineas.reduce((sum, linea) => sum + linea.descuento, 0);
    if (Math.abs(totales.totalDescuentos - totalDescuentosCalculado) > 0.01) {
      errors.push({
        field: 'resumenFactura.totalDescuentos',
        message: `Total de descuentos incorrecto. Calculado: ${totalDescuentosCalculado}, recibido: ${totales.totalDescuentos}`,
        value: totales.totalDescuentos,
      });
    }

    const totalImpuestoCalculado = lineas.reduce((sum, linea) => sum + linea.impuesto.monto, 0);
    if (Math.abs(totales.totalImpuesto - totalImpuestoCalculado) > 0.01) {
      errors.push({
        field: 'resumenFactura.totalImpuesto',
        message: `Total de impuesto incorrecto. Calculado: ${totalImpuestoCalculado}, recibido: ${totales.totalImpuesto}`,
        value: totales.totalImpuesto,
      });
    }

    const totalComprobanteCalculado = totales.totalVentaNeta + totales.totalImpuesto;
    if (Math.abs(totales.totalComprobante - totalComprobanteCalculado) > 0.01) {
      errors.push({
        field: 'resumenFactura.totalComprobante',
        message: `Total del comprobante incorrecto. Calculado: ${totalComprobanteCalculado}, recibido: ${totales.totalComprobante}`,
        value: totales.totalComprobante,
      });
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        data: null,
      };
    }

    return {
      valid: true,
      errors: [],
      data: factura,
    };
  }

  /**
   * Formatea el resultado de validación de Joi
   * @private
   */
  static _formatValidationResult(result) {
    if (result.error) {
      return {
        valid: false,
        errors: result.error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        })),
        data: null,
      };
    }

    return {
      valid: true,
      errors: [],
      data: result.value,
    };
  }

  /**
   * Obtiene los esquemas disponibles
   * @returns {Object} Objeto con todos los esquemas
   */
  static getSchemas() {
    return {
      factura: facturaSchema,
      emisor: emisorSchema,
      receptor: receptorSchema,
      item: itemSchema,
      totales: totalesSchema,
      impuesto: impuestoSchema,
      clave: claveSchema,
      consecutivo: consecutivoSchema,
    };
  }
}

module.exports = FacturaValidator;