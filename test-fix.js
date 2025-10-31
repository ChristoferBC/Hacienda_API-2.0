// Script de prueba rápida para verificar que el problema está resuelto
console.log('🧪 Probando emisión de factura con consecutivo corregido...\n');

const http = require('http');

const facturaEjemplo = {
  "tipoDocumento": "01",
  "codigoMoneda": "CRC",
  "emisor": {
    "nombre": "EMPRESA PRUEBA CONSECUTIVO SA",
    "identificacion": "312345678901",
    "tipoIdentificacion": "02"
  },
  "receptor": {
    "nombre": "CLIENTE PRUEBA",
    "identificacion": "398765432101", 
    "tipoIdentificacion": "02"
  },
  "detalleServicio": [
    {
      "numeroLinea": 1,
      "descripcion": "Producto de prueba",
      "cantidad": 1.0,
      "precioUnitario": 1000.0,
      "montoTotal": 1000.0,
      "subtotal": 1000.0,
      "impuesto": {
        "codigo": "01",
        "codigoTarifa": "08",
        "tarifa": 13.0,
        "monto": 130.0
      },
      "montoTotalLinea": 1130.0
    }
  ],
  "resumenFactura": {
    "totalGravado": 1000.0,
    "totalVenta": 1000.0,
    "totalVentaNeta": 1000.0,
    "totalImpuesto": 130.0,
    "totalComprobante": 1130.0
  }
};

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function probarEmision() {
  try {
    console.log('📡 Enviando factura de prueba...');
    const response = await makeRequest('POST', '/api/facturas/emitir', facturaEjemplo);
    
    if (response.status !== 201) {
      console.error(`❌ Error HTTP ${response.status}:`, response.data);
      return;
    }
    
    const consecutivo = response.data.consecutivo;
    
    console.log(`✅ Factura emitida exitosamente!`);
    console.log(`📋 Consecutivo: ${consecutivo}`);
    console.log(`📏 Longitud: ${consecutivo.length} caracteres`);
    console.log(`✅ Formato correcto: ${consecutivo.length === 20 ? 'SÍ' : 'NO'}`);
    
    if (consecutivo.length === 20) {
      console.log('\n🎉 ¡PROBLEMA RESUELTO! El consecutivo tiene exactamente 20 dígitos.');
      
      // Probar consulta
      console.log('\n🔍 Probando consulta de la factura...');
      const consultaResponse = await makeRequest('GET', `/api/facturas/${consecutivo}`);
      
      if (consultaResponse.status === 200 && consultaResponse.data.encontrada) {
        console.log('✅ Consulta exitosa: La factura se puede consultar correctamente');
        console.log(`📁 Archivos creados: JSON y XML`);
        console.log('\n🎊 ¡TODO FUNCIONA PERFECTAMENTE!');
      } else {
        console.log('❌ Error en consulta:', consultaResponse.data);
      }
    } else {
      console.log('\n❌ El problema AÚN EXISTE. Consecutivo incorrecto.');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Error: No se puede conectar al servidor en puerto 3000');
      console.log('   Ejecuta: npm run dev');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

probarEmision();