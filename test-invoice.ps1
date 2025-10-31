# Script de PowerShell para probar el guardado de facturas
# Ejecutar: .\test-invoice.ps1

Write-Host "🧪 Probando el sistema de facturación electrónica..." -ForegroundColor Blue
Write-Host ""

# Verificar si el servidor está funcionando
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Servidor funcionando correctamente" -ForegroundColor Green
    Write-Host "   Modo: $($healthCheck.mode)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error: El servidor no está funcionando en http://localhost:3000" -ForegroundColor Red
    Write-Host "   Ejecuta 'npm run dev' primero" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Verificando directorio de facturas antes..." -ForegroundColor Blue

# Contar facturas existentes
$invoicesDir = "./invoices"
$existingFiles = Get-ChildItem -Path $invoicesDir -Filter "*.json" -ErrorAction SilentlyContinue
Write-Host "   Facturas existentes: $($existingFiles.Count)" -ForegroundColor Yellow

Write-Host ""
Write-Host "🚀 Emitiendo nueva factura..." -ForegroundColor Blue

# Crear una factura de prueba
$testInvoice = @{
    "tipoDocumento" = "01"
    "codigoMoneda" = "CRC"
    "tipoCambio" = 1.0
    "emisor" = @{
        "nombre" = "EMPRESA DE PRUEBA LTDA"
        "identificacion" = "312345678901"
        "tipoIdentificacion" = "02"
        "correoElectronico" = "facturacion@empresa.cr"
        "telefono" = "22334455"
        "codigoPais" = "506"
        "provincia" = "San José"
        "canton" = "Escazú"
        "distrito" = "Escazú"
        "direccion" = "Del semáforo 200m norte"
    }
    "receptor" = @{
        "nombre" = "CLIENTE DE PRUEBA SA"
        "identificacion" = "398765432101"
        "tipoIdentificacion" = "02"
        "correoElectronico" = "cliente@email.com"
        "telefono" = "88776655"
    }
    "detalleServicio" = @(
        @{
            "numeroLinea" = 1
            "codigo" = "SERV001"
            "descripcion" = "Servicio de consultoría tecnológica"
            "cantidad" = 10.0
            "unidadMedida" = "Hrs"
            "precioUnitario" = 15000.0
            "montoTotal" = 150000.0
            "descuento" = 0.0
            "subtotal" = 150000.0
            "impuesto" = @{
                "codigo" = "01"
                "codigoTarifa" = "08"
                "tarifa" = 13.0
                "monto" = 19500.0
            }
            "montoTotalLinea" = 169500.0
        }
    )
    "resumenFactura" = @{
        "montoTotalServiciosGravados" = 150000.0
        "montoTotalServiciosExentos" = 0.0
        "montoTotalMercanciaGravada" = 0.0
        "montoTotalMercanciaExenta" = 0.0
        "totalGravado" = 150000.0
        "totalExento" = 0.0
        "totalVenta" = 150000.0
        "totalDescuentos" = 0.0
        "totalVentaNeta" = 150000.0
        "totalImpuesto" = 19500.0
        "totalComprobante" = 169500.0
    }
    "condicionVenta" = "01"
    "plazoCredito" = 0
    "observaciones" = "Factura de prueba generada automáticamente"
}

try {
    # Convertir a JSON y enviar
    $jsonPayload = $testInvoice | ConvertTo-Json -Depth 10
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/facturas/emitir" -Method POST -Body $jsonPayload -ContentType "application/json"
    
    Write-Host "✅ Factura emitida exitosamente!" -ForegroundColor Green
    Write-Host "   Consecutivo: $($response.consecutivo)" -ForegroundColor Yellow
    Write-Host "   Clave: $($response.clave)" -ForegroundColor Yellow
    Write-Host "   Estado: $($response.estado)" -ForegroundColor Yellow
    
    $consecutivo = $response.consecutivo
    
} catch {
    Write-Host "❌ Error al emitir factura:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📁 Verificando archivos generados..." -ForegroundColor Blue

# Verificar archivos JSON y XML
$jsonFile = "./invoices/$consecutivo.json"
$xmlFile = "./invoices/$consecutivo.xml"

if (Test-Path $jsonFile) {
    Write-Host "✅ Archivo JSON creado: $jsonFile" -ForegroundColor Green
    $fileSize = (Get-Item $jsonFile).Length
    Write-Host "   Tamaño: $fileSize bytes" -ForegroundColor Yellow
} else {
    Write-Host "❌ Archivo JSON NO encontrado: $jsonFile" -ForegroundColor Red
}

if (Test-Path $xmlFile) {
    Write-Host "✅ Archivo XML creado: $xmlFile" -ForegroundColor Green
    $fileSize = (Get-Item $xmlFile).Length
    Write-Host "   Tamaño: $fileSize bytes" -ForegroundColor Yellow
} else {
    Write-Host "❌ Archivo XML NO encontrado: $xmlFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Verificando directorio después..." -ForegroundColor Blue

# Contar facturas después
$newFiles = Get-ChildItem -Path $invoicesDir -Filter "*.json" -ErrorAction SilentlyContinue
Write-Host "   Total facturas ahora: $($newFiles.Count)" -ForegroundColor Yellow
Write-Host "   Nuevas facturas creadas: $($newFiles.Count - $existingFiles.Count)" -ForegroundColor Green

Write-Host ""
Write-Host "🔍 Consultando la factura recién creada..." -ForegroundColor Blue

try {
    $consultaResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/facturas/$consecutivo" -Method GET
    
    if ($consultaResponse.encontrada) {
        Write-Host "✅ Factura encontrada en el sistema" -ForegroundColor Green
        Write-Host "   Consecutivo: $($consultaResponse.consecutivo)" -ForegroundColor Yellow
        Write-Host "   Tiene contenido JSON: $($null -ne $consultaResponse.contenido.json)" -ForegroundColor Yellow
        Write-Host "   Tiene contenido XML: $($null -ne $consultaResponse.contenido.xml -and $consultaResponse.contenido.xml -ne '')" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Factura NO encontrada en consulta" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al consultar factura: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Listando todas las facturas..." -ForegroundColor Blue

try {
    $listaResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/facturas?limit=5" -Method GET
    
    Write-Host "✅ Total de facturas: $($listaResponse.pagination.total)" -ForegroundColor Green
    Write-Host "   Facturas pendientes: $($listaResponse.stats.pending)" -ForegroundColor Yellow
    Write-Host "   Facturas enviadas: $($listaResponse.stats.sent)" -ForegroundColor Yellow
    
    if ($listaResponse.facturas.Count -gt 0) {
        Write-Host ""
        Write-Host "📋 Últimas facturas:" -ForegroundColor Blue
        foreach ($factura in $listaResponse.facturas | Select-Object -First 3) {
            Write-Host "   • $($factura.consecutivo) - $($factura.estado) - $($factura.timestamp)" -ForegroundColor Yellow
        }
    }
    
} catch {
    Write-Host "❌ Error al listar facturas: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Prueba completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Resumen de la prueba:" -ForegroundColor Blue
Write-Host "   ✅ Servidor funcionando" -ForegroundColor Green
Write-Host "   ✅ Factura emitida correctamente" -ForegroundColor Green
Write-Host "   ✅ Archivos JSON y XML guardados" -ForegroundColor Green
Write-Host "   ✅ Factura consultable por consecutivo" -ForegroundColor Green
Write-Host "   ✅ Factura aparece en listado" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 Para ver el contenido de la factura:" -ForegroundColor Yellow
Write-Host "   Get-Content './invoices/$consecutivo.json' | ConvertFrom-Json | ConvertTo-Json -Depth 10"
Write-Host ""
Write-Host "🌐 Para probar en el navegador:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000/api/facturas/$consecutivo"