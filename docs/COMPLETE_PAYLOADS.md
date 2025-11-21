# COMPLETE_PAYLOADS.md — Payloads fiscales completos (ES) y equivalentes (EN)

Este documento contiene payloads detallados para facturas en el formato que el proyecto espera (y ejemplos equivalentes en inglés). Úsalos como plantilla para pruebas y para integraciones con Hacienda.

---

## 1) Ejemplo: Factura simple (sin impuestos especiales)

Request (ES):
```json
{
  "emisor": {
    "nombre": "ACME S.A.",
    "identificacion": {
      "tipo": "02",
      "numero": "3101123456"
    },
    "correoElectronico": "contacto@acme.cr",
    "telefono": "2222-2222",
    "ubicacion": {
      "provincia": "01",
      "canton": "01",
      "distrito": "01",
      "otrasSenas": "Edificio 1, Oficina 2"
    }
  },
  "receptor": {
    "nombre": "Cliente S.A.",
    "identificacion": {
      "tipo": "01",
      "numero": "123456789"
    },
    "correoElectronico": "cliente@example.com"
  },
  "detalleServicio": [
    {
      "numeroLinea": 1,
      "cantidad": 1.0,
      "unidadMedida": "UNI",
      "detalle": "Consultoría técnica",
      "precioUnitario": 1000.00,
      "montoTotalLinea": 1000.00,
      "impuestos": []
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
    "totalImpuesto": 0.00,
    "totalComprobante": 1000.00,
    "codigoMoneda": "CRC"
  },
  "condicionVenta": "Contado",
  "mediosPago": ["01"]
}
```

Equivalent (EN):
```json
{
  "issuer": { "name": "ACME S.A.", "identification": { "type": "02", "number": "3101123456" }, "email":"contacto@acme.cr" },
  "receiver": { "name": "Client S.A.", "identification": { "type": "01", "number": "123456789" }, "email":"cliente@example.com" },
  "items": [ { "lineNumber": 1, "quantity": 1.0, "unit": "UNI", "description": "Technical consulting", "unitPrice": 1000.00, "lineAmount": 1000.00, "taxes": [] } ],
  "summary": { "total": 1000.00, "tax": 0.00, "currency": "CRC" },
  "paymentCondition": "Cash", "paymentMethods": ["01"]
}
```

---

## 2) Factura con impuestos (IVA 13%)
Request (ES):
```json
{
  "emisor": { "nombre": "Ventas SA", "identificacion": { "tipo": "02", "numero": "3101123456" } },
  "receptor": { "nombre": "Cliente", "identificacion": { "tipo": "01", "numero": "123456789" } },
  "detalleServicio": [
    {
      "numeroLinea": 1,
      "cantidad": 2,
      "unidadMedida": "UND",
      "detalle": "Producto A",
      "precioUnitario": 500.00,
      "montoTotalLinea": 1000.00,
      "impuestos": [
        { "codigo": "01", "tarifa": 13.00, "monto": 130.00 }
      ]
    }
  ],
  "resumenFactura": {
    "totalVenta": 1000.00,
    "totalImpuesto": 130.00,
    "totalComprobante": 1130.00,
    "codigoMoneda": "CRC"
  }
}
```

Notas:
- Cada línea puede contener su propio arreglo `impuestos` con `codigo`, `tarifa` y `monto`.
- `codigo` para IVA en muchos esquemas puede ser `01` o el que Hacienda defina.

---

## 3) Factura con descuentos y ventas exentas
Request (ES):
```json
{
  "emisor": { "nombre": "Servicios Exentos S.A.", "identificacion": { "tipo": "02", "numero": "3101123456" } },
  "receptor": { "nombre": "Cliente Exento", "identificacion": { "tipo": "01", "numero": "123456789" } },
  "detalleServicio": [
    {
      "numeroLinea": 1,
      "cantidad": 1,
      "unidadMedida": "UNI",
      "detalle": "Servicio exento",
      "precioUnitario": 200.00,
      "montoTotalLinea": 200.00,
      "impuestos": [ { "codigo": "02", "tarifa": 0.00, "monto": 0.00 } ]
    },
    {
      "numeroLinea": 2,
      "cantidad": 1,
      "unidadMedida": "UNI",
      "detalle": "Servicio gravado",
      "precioUnitario": 800.00,
      "montoTotalLinea": 800.00,
      "impuestos": [ { "codigo": "01", "tarifa": 13.00, "monto": 104.00 } ]
    }
  ],
  "resumenFactura": {
    "totalServExentos": 200.00,
    "totalGravado": 800.00,
    "totalImpuesto": 104.00,
    "totalComprobante": 1104.00,
    "codigoMoneda": "CRC"
  }
}
```

---

## 4) Factura con múltiples impuestos por línea (ej.: impuesto municipal + IVA)
Request (ES) — línea con dos impuestos:
```json
{
  "detalleServicio": [
    {
      "numeroLinea": 1,
      "cantidad": 1,
      "detalle": "Servicio complejo",
      "precioUnitario": 1000.00,
      "montoTotalLinea": 1000.00,
      "impuestos": [
        { "codigo": "01", "tarifa": 13.00, "monto": 130.00 },
        { "codigo": "99", "tarifa": 1.50, "monto": 15.00 }
      ]
    }
  ],
  "resumenFactura": { "totalImpuesto": 145.00, "totalComprobante": 1145.00 }
}
```

---

## 5) Campos adicionales útiles (lista)
- `condicionVenta` — "Contado" | "Credito" etc.
- `plazoCredito` — días cuando `condicionVenta` es crédito
- `numeroConsecutivo` — opcional, por lo general generado por el sistema
- `observaciones` — texto libre
- `moneda` / `codigoMoneda` — CRC, USD, etc.
- `tipoCambio` — si la moneda no es CRC
- `mediosPago` — array de códigos (01 = efectivo, 15 = transferencia, según catálogo interno)
- `referencias` — facturas relacionadas

---

## 6) Ejemplo completo realista (ES)
```json
{
  "emisor": {
    "nombre": "ACME Global S.A.",
    "identificacion": { "tipo": "02", "numero": "3101123456" },
    "correoElectronico": "facturacion@acme.cr",
    "telefono": "2222-1111",
    "ubicacion": { "provincia":"01","canton":"01","distrito":"01","otrasSenas":"Oficina 301" }
  },
  "receptor": {
    "nombre": "Comercial Cliente S.A.",
    "identificacion": { "tipo":"02","numero":"3102233445" },
    "correoElectronico":"cliente@comercial.cr"
  },
  "detalleServicio": [
    { "numeroLinea":1, "cantidad":10, "unidadMedida":"UND","detalle":"Producto A","precioUnitario":150.00, "montoTotalLinea":1500.00, "descuentoMonto":0.00, "impuestos":[{"codigo":"01","tarifa":13.00,"monto":195.00}] },
    { "numeroLinea":2, "cantidad":1, "unidadMedida":"HRS","detalle":"Servicio B","precioUnitario":500.00, "montoTotalLinea":500.00, "descuentoMonto":50.00, "impuestos":[{"codigo":"01","tarifa":13.00,"monto":58.50}] }
  ],
  "resumenFactura": {
    "subtotal": 2000.00,
    "totalDescuentos": 50.00,
    "totalVentaNeta": 1950.00,
    "totalImpuesto": 253.50,
    "totalComprobante": 2203.50,
    "codigoMoneda":"CRC",
    "tipoCambio":1
  },
  "condicionVenta":"Credito",
  "plazoCredito":30,
  "mediosPago":["15"]
}
```

---

## 7) Mappeo ideal ES → EN (ejemplo de campos)
- `emisor` → `issuer`
- `receptor` → `receiver`
- `detalleServicio` → `items`
- `resumenFactura` → `summary`
- `numeroLinea` → `lineNumber`
- `precioUnitario` → `unitPrice`
- `montoTotalLinea` → `lineAmount`
- `codigoMoneda` → `currency`

Ejemplo breve de conversión programática (pseudocódigo):
```javascript
function convertToEnglish(spanishInvoice) {
  return {
    issuer: spanishInvoice.emisor,
    receiver: spanishInvoice.receptor,
    items: spanishInvoice.detalleServicio.map(l => ({
      lineNumber: l.numeroLinea,
      description: l.detalle,
      quantity: l.cantidad,
      unit: l.unidadMedida,
      unitPrice: l.precioUnitario,
      lineAmount: l.montoTotalLinea,
      taxes: l.impuestos
    })),
    summary: spanishInvoice.resumenFactura
  };
}
```

---

## 8) Recomendaciones
- Siempre validar la estructura con `/api/facturas/validar` antes de intentar emitir/enviar.
- Para pruebas, utiliza `SIMULATE_IF_NO_KEYS=true` y `ATV` en modo `SIMULATED`.
- Agrega pruebas unitarias que cubran cálculos (subtotales, impuestos, descuentos) para evitar errores fiscales.

---

Fin de `COMPLETE_PAYLOADS.md`.
