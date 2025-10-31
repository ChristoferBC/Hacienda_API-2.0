/**
 * Modelos de datos para facturas electrónicas
 * Define las estructuras de datos utilizadas en el sistema de facturación
 */

/**
 * Modelo de Emisor
 */
const EmisorModel = {
  nombre: {
    type: 'string',
    required: true,
    maxLength: 100,
    description: 'Nombre completo del emisor',
  },
  identificacion: {
    type: 'string',
    required: true,
    pattern: /^[0-9]{9,12}$/,
    description: 'Número de identificación (cédula física/jurídica)',
  },
  tipoIdentificacion: {
    type: 'string',
    enum: ['01', '02', '03', '04'], // 01: Física, 02: Jurídica, 03: DIMEX, 04: NITE
    default: '02',
    description: 'Tipo de identificación según Hacienda',
  },
  correoElectronico: {
    type: 'string',
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    description: 'Correo electrónico del emisor',
  },
  telefono: {
    type: 'string',
    required: false,
    maxLength: 20,
    description: 'Número de teléfono',
  },
  codigoPais: {
    type: 'string',
    default: '506',
    description: 'Código de país (506 para Costa Rica)',
  },
  provincia: {
    type: 'string',
    required: false,
    maxLength: 50,
    description: 'Provincia',
  },
  canton: {
    type: 'string',
    required: false,
    maxLength: 50,
    description: 'Cantón',
  },
  distrito: {
    type: 'string',
    required: false,
    maxLength: 50,
    description: 'Distrito',
  },
  direccion: {
    type: 'string',
    required: false,
    maxLength: 200,
    description: 'Dirección exacta',
  },
};

/**
 * Modelo de Receptor
 */
const ReceptorModel = {
  nombre: {
    type: 'string',
    required: true,
    maxLength: 100,
    description: 'Nombre completo del receptor',
  },
  identificacion: {
    type: 'string',
    required: true,
    pattern: /^[0-9]{9,12}$/,
    description: 'Número de identificación del receptor',
  },
  tipoIdentificacion: {
    type: 'string',
    enum: ['01', '02', '03', '04'],
    default: '01',
    description: 'Tipo de identificación según Hacienda',
  },
  correoElectronico: {
    type: 'string',
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    description: 'Correo electrónico del receptor',
  },
  telefono: {
    type: 'string',
    required: false,
    maxLength: 20,
    description: 'Número de teléfono',
  },
};

/**
 * Modelo de Item/Línea de Factura
 */
const ItemModel = {
  numeroLinea: {
    type: 'number',
    required: true,
    min: 1,
    description: 'Número de línea secuencial',
  },
  codigo: {
    type: 'string',
    required: false,
    maxLength: 20,
    description: 'Código interno del producto/servicio',
  },
  descripcion: {
    type: 'string',
    required: true,
    maxLength: 200,
    description: 'Descripción del producto o servicio',
  },
  cantidad: {
    type: 'number',
    required: true,
    min: 0.01,
    multipleOf: 0.01,
    description: 'Cantidad de unidades',
  },
  unidadMedida: {
    type: 'string',
    enum: ['Unid', 'Kg', 'Lt', 'Mt', 'Hrs', 'Otros'],
    default: 'Unid',
    description: 'Unidad de medida',
  },
  precioUnitario: {
    type: 'number',
    required: true,
    min: 0,
    multipleOf: 0.01,
    description: 'Precio unitario sin impuestos',
  },
  montoTotal: {
    type: 'number',
    required: true,
    min: 0,
    multipleOf: 0.01,
    description: 'Monto total de la línea (cantidad × precio unitario)',
  },
  descuento: {
    type: 'number',
    required: false,
    min: 0,
    multipleOf: 0.01,
    default: 0,
    description: 'Monto de descuento aplicado',
  },
  naturalezaDescuento: {
    type: 'string',
    required: false,
    maxLength: 80,
    description: 'Descripción del descuento aplicado',
  },
  subtotal: {
    type: 'number',
    required: true,
    min: 0,
    multipleOf: 0.01,
    description: 'Subtotal después de descuentos',
  },
  impuesto: {
    type: 'object',
    required: true,
    properties: {
      codigo: {
        type: 'string',
        enum: ['01', '02', '03', '04', '05', '06', '07', '08', '99'], // IVA, Selectivo, etc.
        default: '01', // IVA
        description: 'Código del tipo de impuesto',
      },
      codigoTarifa: {
        type: 'string',
        enum: ['01', '02', '03', '04', '05', '06', '07', '08'],
        default: '08', // 13% IVA general
        description: 'Código de tarifa del impuesto',
      },
      tarifa: {
        type: 'number',
        required: true,
        min: 0,
        max: 100,
        multipleOf: 0.01,
        default: 13,
        description: 'Porcentaje de la tarifa (ej: 13 para 13%)',
      },
      monto: {
        type: 'number',
        required: true,
        min: 0,
        multipleOf: 0.01,
        description: 'Monto del impuesto calculado',
      },
    },
    description: 'Información del impuesto aplicado',
  },
  montoTotalLinea: {
    type: 'number',
    required: true,
    min: 0,
    multipleOf: 0.01,
    description: 'Monto total de la línea incluyendo impuestos',
  },
};

/**
 * Modelo de Totales
 */
const TotalesModel = {
  montoTotalServiciosGravados: {
    type: 'number',
    required: false,
    min: 0,
    multipleOf: 0.01,
    default: 0,
    description: 'Total de servicios gravados',
  },
  montoTotalServiciosExentos: {
    type: 'number',
    required: false,
    min: 0,
    multipleOf: 0.01,
    default: 0,
    description: 'Total de servicios exentos',
  },
  montoTotalMercanciaGravada: {
    type: 'number',
    required: false,
    min: 0,
    multipleOf: 0.01,
    default: 0,
    description: 'Total de mercancía gravada',
  },
  montoTotalMercanciaExenta: {
    type: 'number',
    required: false,
    min: 0,
    multipleOf: 0.01,
    default: 0,
    description: 'Total de mercancía exenta',
  },
  totalGravado: {
    type: 'number',
    required: true,
    min: 0,
    multipleOf: 0.01,
    description: 'Total gravado (servicios + mercancía gravada)',
  },
  totalExento: {
    type: 'number',
    required: false,
    min: 0,
    multipleOf: 0.01,
    default: 0,
    description: 'Total exento (servicios + mercancía exenta)',
  },
  totalVenta: {
    type: 'number',
    required: true,
    min: 0,
    multipleOf: 0.01,
    description: 'Total de venta antes de descuentos e impuestos',
  },
  totalDescuentos: {
    type: 'number',
    required: false,
    min: 0,
    multipleOf: 0.01,
    default: 0,
    description: 'Total de descuentos aplicados',
  },
  totalVentaNeta: {
    type: 'number',
    required: true,
    min: 0,
    multipleOf: 0.01,
    description: 'Total de venta después de descuentos',
  },
  totalImpuesto: {
    type: 'number',
    required: true,
    min: 0,
    multipleOf: 0.01,
    description: 'Total de impuestos',
  },
  totalComprobante: {
    type: 'number',
    required: true,
    min: 0,
    multipleOf: 0.01,
    description: 'Total final del comprobante',
  },
};

/**
 * Modelo principal de Factura
 */
const FacturaModel = {
  // Información general
  tipoDocumento: {
    type: 'string',
    enum: ['01', '02', '03', '04', '05', '06', '07', '08', '09'],
    default: '01', // Factura electrónica
    description: 'Tipo de documento electrónico',
  },
  numeroConsecutivo: {
    type: 'string',
    required: false, // Se genera automáticamente
    pattern: /^[0-9]{20}$/,
    description: 'Número consecutivo de 20 dígitos',
  },
  fechaEmision: {
    type: 'string',
    required: false, // Se genera automáticamente
    pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-\d{2}:\d{2}$/,
    description: 'Fecha y hora de emisión en formato ISO 8601',
  },
  
  // Información de moneda
  codigoMoneda: {
    type: 'string',
    enum: ['CRC', 'USD', 'EUR'],
    default: 'CRC',
    description: 'Código de moneda ISO 4217',
  },
  tipoCambio: {
    type: 'number',
    required: false,
    min: 0.01,
    multipleOf: 0.01,
    default: 1,
    description: 'Tipo de cambio (solo si no es CRC)',
  },

  // Entidades
  emisor: {
    type: 'object',
    required: true,
    properties: EmisorModel,
    description: 'Información del emisor',
  },
  
  receptor: {
    type: 'object',
    required: true,
    properties: ReceptorModel,
    description: 'Información del receptor',
  },

  // Detalle de la factura
  detalleServicio: {
    type: 'array',
    required: true,
    minItems: 1,
    maxItems: 1000,
    items: {
      type: 'object',
      properties: ItemModel,
    },
    description: 'Detalle de productos y servicios',
  },

  // Resumen
  resumenFactura: {
    type: 'object',
    required: true,
    properties: TotalesModel,
    description: 'Resumen de totales de la factura',
  },

  // Información adicional
  condicionVenta: {
    type: 'string',
    enum: ['01', '02', '03', '04', '05', '99'], // Contado, Crédito, etc.
    default: '01', // Contado
    description: 'Condición de venta',
  },
  
  plazoCredito: {
    type: 'number',
    required: false,
    min: 0,
    description: 'Plazo de crédito en días (solo si condición es crédito)',
  },

  // Observaciones
  observaciones: {
    type: 'string',
    required: false,
    maxLength: 1000,
    description: 'Observaciones adicionales',
  },
};

/**
 * Esquemas de ejemplo para testing y documentación
 */
const EjemploFactura = {
  tipoDocumento: '01',
  codigoMoneda: 'CRC',
  tipoCambio: 1,
  
  emisor: {
    nombre: 'Empresa Ejemplo S.A.',
    identificacion: '312345678901',
    tipoIdentificacion: '02',
    correoElectronico: 'facturacion@empresa.com',
    telefono: '2222-3333',
    codigoPais: '506',
    provincia: 'San José',
    canton: 'Central',
    distrito: 'Carmen',
    direccion: 'Avenida Central, Calle 1, Edificio ABC',
  },

  receptor: {
    nombre: 'Juan Pérez Gómez',
    identificacion: '123456789',
    tipoIdentificacion: '01',
    correoElectronico: 'juan.perez@email.com',
    telefono: '8888-9999',
  },

  detalleServicio: [
    {
      numeroLinea: 1,
      codigo: 'PROD001',
      descripcion: 'Producto de ejemplo',
      cantidad: 2,
      unidadMedida: 'Unid',
      precioUnitario: 10000,
      montoTotal: 20000,
      descuento: 0,
      subtotal: 20000,
      impuesto: {
        codigo: '01',
        codigoTarifa: '08',
        tarifa: 13,
        monto: 2600,
      },
      montoTotalLinea: 22600,
    },
    {
      numeroLinea: 2,
      codigo: 'SERV001',
      descripcion: 'Servicio de consultoría',
      cantidad: 1,
      unidadMedida: 'Hrs',
      precioUnitario: 15000,
      montoTotal: 15000,
      descuento: 1500,
      naturalezaDescuento: 'Descuento por cliente frecuente',
      subtotal: 13500,
      impuesto: {
        codigo: '01',
        codigoTarifa: '08',
        tarifa: 13,
        monto: 1755,
      },
      montoTotalLinea: 15255,
    },
  ],

  resumenFactura: {
    montoTotalServiciosGravados: 13500,
    montoTotalServiciosExentos: 0,
    montoTotalMercanciaGravada: 20000,
    montoTotalMercanciaExenta: 0,
    totalGravado: 33500,
    totalExento: 0,
    totalVenta: 35000,
    totalDescuentos: 1500,
    totalVentaNeta: 33500,
    totalImpuesto: 4355,
    totalComprobante: 37855,
  },

  condicionVenta: '01',
  observaciones: 'Factura de ejemplo para testing del sistema',
};

module.exports = {
  EmisorModel,
  ReceptorModel,
  ItemModel,
  TotalesModel,
  FacturaModel,
  EjemploFactura,
};