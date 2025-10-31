#!/bin/bash
# Script simple para probar el guardado de facturas
# Ejecutar: chmod +x test-simple.sh && ./test-simple.sh

echo "🧪 Prueba simple de guardado de facturas"
echo "========================================="
echo ""

# Verificar que el servidor está funcionando
echo "📡 Verificando servidor..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Servidor funcionando en puerto 3000"
else
    echo "❌ Error: Servidor no disponible en puerto 3000"
    echo "   Ejecuta 'npm run dev' primero"
    exit 1
fi

echo ""
echo "📋 Estado antes de la prueba:"
ls -la invoices/*.json 2>/dev/null | wc -l | xargs echo "Facturas existentes:"

echo ""
echo "🚀 Emitiendo factura de prueba..."

# Enviar factura usando el ejemplo
RESPONSE=$(curl -s -X POST http://localhost:3000/api/facturas/emitir \
  -H "Content-Type: application/json" \
  -d @examples/factura-ejemplo.json)

echo "📨 Respuesta del servidor:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Extraer consecutivo de la respuesta
CONSECUTIVO=$(echo "$RESPONSE" | jq -r '.consecutivo' 2>/dev/null)

if [ "$CONSECUTIVO" != "null" ] && [ "$CONSECUTIVO" != "" ]; then
    echo ""
    echo "✅ Factura creada con consecutivo: $CONSECUTIVO"
    
    echo ""
    echo "📁 Verificando archivos generados:"
    
    if [ -f "invoices/$CONSECUTIVO.json" ]; then
        echo "✅ JSON: invoices/$CONSECUTIVO.json ($(stat -f%z invoices/$CONSECUTIVO.json 2>/dev/null || stat -c%s invoices/$CONSECUTIVO.json) bytes)"
    else
        echo "❌ JSON no encontrado: invoices/$CONSECUTIVO.json"
    fi
    
    if [ -f "invoices/$CONSECUTIVO.xml" ]; then
        echo "✅ XML: invoices/$CONSECUTIVO.xml ($(stat -f%z invoices/$CONSECUTIVO.xml 2>/dev/null || stat -c%s invoices/$CONSECUTIVO.xml) bytes)"
    else
        echo "❌ XML no encontrado: invoices/$CONSECUTIVO.xml"
    fi
    
    echo ""
    echo "🔍 Consultando factura creada:"
    curl -s "http://localhost:3000/api/facturas/$CONSECUTIVO" | jq '.encontrada' 2>/dev/null || echo "Error en consulta"
    
else
    echo "❌ Error: No se pudo obtener el consecutivo de la respuesta"
fi

echo ""
echo "📊 Estado final:"
ls -la invoices/*.json 2>/dev/null | wc -l | xargs echo "Total facturas:"

echo ""
echo "🎉 Prueba completada!"