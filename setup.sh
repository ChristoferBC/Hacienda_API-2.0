#!/bin/bash

# Script de configuración inicial del proyecto Hacienda API
# Este script automatiza la instalación y configuración inicial

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar dependencias
check_dependencies() {
    print_step "Verificando dependencias del sistema..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 16+ desde https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | sed 's/v//')
    if [ "$(printf '%s\n' "16.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "16.0.0" ]; then
        print_error "Node.js versión 16+ requerida. Versión actual: $NODE_VERSION"
        exit 1
    fi
    
    # npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está disponible"
        exit 1
    fi
    
    print_success "Node.js $(node -v) y npm $(npm -v) encontrados"
}

# Instalar dependencias del proyecto
install_dependencies() {
    print_step "Instalando dependencias del proyecto..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencias instaladas correctamente"
    else
        print_error "package.json no encontrado"
        exit 1
    fi
}

# Crear directorios necesarios
create_directories() {
    print_step "Creando estructura de directorios..."
    
    directories=(
        "invoices"
        "invoices/sent"
        "logs"
        "temp"
        "data"
        "data/keys"
        "data/backups"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            echo "  📁 Creado: $dir"
        fi
    done
    
    print_success "Estructura de directorios creada"
}

# Configurar archivos de ambiente
setup_environment() {
    print_step "Configurando archivos de ambiente..."
    
    # .env.development
    if [ ! -f ".env.development" ]; then
        cat > .env.development << 'EOF'
# Configuración de desarrollo
NODE_ENV=development
PORT=3000
HOST=localhost

# Modo ATV (SIMULATED para desarrollo sin certificados)
ATV_MODE=SIMULATED
# ATV_KEY_PATH=./data/keys/certificado.p12
# ATV_CERT_PATH=./data/keys/certificado.crt
# ATV_KEY_PASSWORD=password_del_certificado

# URLs de Hacienda (Sandbox para desarrollo)
HACIENDA_API_URL=https://api-sandbox.comprobanteselectronicos.go.cr
HACIENDA_TOKEN_URL=https://idp-sandbox.comprobanteselectronicos.go.cr

# Configuración de logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/app.log

# Configuración de archivos
INVOICES_BASE_DIR=./invoices
MAX_FILE_SIZE=10485760
MAX_FILES_PER_DIR=1000

# CORS (permitir todos los orígenes en desarrollo)
CORS_ORIGIN=*
EOF
        print_success "Archivo .env.development creado"
    else
        print_warning "Archivo .env.development ya existe"
    fi
    
    # .env (copia de development por defecto)
    if [ ! -f ".env" ]; then
        cp .env.development .env
        print_success "Archivo .env creado basado en .env.development"
    else
        print_warning "Archivo .env ya existe"
    fi
}

# Ejecutar tests iniciales
run_tests() {
    print_step "Ejecutando tests iniciales..."
    
    npm test
    
    if [ $? -eq 0 ]; then
        print_success "Todos los tests pasaron correctamente"
    else
        print_error "Algunos tests fallaron. Revisa la configuración"
        exit 1
    fi
}

# Verificar configuración
verify_setup() {
    print_step "Verificando configuración..."
    
    # Verificar que el servidor inicia
    print_step "Iniciando servidor de prueba..."
    timeout 10s npm start > /dev/null 2>&1 &
    SERVER_PID=$!
    
    sleep 5
    
    # Health check
    if curl -f -s "http://localhost:3000/health" > /dev/null 2>&1; then
        print_success "Servidor responde correctamente en puerto 3000"
    else
        print_warning "No se pudo verificar el servidor (puede ser normal si hay conflictos de puerto)"
    fi
    
    # Terminar servidor de prueba
    if ps -p $SERVER_PID > /dev/null 2>&1; then
        kill $SERVER_PID
    fi
}

# Mostrar información final
show_final_info() {
    echo ""
    echo -e "${GREEN}🎉 ¡Configuración completada exitosamente!${NC}"
    echo ""
    echo -e "${BLUE}📚 Comandos disponibles:${NC}"
    echo "  npm start          - Iniciar servidor en producción"
    echo "  npm run dev        - Iniciar servidor en modo desarrollo"
    echo "  npm test           - Ejecutar todos los tests"
    echo "  npm run test:watch - Ejecutar tests en modo watch"
    echo "  npm run lint       - Verificar código con ESLint"
    echo "  npm run lint:fix   - Corregir problemas de ESLint automáticamente"
    echo ""
    echo -e "${BLUE}🌐 Endpoints principales:${NC}"
    echo "  GET  /              - Información de la API"
    echo "  GET  /health        - Health check"
    echo "  POST /api/facturas/emitir   - Emitir nueva factura"
    echo "  POST /api/facturas/validar  - Validar factura"
    echo "  POST /api/facturas/enviar   - Enviar factura a Hacienda"
    echo "  GET  /api/facturas         - Listar facturas"
    echo ""
    echo -e "${BLUE}📁 Archivos importantes:${NC}"
    echo "  .env                - Configuración de ambiente"
    echo "  examples/           - Ejemplos de uso"
    echo "  docs/               - Documentación completa"
    echo "  invoices/           - Facturas generadas"
    echo "  logs/               - Archivos de log"
    echo ""
    echo -e "${YELLOW}⚠️ Próximos pasos:${NC}"
    echo "1. Revisa la configuración en .env si necesitas cambios"
    echo "2. Para producción, configura las llaves ATV en .env.production"
    echo "3. Ejecuta 'npm run dev' para iniciar en modo desarrollo"
    echo "4. Visita http://localhost:3000 para verificar que funciona"
    echo "5. Lee la documentación en docs/ para más detalles"
    echo ""
}

# Función principal
main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                    HACIENDA API SETUP                     ║"
    echo "║          API REST de Facturación Electrónica CR          ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        print_error "No se encontró package.json. Ejecuta este script desde el directorio raíz del proyecto."
        exit 1
    fi
    
    # Ejecutar pasos de configuración
    check_dependencies
    install_dependencies
    create_directories
    setup_environment
    run_tests
    verify_setup
    show_final_info
    
    echo -e "${GREEN}🚀 ¡Listo para usar! Ejecuta 'npm run dev' para comenzar${NC}"
}

# Manejo de errores
trap 'print_error "Error durante la configuración. Revisa los logs anteriores."; exit 1' ERR

# Ejecutar script principal
main "$@"