const Joi = require('joi');

/**
 * English Invoice Model and Validator for Costa Rica Electronic Invoicing
 * Based on official Hacienda requirements but with English field names
 */

/**
 * Issuer (Emisor) validation schema
 */
const issuerSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'Issuer name must be text',
      'string.empty': 'Issuer name is required',
      'string.min': 'Issuer name must have at least 1 character',
      'string.max': 'Issuer name cannot exceed 100 characters',
      'any.required': 'Issuer name is required',
    }),

  identification: Joi.string()
    .pattern(/^[0-9]{9,12}$/)
    .required()
    .messages({
      'string.pattern.base': 'Issuer identification must be 9-12 digits',
      'any.required': 'Issuer identification is required',
    }),

  identificationType: Joi.string()
    .valid('01', '02', '03', '04')
    .default('02')
    .messages({
      'any.only': 'Identification type must be: 01 (Physical), 02 (Legal Entity), 03 (DIMEX), 04 (NITE)',
    }),

  email: Joi.string()
    .email()
    .allow('')
    .messages({
      'string.email': 'Invalid email format',
    }),

  phone: Joi.string()
    .max(20)
    .allow('')
    .messages({
      'string.max': 'Phone cannot exceed 20 characters',
    }),

  countryCode: Joi.string()
    .length(3)
    .default('506')
    .messages({
      'string.length': 'Country code must be 3 digits',
    }),

  province: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': 'Province cannot exceed 50 characters',
    }),

  canton: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': 'Canton cannot exceed 50 characters',
    }),

  district: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': 'District cannot exceed 50 characters',
    }),

  address: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Address cannot exceed 200 characters',
    }),
});

/**
 * Receiver (Receptor) validation schema
 */
const receiverSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'Receiver name must be text',
      'string.empty': 'Receiver name is required',
      'string.min': 'Receiver name must have at least 1 character',
      'string.max': 'Receiver name cannot exceed 100 characters',
      'any.required': 'Receiver name is required',
    }),

  identification: Joi.string()
    .pattern(/^[0-9]{9,12}$/)
    .required()
    .messages({
      'string.pattern.base': 'Receiver identification must be 9-12 digits',
      'any.required': 'Receiver identification is required',
    }),

  identificationType: Joi.string()
    .valid('01', '02', '03', '04')
    .default('02')
    .messages({
      'any.only': 'Identification type must be: 01 (Physical), 02 (Legal Entity), 03 (DIMEX), 04 (NITE)',
    }),

  email: Joi.string()
    .email()
    .allow('')
    .messages({
      'string.email': 'Invalid email format',
    }),

  phone: Joi.string()
    .max(20)
    .allow('')
    .messages({
      'string.max': 'Phone cannot exceed 20 characters',
    }),
});

/**
 * Tax validation schema
 */
const taxSchema = Joi.object({
  code: Joi.string()
    .valid('01', '02', '03', '04', '05', '06', '07', '08', '99')
    .required()
    .messages({
      'any.only': 'Tax code must be: 01 (Sales Tax), 02 (Selective Consumption), 03 (Digital Services), etc.',
      'any.required': 'Tax code is required',
    }),

  rateCode: Joi.string()
    .valid('01', '02', '03', '04', '05', '06', '07', '08')
    .required()
    .messages({
      'any.only': 'Tax rate code must be between 01-08',
      'any.required': 'Tax rate code is required',
    }),

  rate: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Tax rate must be a number',
      'number.min': 'Tax rate cannot be negative',
      'number.max': 'Tax rate cannot exceed 100%',
      'any.required': 'Tax rate is required',
    }),

  amount: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Tax amount must be a number',
      'number.min': 'Tax amount cannot be negative',
      'any.required': 'Tax amount is required',
    }),
});

/**
 * Service/Product detail line validation schema
 */
const serviceDetailSchema = Joi.object({
  lineNumber: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'number.base': 'Line number must be a number',
      'number.integer': 'Line number must be an integer',
      'number.min': 'Line number must be at least 1',
      'number.max': 'Line number cannot exceed 1000',
      'any.required': 'Line number is required',
    }),

  code: Joi.string()
    .max(20)
    .allow('')
    .messages({
      'string.max': 'Product/service code cannot exceed 20 characters',
    }),

  description: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.base': 'Description must be text',
      'string.empty': 'Description is required',
      'string.min': 'Description must have at least 1 character',
      'string.max': 'Description cannot exceed 200 characters',
      'any.required': 'Description is required',
    }),

  quantity: Joi.number()
    .min(0.01)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.min': 'Quantity must be at least 0.01',
      'any.required': 'Quantity is required',
    }),

  unitOfMeasure: Joi.string()
    .valid('Unit', 'Kg', 'Lt', 'Mt', 'Hrs', 'Others')
    .default('Unit')
    .messages({
      'any.only': 'Unit of measure must be: Unit, Kg, Lt, Mt, Hrs, or Others',
    }),

  unitPrice: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Unit price must be a number',
      'number.min': 'Unit price cannot be negative',
      'any.required': 'Unit price is required',
    }),

  totalAmount: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Total amount must be a number',
      'number.min': 'Total amount cannot be negative',
      'any.required': 'Total amount is required',
    }),

  discount: Joi.number()
    .min(0)
    .precision(2)
    .default(0)
    .messages({
      'number.base': 'Discount must be a number',
      'number.min': 'Discount cannot be negative',
    }),

  discountNature: Joi.string()
    .max(80)
    .allow('')
    .messages({
      'string.max': 'Discount nature cannot exceed 80 characters',
    }),

  subtotal: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Subtotal must be a number',
      'number.min': 'Subtotal cannot be negative',
      'any.required': 'Subtotal is required',
    }),

  tax: taxSchema.required(),

  totalLineAmount: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Total line amount must be a number',
      'number.min': 'Total line amount cannot be negative',
      'any.required': 'Total line amount is required',
    }),
});

/**
 * Invoice summary validation schema
 */
const invoiceSummarySchema = Joi.object({
  totalTaxableServices: Joi.number()
    .min(0)
    .precision(2)
    .default(0)
    .messages({
      'number.base': 'Total taxable services must be a number',
      'number.min': 'Total taxable services cannot be negative',
    }),

  totalExemptServices: Joi.number()
    .min(0)
    .precision(2)
    .default(0)
    .messages({
      'number.base': 'Total exempt services must be a number',
      'number.min': 'Total exempt services cannot be negative',
    }),

  totalTaxableGoods: Joi.number()
    .min(0)
    .precision(2)
    .default(0)
    .messages({
      'number.base': 'Total taxable goods must be a number',
      'number.min': 'Total taxable goods cannot be negative',
    }),

  totalExemptGoods: Joi.number()
    .min(0)
    .precision(2)
    .default(0)
    .messages({
      'number.base': 'Total exempt goods must be a number',
      'number.min': 'Total exempt goods cannot be negative',
    }),

  totalTaxable: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Total taxable must be a number',
      'number.min': 'Total taxable cannot be negative',
      'any.required': 'Total taxable is required',
    }),

  totalExempt: Joi.number()
    .min(0)
    .precision(2)
    .default(0)
    .messages({
      'number.base': 'Total exempt must be a number',
      'number.min': 'Total exempt cannot be negative',
    }),

  totalSale: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Total sale must be a number',
      'number.min': 'Total sale cannot be negative',
      'any.required': 'Total sale is required',
    }),

  totalDiscounts: Joi.number()
    .min(0)
    .precision(2)
    .default(0)
    .messages({
      'number.base': 'Total discounts must be a number',
      'number.min': 'Total discounts cannot be negative',
    }),

  totalNetSale: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Total net sale must be a number',
      'number.min': 'Total net sale cannot be negative',
      'any.required': 'Total net sale is required',
    }),

  totalTax: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Total tax must be a number',
      'number.min': 'Total tax cannot be negative',
      'any.required': 'Total tax is required',
    }),

  totalInvoice: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Total invoice must be a number',
      'number.min': 'Total invoice cannot be negative',
      'any.required': 'Total invoice is required',
    }),
});

/**
 * Main invoice validation schema
 */
const englishInvoiceSchema = Joi.object({
  documentType: Joi.string()
    .valid('01', '02', '03', '04', '05', '06', '07', '08', '09')
    .default('01')
    .messages({
      'any.only': 'Document type must be: 01 (Electronic Invoice), 02 (Debit Note), 03 (Credit Note), etc.',
    }),

  currencyCode: Joi.string()
    .valid('CRC', 'USD', 'EUR')
    .default('CRC')
    .messages({
      'any.only': 'Currency code must be: CRC (Costa Rican Colón), USD (US Dollar), EUR (Euro)',
    }),

  exchangeRate: Joi.number()
    .min(0.01)
    .precision(2)
    .default(1.0)
    .messages({
      'number.base': 'Exchange rate must be a number',
      'number.min': 'Exchange rate must be at least 0.01',
    }),

  issuer: issuerSchema.required(),

  receiver: receiverSchema.required(),

  serviceDetail: Joi.array()
    .items(serviceDetailSchema)
    .min(1)
    .max(1000)
    .required()
    .messages({
      'array.min': 'At least one service/product line is required',
      'array.max': 'Cannot exceed 1000 service/product lines',
      'any.required': 'Service detail is required',
    }),

  invoiceSummary: invoiceSummarySchema.required(),

  saleCondition: Joi.string()
    .valid('01', '02', '03', '04', '05', '99')
    .default('01')
    .messages({
      'any.only': 'Sale condition must be: 01 (Cash), 02 (Credit), 03 (Consignment), 04 (Apartment), 05 (Lease), 99 (Others)',
    }),

  creditTerm: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Credit term must be a number',
      'number.integer': 'Credit term must be an integer',
      'number.min': 'Credit term cannot be negative',
    }),

  observations: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Observations cannot exceed 1000 characters',
    }),

  issuanceDate: Joi.string()
    .isoDate()
    .messages({
      'string.isoDate': 'Issuance date must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)',
    }),

  consecutiveNumber: Joi.string()
    .pattern(/^[0-9]{20}$/)
    .messages({
      'string.pattern.base': 'Consecutive number must be exactly 20 digits',
    }),
});

/**
 * English Invoice Validator Class
 */
class EnglishInvoiceValidator {
  /**
   * Validates a complete invoice payload
   * @param {Object} invoiceData - Invoice data to validate
   * @returns {Object} Validation result
   */
  static validateInvoice(invoiceData) {
    const result = englishInvoiceSchema.validate(invoiceData, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (result.error) {
      const errors = result.error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      return {
        isValid: false,
        errors,
        data: null,
      };
    }

    // Business logic validation
    const businessValidation = this.validateBusinessLogic(result.value);
    if (!businessValidation.isValid) {
      return businessValidation;
    }

    return {
      isValid: true,
      errors: [],
      data: result.value,
    };
  }

  /**
   * Validates business logic rules
   * @param {Object} invoiceData - Validated invoice data
   * @returns {Object} Business validation result
   */
  static validateBusinessLogic(invoiceData) {
    const errors = [];

    // Validate line calculations
    invoiceData.serviceDetail.forEach((line, index) => {
      // Total amount should equal quantity * unit price
      const expectedTotal = Number((line.quantity * line.unitPrice).toFixed(2));
      if (Math.abs(line.totalAmount - expectedTotal) > 0.01) {
        errors.push({
          field: `serviceDetail[${index}].totalAmount`,
          message: `Total amount should be ${expectedTotal} (quantity × unit price)`,
          value: line.totalAmount,
        });
      }

      // Subtotal should equal total amount - discount
      const expectedSubtotal = Number((line.totalAmount - (line.discount || 0)).toFixed(2));
      if (Math.abs(line.subtotal - expectedSubtotal) > 0.01) {
        errors.push({
          field: `serviceDetail[${index}].subtotal`,
          message: `Subtotal should be ${expectedSubtotal} (total amount - discount)`,
          value: line.subtotal,
        });
      }

      // Tax amount should match rate calculation
      const expectedTaxAmount = Number((line.subtotal * (line.tax.rate / 100)).toFixed(2));
      if (Math.abs(line.tax.amount - expectedTaxAmount) > 0.01) {
        errors.push({
          field: `serviceDetail[${index}].tax.amount`,
          message: `Tax amount should be ${expectedTaxAmount} (subtotal × tax rate)`,
          value: line.tax.amount,
        });
      }

      // Total line amount should equal subtotal + tax
      const expectedLineTotal = Number((line.subtotal + line.tax.amount).toFixed(2));
      if (Math.abs(line.totalLineAmount - expectedLineTotal) > 0.01) {
        errors.push({
          field: `serviceDetail[${index}].totalLineAmount`,
          message: `Total line amount should be ${expectedLineTotal} (subtotal + tax)`,
          value: line.totalLineAmount,
        });
      }
    });

    // Validate summary totals
    const calculatedTotals = this.calculateSummaryTotals(invoiceData.serviceDetail);
    const summary = invoiceData.invoiceSummary;

    if (Math.abs(summary.totalTaxable - calculatedTotals.totalTaxable) > 0.01) {
      errors.push({
        field: 'invoiceSummary.totalTaxable',
        message: `Total taxable should be ${calculatedTotals.totalTaxable}`,
        value: summary.totalTaxable,
      });
    }

    if (Math.abs(summary.totalNetSale - calculatedTotals.totalNetSale) > 0.01) {
      errors.push({
        field: 'invoiceSummary.totalNetSale',
        message: `Total net sale should be ${calculatedTotals.totalNetSale}`,
        value: summary.totalNetSale,
      });
    }

    if (Math.abs(summary.totalTax - calculatedTotals.totalTax) > 0.01) {
      errors.push({
        field: 'invoiceSummary.totalTax',
        message: `Total tax should be ${calculatedTotals.totalTax}`,
        value: summary.totalTax,
      });
    }

    if (Math.abs(summary.totalInvoice - calculatedTotals.totalInvoice) > 0.01) {
      errors.push({
        field: 'invoiceSummary.totalInvoice',
        message: `Total invoice should be ${calculatedTotals.totalInvoice}`,
        value: summary.totalInvoice,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? invoiceData : null,
    };
  }

  /**
   * Calculates summary totals from service detail lines
   * @param {Array} serviceDetail - Array of service detail lines
   * @returns {Object} Calculated totals
   */
  static calculateSummaryTotals(serviceDetail) {
    let totalTaxable = 0;
    let totalDiscounts = 0;
    let totalTax = 0;
    let totalInvoice = 0;

    serviceDetail.forEach(line => {
      totalTaxable += line.totalAmount;
      totalDiscounts += line.discount || 0;
      totalTax += line.tax.amount;
      totalInvoice += line.totalLineAmount;
    });

    const totalNetSale = totalTaxable - totalDiscounts;

    return {
      totalTaxable: Number(totalTaxable.toFixed(2)),
      totalDiscounts: Number(totalDiscounts.toFixed(2)),
      totalNetSale: Number(totalNetSale.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      totalInvoice: Number(totalInvoice.toFixed(2)),
    };
  }

  /**
   * Converts Spanish invoice structure to English structure
   * @param {Object} spanishInvoice - Invoice in Spanish format
   * @returns {Object} Invoice in English format
   */
  static convertFromSpanish(spanishInvoice) {
    return {
      documentType: spanishInvoice.tipoDocumento,
      currencyCode: spanishInvoice.codigoMoneda,
      exchangeRate: spanishInvoice.tipoCambio,
      
      issuer: {
        name: spanishInvoice.emisor.nombre,
        identification: spanishInvoice.emisor.identificacion,
        identificationType: spanishInvoice.emisor.tipoIdentificacion,
        email: spanishInvoice.emisor.correoElectronico,
        phone: spanishInvoice.emisor.telefono,
        countryCode: spanishInvoice.emisor.codigoPais,
        province: spanishInvoice.emisor.provincia,
        canton: spanishInvoice.emisor.canton,
        district: spanishInvoice.emisor.distrito,
        address: spanishInvoice.emisor.direccion,
      },
      
      receiver: {
        name: spanishInvoice.receptor.nombre,
        identification: spanishInvoice.receptor.identificacion,
        identificationType: spanishInvoice.receptor.tipoIdentificacion,
        email: spanishInvoice.receptor.correoElectronico,
        phone: spanishInvoice.receptor.telefono,
      },
      
      serviceDetail: spanishInvoice.detalleServicio.map(item => ({
        lineNumber: item.numeroLinea,
        code: item.codigo,
        description: item.descripcion,
        quantity: item.cantidad,
        unitOfMeasure: this.translateUnitOfMeasure(item.unidadMedida),
        unitPrice: item.precioUnitario,
        totalAmount: item.montoTotal,
        discount: item.descuento,
        discountNature: item.naturalezaDescuento,
        subtotal: item.subtotal,
        tax: {
          code: item.impuesto.codigo,
          rateCode: item.impuesto.codigoTarifa,
          rate: item.impuesto.tarifa,
          amount: item.impuesto.monto,
        },
        totalLineAmount: item.montoTotalLinea,
      })),
      
      invoiceSummary: {
        totalTaxableServices: spanishInvoice.resumenFactura.montoTotalServiciosGravados,
        totalExemptServices: spanishInvoice.resumenFactura.montoTotalServiciosExentos,
        totalTaxableGoods: spanishInvoice.resumenFactura.montoTotalMercanciaGravada,
        totalExemptGoods: spanishInvoice.resumenFactura.montoTotalMercanciaExenta,
        totalTaxable: spanishInvoice.resumenFactura.totalGravado,
        totalExempt: spanishInvoice.resumenFactura.totalExento,
        totalSale: spanishInvoice.resumenFactura.totalVenta,
        totalDiscounts: spanishInvoice.resumenFactura.totalDescuentos,
        totalNetSale: spanishInvoice.resumenFactura.totalVentaNeta,
        totalTax: spanishInvoice.resumenFactura.totalImpuesto,
        totalInvoice: spanishInvoice.resumenFactura.totalComprobante,
      },
      
      saleCondition: spanishInvoice.condicionVenta,
      creditTerm: spanishInvoice.plazoCredito,
      observations: spanishInvoice.observaciones,
      issuanceDate: spanishInvoice.fechaEmision,
      consecutiveNumber: spanishInvoice.numeroConsecutivo,
    };
  }

  /**
   * Translates unit of measure from Spanish to English
   * @param {string} spanishUnit - Spanish unit of measure
   * @returns {string} English unit of measure
   */
  static translateUnitOfMeasure(spanishUnit) {
    const translations = {
      'Unid': 'Unit',
      'Kg': 'Kg',
      'Lt': 'Lt',
      'Mt': 'Mt',
      'Hrs': 'Hrs',
      'Otros': 'Others',
    };
    return translations[spanishUnit] || 'Unit';
  }
}

module.exports = {
  EnglishInvoiceValidator,
  englishInvoiceSchema,
  issuerSchema,
  receiverSchema,
  serviceDetailSchema,
  taxSchema,
  invoiceSummarySchema,
};