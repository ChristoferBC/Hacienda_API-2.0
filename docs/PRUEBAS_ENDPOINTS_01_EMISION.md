# PRUEBAS ENDPOINTS - Documento 1: Emisión de Facturas

## Descripción
Este documento contiene pruebas completas para los endpoints de **emisión de facturas** en ambos idiomas (Español e Inglés).

---

## 1. POST /api/facturas/emitir
**Emitir una nueva factura electrónica (Español)**

### 1.1 Prueba Exitosa - Factura Simple

**Request**:
```http
POST /api/facturas/emitir
Content-Type: application/json

{
  "emisor": {
    "nombre": "Mi Empresa S.A.",
    "identificacion": "3101234567",
    "tipoIdentificacion": "02",
    "correoElectronico": "facturacion@miempresa.cr",
    "telefono": "2222-1111",
    "provincia": "01",
    "canton": "01",
    "distrito": "01"
  },
  "receptor": {
    "nombre": "Cliente General S.A.",
    "identificacion": "123456789",
    "tipoIdentificacion": "01",
    "correoElectronico": "cliente@empresa.cr"
  },
  "detalleServicio": [
    {
      "numeroLinea": 1,
      "cantidad": 1.0,
      "unidadMedida": "UNI",
      "detalle": "Servicio de consultoría técnica",
      "precioUnitario": 1000.00,
      "montoTotalLinea": 1000.00,
      "impuestos": [
        {
          "codigo": "01",
          "tarifa": 13.00,
          "monto": 130.00
        }
      ]
    }
  ],
  "resumenFactura": {
    "totalServGravados": 0.00,
    "totalServExentos": 0.00,
    "totalMercanciasGravadas": 0.00,
    "totalMercanciasExentas": 0.00,
    "totalGravado": 0.00,
    "totalExento": 0.00,
    "totalVenta": 1000.00,
    "totalDescuentos": 0.00,
    "totalVentaNeta": 1000.00,
    "totalImpuesto": 130.00,
    "totalComprobante": 1130.00,
    "codigoMoneda": "CRC"
  },
  "condicionVenta": "Contado",
  "mediosPago": ["01"]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "consecutivo": "00100010010000000001",
  "clave": "50602272020110310000100010010000000001",
  "estado": "EMISSION_SUCCESS",
  "mode": "SIMULATED",
  "timestamp": "2025-11-21T10:30:00.000Z",
  "archivos": {
    "json": "./invoices/FACTURA_00100010010000000001_20251121-103000.json",
    "xml": null
  },
  "metadata": {
    "emission_date": "2025-11-21T10:30:00.000Z"
  }
}
```

**Validaciones esperadas**:
- ✅ HTTP 201 Created
- ✅ Campo `success` es true
- ✅ Campo `consecutivo` es string de 20 dígitos
- ✅ Campo `clave` tiene formato Hacienda válido
- ✅ Archivo guardado en `./invoices/`

---

### 1.2 Prueba Exitosa - Factura con Descuentos

**Request**:
```http
POST /api/facturas/emitir
Content-Type: application/json

{
  "emisor": {
    "nombre": "Distribuidor XYZ",
    "identificacion": "3102334455",
    "tipoIdentificacion": "02",
    "correoElectronico": "ventas@distribuidora.cr"
  },
  "receptor": {
    "nombre": "Tienda Minorista",
    "identificacion": "987654321",
    "tipoIdentificacion": "01"
  },
  "detalleServicio": [
    {
      "numeroLinea": 1,
      "cantidad": 10.0,
      "unidadMedida": "UND",
      "detalle": "Producto A - Cantidad 10 unidades",
      "precioUnitario": 500.00,
      "montoTotalLinea": 5000.00,
      "descuentoMonto": 500.00,
      "impuestos": [
        {
          "codigo": "01",
          "tarifa": 13.00,
          "monto": 585.00
        }
      ]
    },
    {
      "numeroLinea": 2,
      "cantidad": 5.0,
      "unidadMedida": "UND",
      "detalle": "Producto B - Cantidad 5 unidades",
      "precioUnitario": 200.00,
      "montoTotalLinea": 1000.00,
      "impuestos": [
        {
          "codigo": "01",
          "tarifa": 13.00,
          "monto": 130.00
        }
      ]
    }
  ],
  "resumenFactura": {
    "totalVenta": 6000.00,
    "totalDescuentos": 500.00,
    "totalVentaNeta": 5500.00,
    "totalImpuesto": 715.00,
    "totalComprobante": 6215.00,
    "codigoMoneda": "CRC"
  },
  "condicionVenta": "Credito",
  "plazoCredito": 30,
  "mediosPago": ["15"]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "consecutivo": "00100010010000000002",
  "clave": "50602272020110310000100010010000000002",
  "estado": "EMISSION_SUCCESS",
  "mode": "SIMULATED",
  "timestamp": "2025-11-21T10:31:00.000Z",
  "archivos": {
    "json": "./invoices/FACTURA_00100010010000000002_20251121-103100.json",
    "xml": null
  },
  "metadata": {}
}
```

**Validaciones esperadas**:
- ✅ Manejo correcto de descuentos
- ✅ Cálculo de impuestos sobre montoTotalLinea - descuentoMonto
- ✅ Consecutivo incrementado

---

### 1.3 Prueba Fallida - Datos Inválidos (Emisor falta)

**Request**:
```http
POST /api/facturas/emitir
Content-Type: application/json

{
  "receptor": {
    "nombre": "Cliente",
    "identificacion": "123456789"
  },
  "detalleServicio": [],
  "resumenFactura": {
    "totalVenta": 0,
    "totalComprobante": 0,
    "codigoMoneda": "CRC"
  }
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Datos de factura inválidos",
  "details": [
    {
      "field": "emisor",
      "message": "El emisor es requerido"
    }
  ]
}
```

**Validaciones esperadas**:
- ✅ HTTP 400 Bad Request
- ✅ `success` es false
- ✅ Array de errores detallados

---

### 1.4 Prueba Fallida - Identificación Inválida

**Request**:
```http
POST /api/facturas/emitir
Content-Type: application/json

{
  "emisor": {
    "nombre": "Mi Empresa",
    "identificacion": "123",  // Menos de 9 dígitos
    "tipoIdentificacion": "02"
  },
  "receptor": {
    "nombre": "Cliente",
    "identificacion": "123456789"
  },
  "detalleServicio": [],
  "resumenFactura": {
    "totalVenta": 0,
    "totalComprobante": 0
  }
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Datos de factura inválidos",
  "details": [
    {
      "field": "emisor.identificacion",
      "message": "La identificación debe contener entre 9 y 12 dígitos"
    }
  ]
}
```

---

### 1.5 Prueba Fallida - Correo Electrónico Inválido

**Request**:
```http
POST /api/facturas/emitir
Content-Type: application/json

{
  "emisor": {
    "nombre": "Mi Empresa",
    "identificacion": "3101234567",
    "tipoIdentificacion": "02",
    "correoElectronico": "correo_invalido"  // No es email válido
  },
  "receptor": {
    "nombre": "Cliente",
    "identificacion": "123456789"
  },
  "detalleServicio": [],
  "resumenFactura": {
    "totalVenta": 0,
    "totalComprobante": 0
  }
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Datos de factura inválidos",
  "details": [
    {
      "field": "emisor.correoElectronico",
      "message": "El correo electrónico debe tener un formato válido"
    }
  ]
}
```

---

### 1.6 Prueba Fallida - Detalles Vacíos

**Request**:
```http
POST /api/facturas/emitir
Content-Type: application/json

{
  "emisor": {
    "nombre": "Mi Empresa",
    "identificacion": "3101234567"
  },
  "receptor": {
    "nombre": "Cliente",
    "identificacion": "123456789"
  },
  "detalleServicio": [],  // Array vacío
  "resumenFactura": {
    "totalVenta": 0,
    "totalComprobante": 0
  }
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Datos de factura inválidos",
  "details": [
    {
      "field": "detalleServicio",
      "message": "Debe haber al menos una línea de detalle"
    }
  ]
}
```

---

### 1.7 Prueba Fallida - Totales Inconsistentes

**Request**:
```http
POST /api/facturas/emitir
Content-Type: application/json

{
  "emisor": {
    "nombre": "Mi Empresa",
    "identificacion": "3101234567"
  },
  "receptor": {
    "nombre": "Cliente",
    "identificacion": "123456789"
  },
  "detalleServicio": [
    {
      "numeroLinea": 1,
      "cantidad": 2,
      "detalle": "Producto",
      "precioUnitario": 100.00,
      "montoTotalLinea": 250.00,  // Debe ser 200 (2 × 100)
      "impuestos": []
    }
  ],
  "resumenFactura": {
    "totalVenta": 200.00,
    "totalImpuesto": 0,
    "totalComprobante": 200.00,
    "codigoMoneda": "CRC"
  }
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Datos de factura inválidos",
  "details": [
    {
      "field": "detalleServicio[0].montoTotalLinea",
      "message": "El monto total de la línea no coincide con cantidad × precioUnitario"
    }
  ]
}
```

---

## 2. POST /api/english-invoices/emit
**Emitir una nueva factura electrónica (English)**

### 2.1 Prueba Exitosa - Invoice Básico

**Request**:
```http
POST /api/english-invoices/emit
Content-Type: application/json

{
  "issuer": {
    "name": "My Company Ltd.",
    "identification": "3101234567",
    "identificationType": "02",
    "email": "billing@mycompany.com",
    "phone": "2222-1111",
    "province": "01",
    "canton": "01",
    "district": "01"
  },
  "receiver": {
    "name": "International Client Corp.",
    "identification": "123456789",
    "identificationType": "01",
    "email": "client@intlcorp.com"
  },
  "lineItems": [
    {
      "lineNumber": 1,
      "quantity": 1.0,
      "unit": "UNI",
      "description": "Professional consulting services",
      "unitPrice": 1500.00,
      "lineAmount": 1500.00,
      "taxes": [
        {
          "code": "01",
          "rate": 13.00,
          "amount": 195.00
        }
      ]
    }
  ],
  "summary": {
    "totalSales": 1500.00,
    "totalDiscounts": 0.00,
    "netTotal": 1500.00,
    "totalTax": 195.00,
    "totalAmount": 1695.00,
    "currency": "CRC"
  },
  "saleCondition": "Cash",
  "paymentMethods": ["01"]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "consecutive": "00100010010000000003",
  "key": "50602272020110310000100010010000000003",
  "status": "EMISSION_SUCCESS",
  "mode": "SIMULATED",
  "timestamp": "2025-11-21T10:32:00.000Z",
  "files": {
    "json": "./invoices/FACTURA_00100010010000000003_20251121-103200.json",
    "xml": null
  },
  "metadata": {
    "language": "english",
    "originalRequest": "english",
    "processedAs": "spanish_compatible"
  }
}
```

**Validaciones esperadas**:
- ✅ Respuesta en inglés procesada correctamente
- ✅ Consecutivo incrementado desde facturas ES
- ✅ Conversión interna a formato ES válida
- ✅ Archivo guardado correctamente

---

### 2.2 Prueba Fallida - Invalid Currency

**Request**:
```http
POST /api/english-invoices/emit
Content-Type: application/json

{
  "issuer": {
    "name": "My Company Ltd.",
    "identification": "3101234567"
  },
  "receiver": {
    "name": "Client",
    "identification": "123456789"
  },
  "lineItems": [
    {
      "lineNumber": 1,
      "quantity": 1,
      "description": "Service",
      "unitPrice": 100,
      "lineAmount": 100,
      "taxes": []
    }
  ],
  "summary": {
    "totalSales": 100,
    "totalAmount": 100,
    "currency": "XYZ"  // Moneda inválida
  }
}
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Invalid invoice data",
  "message": "The invoice data provided does not meet the required format",
  "details": [
    {
      "field": "summary.currency",
      "message": "Currency must be one of: CRC, USD, EUR"
    }
  ]
}
```

---

### 2.3 Prueba - Comparación ES vs EN

**Mismo contenido en ambos idiomas debe generar misma clave (validación)**

Factura ES:
```json
{
  "emisor": { "nombre": "Test", "identificacion": "3101111111" },
  "receptor": { "nombre": "Client", "identificacion": "111111111" },
  "detalleServicio": [
    { "numeroLinea": 1, "cantidad": 1, "detalle": "X", "precioUnitario": 100, "montoTotalLinea": 100, "impuestos": [] }
  ],
  "resumenFactura": { "totalVenta": 100, "totalImpuesto": 0, "totalComprobante": 100, "codigoMoneda": "CRC" }
}
```

Factura EN:
```json
{
  "issuer": { "name": "Test", "identification": "3101111111" },
  "receiver": { "name": "Client", "identification": "111111111" },
  "lineItems": [
    { "lineNumber": 1, "quantity": 1, "description": "X", "unitPrice": 100, "lineAmount": 100, "taxes": [] }
  ],
  "summary": { "totalSales": 100, "totalTax": 0, "totalAmount": 100, "currency": "CRC" }
}
```

**Resultado esperado**:
- ✅ Ambas generan misma clave (después de conversión)
- ✅ Consecutivos incrementados en serie
- ✅ Ambos archivos guardados correctamente

---

## Resumen de Pruebas - Documento 1

| Prueba | Endpoint | Método | Esperado | Estado |
|--------|----------|--------|----------|--------|
| 1.1 | /api/facturas/emitir | POST | 201 Created | ✅ |
| 1.2 | /api/facturas/emitir | POST | 201 Created (descuentos) | ✅ |
| 1.3 | /api/facturas/emitir | POST | 400 Bad Request | ✅ |
| 1.4 | /api/facturas/emitir | POST | 400 Bad Request | ✅ |
| 1.5 | /api/facturas/emitir | POST | 400 Bad Request | ✅ |
| 1.6 | /api/facturas/emitir | POST | 400 Bad Request | ✅ |
| 1.7 | /api/facturas/emitir | POST | 400 Bad Request | ✅ |
| 2.1 | /api/english-invoices/emit | POST | 201 Created | ✅ |
| 2.2 | /api/english-invoices/emit | POST | 400 Bad Request | ✅ |
| 2.3 | Comparativa ES vs EN | - | Equivalencia | ✅ |

---

**Próximo documento**: Validación y Envío de Facturas
