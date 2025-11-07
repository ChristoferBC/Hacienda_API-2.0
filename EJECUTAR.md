# 🚀 Guía de Ejecución - Hacienda API

## Pasos para Ejecutar el Proyecto

### 1. Navegar al Directorio del Proyecto
```powershell
cd "c:\Users\Christofer Brenes\Documents\PRACTICA\Hacienda_API"
```

### 2. Instalar Dependencias
```powershell
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:

```powershell
# Crear el archivo .env
New-Item -Path .env -ItemType File -Force

# Agregar configuración básica
Add-Content -Path .env -Value "NODE_ENV=development"
Add-Content -Path .env -Value "PORT=3000"
Add-Content -Path .env -Value "ATV_MODE=SIMULATED"
Add-Content -Path .env -Value "LOG_LEVEL=info"
Add-Content -Path .env -Value "MAX_FILE_SIZE=10MB"
```

### 4. Ejecutar el Servidor

#### Opción 1: Modo Desarrollo (con reinicio automático)
```powershell
npm run dev
```

#### Opción 2: Modo Producción
```powershell
npm start
```

### 5. Verificar que Funciona

#### Health Check General
```powershell
# En otra terminal o navegador
curl http://localhost:3000/health
```

#### Health Check API Inglés
```powershell
curl http://localhost:3000/api/en/invoices/health/check
```

#### Información del Sistema
```powershell
curl http://localhost:3000/info
```

## 🧪 Probar la API en Inglés

### Ejemplo 1: Emitir Factura Simple
```powershell
curl -X POST "http://localhost:3000/api/en/invoices/issue" `
  -H "Content-Type: application/json" `
  -d '{
    "documentType": "01",
    "currencyCode": "USD",
    "exchangeRate": 650.00,
    "issuer": {
      "name": "Test Company Inc",
      "identification": "123456789",
      "identificationType": "02",
      "email": "test@company.com",
      "phone": "+1-555-0100",
      "countryCode": "US",
      "province": "01",
      "canton": "01",
      "district": "01",
      "address": "123 Test Street"
    },
    "receiver": {
      "name": "Costa Rica Client",
      "identification": "987654321",
      "identificationType": "01",
      "email": "client@cr.com",
      "phone": "+506-2222-3333"
    },
    "serviceDetail": [
      {
        "lineNumber": 1,
        "code": "SRV001",
        "description": "Consulting Services",
        "quantity": 5,
        "unitOfMeasure": "Hrs",
        "unitPrice": 100.00,
        "totalAmount": 500.00,
        "discount": 0.00,
        "discountNature": "No discount",
        "subtotal": 500.00,
        "tax": {
          "code": "01",
          "rateCode": "08",
          "rate": 13.00,
          "amount": 65.00
        },
        "totalLineAmount": 565.00
      }
    ],
    "invoiceSummary": {
      "totalTaxableServices": 500.00,
      "totalExemptServices": 0.00,
      "totalTaxableGoods": 0.00,
      "totalExemptGoods": 0.00,
      "totalTaxable": 500.00,
      "totalExempt": 0.00,
      "totalSale": 500.00,
      "totalDiscounts": 0.00,
      "totalNetSale": 500.00,
      "totalTax": 65.00,
      "totalInvoice": 565.00
    },
    "saleCondition": "01",
    "creditTerm": "0",
    "observations": "Test invoice"
  }'
```

### Ejemplo 2: Listar Facturas
```powershell
curl "http://localhost:3000/api/en/invoices?limit=5"
```

### Ejemplo 3: Consultar Factura Específica
```powershell
# Usar el consecutive que te devuelva el ejemplo 1
curl "http://localhost:3000/api/en/invoices/[CONSECUTIVE_NUMBER]?includeContent=true"
```

## 🔧 Comandos Útiles

### Ver Logs en Tiempo Real
```powershell
# Si usas npm run dev, los logs aparecen automáticamente
# Para ver logs de archivo (si los tienes configurados):
Get-Content -Path logs/app.log -Wait -Tail 10
```

### Limpiar Facturas de Prueba
```powershell
npm run clean:invoices
```

### Ejecutar Tests
```powershell
npm test
```

### Verificar Código
```powershell
npm run lint
```

## 🌐 URLs Disponibles

Una vez que esté ejecutándose:

- **Página Principal**: http://localhost:3000/
- **Health Check**: http://localhost:3000/health
- **Información del Sistema**: http://localhost:3000/info

### API en Español (Original)
- **Base**: http://localhost:3000/api/facturas/
- **Emitir**: POST http://localhost:3000/api/facturas/emitir
- **Validar**: POST http://localhost:3000/api/facturas/validar

### API en Inglés (Nueva)
- **Base**: http://localhost:3000/api/en/invoices/
- **Health Check**: GET http://localhost:3000/api/en/invoices/health/check
- **Emitir**: POST http://localhost:3000/api/en/invoices/issue
- **Validar**: POST http://localhost:3000/api/en/invoices/validate
- **Enviar**: POST http://localhost:3000/api/en/invoices/send
- **Consultar**: GET http://localhost:3000/api/en/invoices/:consecutive
- **Listar**: GET http://localhost:3000/api/en/invoices

## ❗ Solución de Problemas

### Error: Puerto ya en uso
```powershell
# Cambiar puerto en .env
(Get-Content .env) -replace "PORT=3000", "PORT=3001" | Set-Content .env
```

### Error: Módulos no encontrados
```powershell
# Reinstalar dependencias
Remove-Item -Recurse -Force node_modules
npm install
```

### Error: Permisos
```powershell
# Ejecutar PowerShell como Administrador
```

### Verificar que el proceso está corriendo
```powershell
# Ver procesos de Node.js
Get-Process -Name "node" -ErrorAction SilentlyContinue
```

### Matar proceso si es necesario
```powershell
# Si necesitas detener el servidor
Stop-Process -Name "node" -Force
```

## 🎯 Modo de Pruebas Rápidas

### Usando PowerShell ISE o VS Code Terminal:

```powershell
# 1. Navegar al proyecto
Set-Location "c:\Users\Christofer Brenes\Documents\PRACTICA\Hacienda_API"

# 2. Instalar (solo la primera vez)
npm install

# 3. Ejecutar
npm run dev

# 4. En otra terminal, probar:
curl http://localhost:3000/health
curl http://localhost:3000/api/en/invoices/health/check
```

## 📝 Notas Importantes

1. **Modo SIMULATED**: Por defecto está en modo simulado, no enviará datos reales a Hacienda
2. **Logs**: Revisa los logs para ver el procesamiento de facturas
3. **Archivos**: Las facturas se guardan en la carpeta `invoices/`
4. **Conversión**: La API en inglés convierte automáticamente al formato español para ATV

¡El sistema está listo para usar! 🎉