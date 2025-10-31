@echo off
setlocal enabledelayedexpansion

:: Script de configuración inicial del proyecto Hacienda API para Windows
:: Este script automatiza la instalación y configuración inicial

title Hacienda API Setup

:: Colores (limitados en Windows CMD)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

:: Funciones simuladas con etiquetas
goto :main

:print_step
echo %BLUE%📋 %~1%NC%
goto :eof

:print_success
echo %GREEN%✅ %~1%NC%
goto :eof

:print_warning
echo %YELLOW%⚠️ %~1%NC%
goto :eof

:print_error
echo %RED%❌ %~1%NC%
goto :eof

:check_dependencies
call :print_step "Verificando dependencias del sistema..."

:: Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Node.js no está instalado. Por favor instala Node.js 16+ desde https://nodejs.org/"
    pause
    exit /b 1
)

:: Verificar npm
npm --version >nul 2>&1
if errorlevel 1 (
    call :print_error "npm no está disponible"
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=1" %%i in ('npm --version') do set NPM_VERSION=%%i

call :print_success "Node.js %NODE_VERSION% y npm %NPM_VERSION% encontrados"
goto :eof

:install_dependencies
call :print_step "Instalando dependencias del proyecto..."

if exist package.json (
    npm install
    if errorlevel 1 (
        call :print_error "Error instalando dependencias"
        pause
        exit /b 1
    )
    call :print_success "Dependencias instaladas correctamente"
) else (
    call :print_error "package.json no encontrado"
    pause
    exit /b 1
)
goto :eof

:create_directories
call :print_step "Creando estructura de directorios..."

set directories=invoices invoices\sent logs temp data data\keys data\backups

for %%d in (%directories%) do (
    if not exist "%%d" (
        mkdir "%%d"
        echo   📁 Creado: %%d
    )
)

call :print_success "Estructura de directorios creada"
goto :eof

:setup_environment
call :print_step "Configurando archivos de ambiente..."

if not exist ".env.development" (
    (
        echo # Configuración de desarrollo
        echo NODE_ENV=development
        echo PORT=3000
        echo HOST=localhost
        echo.
        echo # Modo ATV ^(SIMULATED para desarrollo sin certificados^)
        echo ATV_MODE=SIMULATED
        echo # ATV_KEY_PATH=./data/keys/certificado.p12
        echo # ATV_CERT_PATH=./data/keys/certificado.crt
        echo # ATV_KEY_PASSWORD=password_del_certificado
        echo.
        echo # URLs de Hacienda ^(Sandbox para desarrollo^)
        echo HACIENDA_API_URL=https://api-sandbox.comprobanteselectronicos.go.cr
        echo HACIENDA_TOKEN_URL=https://idp-sandbox.comprobanteselectronicos.go.cr
        echo.
        echo # Configuración de logging
        echo LOG_LEVEL=debug
        echo LOG_FILE_PATH=./logs/app.log
        echo.
        echo # Configuración de archivos
        echo INVOICES_BASE_DIR=./invoices
        echo MAX_FILE_SIZE=10485760
        echo MAX_FILES_PER_DIR=1000
        echo.
        echo # CORS ^(permitir todos los orígenes en desarrollo^)
        echo CORS_ORIGIN=*
    ) > .env.development
    call :print_success "Archivo .env.development creado"
) else (
    call :print_warning "Archivo .env.development ya existe"
)

if not exist ".env" (
    copy .env.development .env >nul
    call :print_success "Archivo .env creado basado en .env.development"
) else (
    call :print_warning "Archivo .env ya existe"
)
goto :eof

:run_tests
call :print_step "Ejecutando tests iniciales..."

npm test
if errorlevel 1 (
    call :print_error "Algunos tests fallaron. Revisa la configuración"
    pause
    exit /b 1
)

call :print_success "Todos los tests pasaron correctamente"
goto :eof

:verify_setup
call :print_step "Verificando configuración..."

call :print_step "Iniciando servidor de prueba..."

:: Iniciar servidor en background (simulado)
start /b npm start >nul 2>&1

:: Esperar un poco
timeout /t 5 >nul

:: Verificar si el puerto 3000 está en uso (método simple para Windows)
netstat -an | findstr ":3000" >nul
if not errorlevel 1 (
    call :print_success "Servidor responde correctamente en puerto 3000"
) else (
    call :print_warning "No se pudo verificar el servidor (puede ser normal si hay conflictos de puerto)"
)

:: Intentar terminar procesos de Node.js que puedan estar ejecutándose
taskkill /f /im node.exe >nul 2>&1
goto :eof

:show_final_info
echo.
echo %GREEN%🎉 ¡Configuración completada exitosamente!%NC%
echo.
echo %BLUE%📚 Comandos disponibles:%NC%
echo   npm start          - Iniciar servidor en producción
echo   npm run dev        - Iniciar servidor en modo desarrollo
echo   npm test           - Ejecutar todos los tests
echo   npm run test:watch - Ejecutar tests en modo watch
echo   npm run lint       - Verificar código con ESLint
echo   npm run lint:fix   - Corregir problemas de ESLint automáticamente
echo.
echo %BLUE%🌐 Endpoints principales:%NC%
echo   GET  /              - Información de la API
echo   GET  /health        - Health check
echo   POST /api/facturas/emitir   - Emitir nueva factura
echo   POST /api/facturas/validar  - Validar factura
echo   POST /api/facturas/enviar   - Enviar factura a Hacienda
echo   GET  /api/facturas         - Listar facturas
echo.
echo %BLUE%📁 Archivos importantes:%NC%
echo   .env                - Configuración de ambiente
echo   examples\           - Ejemplos de uso
echo   docs\               - Documentación completa
echo   invoices\           - Facturas generadas
echo   logs\               - Archivos de log
echo.
echo %YELLOW%⚠️ Próximos pasos:%NC%
echo 1. Revisa la configuración en .env si necesitas cambios
echo 2. Para producción, configura las llaves ATV en .env.production
echo 3. Ejecuta 'npm run dev' para iniciar en modo desarrollo
echo 4. Visita http://localhost:3000 para verificar que funciona
echo 5. Lee la documentación en docs\ para más detalles
echo.
goto :eof

:main
cls
echo %BLUE%
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                    HACIENDA API SETUP                     ║
echo ║          API REST de Facturación Electrónica CR          ║
echo ╚═══════════════════════════════════════════════════════════╝
echo %NC%

:: Verificar que estamos en el directorio correcto
if not exist package.json (
    call :print_error "No se encontró package.json. Ejecuta este script desde el directorio raíz del proyecto."
    pause
    exit /b 1
)

:: Ejecutar pasos de configuración
call :check_dependencies
if errorlevel 1 exit /b 1

call :install_dependencies
if errorlevel 1 exit /b 1

call :create_directories
if errorlevel 1 exit /b 1

call :setup_environment
if errorlevel 1 exit /b 1

call :run_tests
if errorlevel 1 exit /b 1

call :verify_setup
if errorlevel 1 exit /b 1

call :show_final_info

echo %GREEN%🚀 ¡Listo para usar! Ejecuta 'npm run dev' para comenzar%NC%
echo.
echo Presiona cualquier tecla para continuar...
pause >nul