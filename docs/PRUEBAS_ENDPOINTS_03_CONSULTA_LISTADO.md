# PRUEBAS ENDPOINTS - Documento 3: Consulta y Listado de Facturas

## Descripción
Este documento contiene pruebas para los endpoints de **consulta, listado, descarga y eliminación de facturas**.

---

## 1. GET /api/facturas
**Listar todas las facturas con filtros opcionales**

### 1.1 Prueba Exitosa - Listar Sin Filtros

**Request**:
```http
GET /api/facturas
```

**Response (200 OK)**:
```json
{
  "success": true,
  "total": 5,
  "limit": 50,
  "offset": 0,
  "facturas": [
    {
      "consecutivo": "00100010010000000001",
      "clave": "50602272020110310000100010010000000001",
      "savedAt": "2025-11-21T10:30:00.000Z",
      "status": "PENDING",
      "emisor": "Mi Empresa S.A.",
      "receptor": "Cliente General S.A.",
      "monto": 1130.00,
      "moneda": "CRC",
      "contentPreview": {
        "detalleServicio": [
          {
            "numeroLinea": 1,
            "detalle": "Servicio de consultoría técnica",
            "cantidad": 1,
            "precioUnitario": 1000.00
          }
        ]
      }
    },
    {
      "consecutivo": "00100010010000000002",
      "clave": "50602272020110310000100010010000000002",
      "savedAt": "2025-11-21T10:31:00.000Z",
      "status": "PENDING",
      "emisor": "Distribuidor XYZ",
      "receptor": "Tienda Minorista",
      "monto": 6215.00,
      "moneda": "CRC",
      "contentPreview": null
    },
    {
      "consecutivo": "00100010010000000003",
      "clave": "50602272020110310000100010010000000003",
      "savedAt": "2025-11-21T10:32:00.000Z",
      "status": "SENT",
      "emisor": "My Company Ltd.",
      "receptor": "International Client Corp.",
      "monto": 1695.00,
      "moneda": "CRC",
      "sentAt": "2025-11-21T10:40:00.000Z"
    }
  ],
  "pagination": {
    "hasMore": false,
    "nextOffset": null
  }
}
```

**Validaciones esperadas**:
- ✅ HTTP 200 OK
- ✅ Array de facturas no vacío
- ✅ Cada factura tiene campos clave (consecutivo, clave, status)
- ✅ Total coincide con cantidad de elementos
- ✅ Información de paginación

---

### 1.2 Prueba Exitosa - Listar con Filtro Status=PENDING

**Request**:
```http
GET /api/facturas?status=pending
```

**Response (200 OK)**:
```json
{
  "success": true,
  "total": 2,
  "limit": 50,
  "offset": 0,
  "filters": {
    "status": "pending"
  },
  "facturas": [
    {
      "consecutivo": "00100010010000000001",
      "clave": "50602272020110310000100010010000000001",
      "status": "PENDING",
      "savedAt": "2025-11-21T10:30:00.000Z"
    },
    {
      "consecutivo": "00100010010000000002",
      "clave": "50602272020110310000100010010000000002",
      "status": "PENDING",
      "savedAt": "2025-11-21T10:31:00.000Z"
    }
  ]
}
```

**Validaciones esperadas**:
- ✅ Total = 2 (solo pending)
- ✅ Todos los items tienen `status: "PENDING"`
- ✅ Filtro aplicado correctamente

---

### 1.3 Prueba Exitosa - Listar con Filtro Status=SENT

**Request**:
```http
GET /api/facturas?status=sent
```

**Response (200 OK)**:
```json
{
  "success": true,
  "total": 1,
  "filters": {
    "status": "sent"
  },
  "facturas": [
    {
      "consecutivo": "00100010010000000003",
      "clave": "50602272020110310000100010010000000003",
      "status": "SENT",
      "savedAt": "2025-11-21T10:32:00.000Z",
      "sentAt": "2025-11-21T10:40:00.000Z"
    }
  ]
}
```

---

### 1.4 Prueba Exitosa - Listar con Paginación

**Request**:
```http
GET /api/facturas?limit=2&offset=0
```

**Response (200 OK)**:
```json
{
  "success": true,
  "total": 5,
  "limit": 2,
  "offset": 0,
  "facturas": [
    { "consecutivo": "00100010010000000001", "clave": "..." },
    { "consecutivo": "00100010010000000002", "clave": "..." }
  ],
  "pagination": {
    "hasMore": true,
    "nextOffset": 2
  }
}
```

**Segunda Página**:
```http
GET /api/facturas?limit=2&offset=2
```

**Response (200 OK)**:
```json
{
  "success": true,
  "total": 5,
  "limit": 2,
  "offset": 2,
  "facturas": [
    { "consecutivo": "00100010010000000003", "clave": "..." },
    { "consecutivo": "00100010010000000004", "clave": "..." }
  ],
  "pagination": {
    "hasMore": true,
    "nextOffset": 4
  }
}
```

**Validaciones esperadas**:
- ✅ Límite respetado (máximo 2 items)
- ✅ Offset aplicado correctamente
- ✅ Flag `hasMore` indica si hay más datos
- ✅ `nextOffset` sugiere siguiente página

---

### 1.5 Prueba Exitosa - Listar con Content Completo

**Request**:
```http
GET /api/facturas?includeContent=true
```

**Response (200 OK)**:
```json
{
  "success": true,
  "total": 3,
  "facturas": [
    {
      "consecutivo": "00100010010000000001",
      "clave": "50602272020110310000100010010000000001",
      "status": "PENDING",
      "savedAt": "2025-11-21T10:30:00.000Z",
      "content": {
        "emisor": {
          "nombre": "Mi Empresa S.A.",
          "identificacion": "3101234567",
          "correoElectronico": "facturacion@miempresa.cr"
        },
        "receptor": {
          "nombre": "Cliente General S.A.",
          "identificacion": "123456789"
        },
        "detalleServicio": [
          {
            "numeroLinea": 1,
            "cantidad": 1.0,
            "detalle": "Servicio de consultoría técnica",
            "precioUnitario": 1000.00,
            "montoTotalLinea": 1000.00
          }
        ],
        "resumenFactura": {
          "totalVenta": 1000.00,
          "totalImpuesto": 130.00,
          "totalComprobante": 1130.00
        }
      }
    }
  ]
}
```

**Validaciones esperadas**:
- ✅ Campo `content` incluido completo
- ✅ Toda la información de la factura presente
- ✅ Respuesta más pesada pero con más información

---

### 1.6 Prueba Exitosa - Listar Vacío

**Request**:
```http
GET /api/facturas?status=rejected
```

**Response (200 OK)**:
```json
{
  "success": true,
  "total": 0,
  "facturas": [],
  "message": "No se encontraron facturas con los criterios especificados"
}
```

**Validaciones esperadas**:
- ✅ HTTP 200 OK (incluso sin resultados)
- ✅ Array vacío
- ✅ Total = 0
- ✅ Mensaje informativo

---

### 1.7 Prueba Fallida - Parámetro Status Inválido

**Request**:
```http
GET /api/facturas?status=invalido
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Parámetro status inválido",
  "details": {
    "provided": "invalido",
    "allowed": ["all", "pending", "sent", "rejected"]
  }
}
```

---

### 1.8 Prueba Fallida - Límite Excedido

**Request**:
```http
GET /api/facturas?limit=200
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Límite de resultados excedido",
  "details": {
    "provided": 200,
    "maxAllowed": 100
  }
}
```

---

## 2. GET /api/facturas/:consecutivo
**Obtener factura específica por consecutivo**

### 2.1 Prueba Exitosa - Obtener Factura Completa

**Request**:
```http
GET /api/facturas/00100010010000000001
```

**Response (200 OK)**:
```json
{
  "success": true,
  "factura": {
    "consecutivo": "00100010010000000001",
    "clave": "50602272020110310000100010010000000001",
    "estado": "EMISSION_SUCCESS",
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
      "totalVenta": 1000.00,
      "totalDescuentos": 0.00,
      "totalVentaNeta": 1000.00,
      "totalImpuesto": 130.00,
      "totalComprobante": 1130.00,
      "codigoMoneda": "CRC"
    },
    "condicionVenta": "Contado",
    "mediosPago": ["01"],
    "metadata": {
      "savedAt": "2025-11-21T10:30:00.000Z",
      "sentAt": null,
      "status": "PENDING",
      "mode": "SIMULATED",
      "filename": "FACTURA_00100010010000000001_20251121-103000.json"
    },
    "files": {
      "json": "./invoices/FACTURA_00100010010000000001_20251121-103000.json",
      "xml": null
    }
  }
}
```

**Validaciones esperadas**:
- ✅ HTTP 200 OK
- ✅ Factura completa con todos los campos
- ✅ Metadata incluida (savedAt, status, etc.)
- ✅ Información de archivos

---

### 2.2 Prueba Exitosa - Obtener Solo Metadata

**Request**:
```http
GET /api/facturas/00100010010000000001?includeContent=false
```

**Response (200 OK)**:
```json
{
  "success": true,
  "factura": {
    "consecutivo": "00100010010000000001",
    "clave": "50602272020110310000100010010000000001",
    "emisor": "Mi Empresa S.A.",
    "receptor": "Cliente General S.A.",
    "monto": 1130.00,
    "moneda": "CRC",
    "status": "PENDING",
    "savedAt": "2025-11-21T10:30:00.000Z",
    "sentAt": null
  }
}
```

**Validaciones esperadas**:
- ✅ Respuesta más ligera
- ✅ Solo información resumen
- ✅ Sin detalles de líneas

---

### 2.3 Prueba Fallida - Consecutivo No Existe

**Request**:
```http
GET /api/facturas/00100010010099999999
```

**Response (404 Not Found)**:
```json
{
  "success": false,
  "error": "Factura no encontrada",
  "consecutivo": "00100010010099999999",
  "message": "No existe factura con ese consecutivo en el sistema"
}
```

**Validaciones esperadas**:
- ✅ HTTP 404 Not Found
- ✅ Mensaje claro

---

### 2.4 Prueba Fallida - Formato Consecutivo Inválido

**Request**:
```http
GET /api/facturas/ABC123
```

**Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Formato de consecutivo inválido",
  "details": {
    "provided": "ABC123",
    "expected": "20 dígitos numéricos"
  }
}
```

---

## 3. GET /api/facturas/:consecutivo/xml
**Descargar factura en formato XML**

### 3.1 Prueba Exitosa - Descargar XML

**Request**:
```http
GET /api/facturas/00100010010000000001/xml
Accept: application/xml
```

**Response (200 OK)**:
```
Content-Type: application/xml
Content-Disposition: attachment; filename="FACTURA_00100010010000000001.xml"

<?xml version="1.0" encoding="UTF-8"?>
<Factura>
  <Identificacion>
    <Numero>3101234567</Numero>
    <Tipo>02</Tipo>
  </Identificacion>
  <ResumenFactura>
    <CodigoMoneda>CRC</CodigoMoneda>
    <TotalComprobante>1130.00</TotalComprobante>
  </ResumenFactura>
</Factura>
```

**Validaciones esperadas**:
- ✅ HTTP 200 OK
- ✅ Content-Type correcto: application/xml
- ✅ XML válido
- ✅ Header Content-Disposition para descarga

---

### 3.2 Prueba Fallida - XML No Disponible

**Request**:
```http
GET /api/facturas/00100010010000000001/xml
```

**Response (404 Not Found)**:
```json
{
  "success": false,
  "error": "Archivo XML no disponible",
  "consecutivo": "00100010010000000001",
  "message": "La factura fue emitida pero el XML no fue generado"
}
```

---

## 4. GET /api/english-invoices
**Listar facturas en formato English**

### 4.1 Prueba Exitosa - Listar English Invoices

**Request**:
```http
GET /api/english-invoices
```

**Response (200 OK)**:
```json
{
  "success": true,
  "total": 2,
  "invoices": [
    {
      "consecutive": "00100010010000000003",
      "key": "50602272020110310000100010010000000003",
      "status": "SENT",
      "issuer": "My Company Ltd.",
      "receiver": "International Client Corp.",
      "amount": 1695.00,
      "currency": "CRC",
      "savedAt": "2025-11-21T10:32:00.000Z",
      "sentAt": "2025-11-21T10:40:00.000Z"
    }
  ],
  "pagination": {
    "hasMore": false
  }
}
```

**Validaciones esperadas**:
- ✅ Campos en English
- ✅ Misma estructura lógica que ES
- ✅ Metadata completa

---

### 4.2 Prueba Exitosa - Obtener Invoice Específico

**Request**:
```http
GET /api/english-invoices/00100010010000000003
```

**Response (200 OK)**:
```json
{
  "success": true,
  "invoice": {
    "consecutive": "00100010010000000003",
    "key": "50602272020110310000100010010000000003",
    "issuer": {
      "name": "My Company Ltd.",
      "identification": "3101234567",
      "email": "billing@mycompany.com"
    },
    "receiver": {
      "name": "International Client Corp.",
      "identification": "123456789"
    },
    "lineItems": [
      {
        "lineNumber": 1,
        "quantity": 1.0,
        "description": "Professional consulting services",
        "unitPrice": 1500.00,
        "lineAmount": 1500.00
      }
    ],
    "summary": {
      "totalSales": 1500.00,
      "totalTax": 195.00,
      "totalAmount": 1695.00,
      "currency": "CRC"
    },
    "metadata": {
      "language": "english",
      "processedAs": "spanish_compatible",
      "status": "SENT"
    }
  }
}
```

---

## 5. DELETE /api/facturas/:consecutivo
**Eliminar factura (solo en desarrollo)**

### 5.1 Prueba Exitosa - Eliminar Factura

**Request** (NODE_ENV=development):
```http
DELETE /api/facturas/00100010010000000004
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Factura eliminada exitosamente",
  "consecutivo": "00100010010000000004",
  "deletedAt": "2025-11-21T10:50:00.000Z"
}
```

**Validaciones esperadas**:
- ✅ HTTP 200 OK
- ✅ Mensaje confirmación
- ✅ Timestamp de eliminación

---

### 5.2 Prueba Fallida - Eliminar en Producción

**Request** (NODE_ENV=production):
```http
DELETE /api/facturas/00100010010000000004
```

**Response (403 Forbidden)**:
```json
{
  "success": false,
  "error": "Operación no permitida",
  "message": "La eliminación de facturas solo está permitida en modo desarrollo"
}
```

**Validaciones esperadas**:
- ✅ HTTP 403 Forbidden
- ✅ Protección de datos en producción

---

### 5.3 Prueba Fallida - Factura No Existe

**Request**:
```http
DELETE /api/facturas/00100010010099999999
```

**Response (404 Not Found)**:
```json
{
  "success": false,
  "error": "Factura no encontrada",
  "consecutivo": "00100010010099999999"
}
```

---

## Resumen de Pruebas - Documento 3

| Prueba | Endpoint | Método | Esperado | Estado |
|--------|----------|--------|----------|--------|
| 1.1 | /api/facturas | GET | 200 OK | ✅ |
| 1.2 | /api/facturas?status=pending | GET | 200 OK | ✅ |
| 1.3 | /api/facturas?status=sent | GET | 200 OK | ✅ |
| 1.4 | /api/facturas?limit=2&offset=0 | GET | 200 OK | ✅ |
| 1.5 | /api/facturas?includeContent=true | GET | 200 OK | ✅ |
| 1.6 | /api/facturas?status=rejected | GET | 200 OK (vacío) | ✅ |
| 1.7 | /api/facturas?status=invalid | GET | 400 Bad Request | ✅ |
| 1.8 | /api/facturas?limit=200 | GET | 400 Bad Request | ✅ |
| 2.1 | /api/facturas/:consecutivo | GET | 200 OK | ✅ |
| 2.2 | /api/facturas/:consecutivo?includeContent=false | GET | 200 OK | ✅ |
| 2.3 | /api/facturas/:consecutivo (no existe) | GET | 404 Not Found | ✅ |
| 2.4 | /api/facturas/:consecutivo (formato inválido) | GET | 400 Bad Request | ✅ |
| 3.1 | /api/facturas/:consecutivo/xml | GET | 200 OK (XML) | ✅ |
| 3.2 | /api/facturas/:consecutivo/xml (no existe) | GET | 404 Not Found | ✅ |
| 4.1 | /api/english-invoices | GET | 200 OK | ✅ |
| 4.2 | /api/english-invoices/:consecutive | GET | 200 OK | ✅ |
| 5.1 | /api/facturas/:consecutivo | DELETE (dev) | 200 OK | ✅ |
| 5.2 | /api/facturas/:consecutivo | DELETE (prod) | 403 Forbidden | ✅ |
| 5.3 | /api/facturas/:consecutivo | DELETE (no existe) | 404 Not Found | ✅ |

---

**Próximo documento**: Estado del Sistema y Manejo de Errores
