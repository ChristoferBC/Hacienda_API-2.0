# Hacienda API - Sistema de Facturación Electrónica

API REST completa en Node.js para facturación electrónica que simula el comportamiento del SDK oficial de ATV (@facturacr/atv-sdk) de Costa Rica cuando no se tienen las llaves criptográficas disponibles.

## 🚀 Características

- **Modo Simulado**: Funciona sin llaves criptográficas para desarrollo y testing
- **Modo Real**: Soporte para SDK oficial cuando las llaves están configuradas
- **API REST Completa**: Endpoints para emitir, validar, enviar y consultar facturas
- **Almacenamiento Local**: Las facturas se guardan en archivos JSON y XML
- **Validación Completa**: Validación estructural y de lógica de negocio
- **Tests Unitarios e Integración**: Cobertura del 80%+
- **Documentación OpenAPI**: Especificación completa de la API
- **Logging Avanzado**: Con Winston para desarrollo y producción

## 📋 Requisitos

- **Node.js**: 16.0.0 o superior
- **npm**: 7.0.0 o superior
- **Espacio en disco**: ~50MB para dependencias + espacio para facturas

## 🛠️ Instalación

```bash
# Clonar o descargar el proyecto
cd Hacienda_API

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# (Opcional) Editar .env con sus configuraciones específicas
```

## ⚙️ Configuración

### Variables de Entorno

Copie `.env.example` a `.env` y configure según sea necesario:

```bash
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de ATV (Hacienda)
# Si estas variables están vacías, el sistema operará en modo SIMULADO
ATV_KEY_PATH=
ATV_CERT_PATH=
ATV_CLIENT_ID=
ATV_USERNAME=
ATV_PIN=

# Configuración de simulación
SIMULATE_IF_NO_KEYS=true

# Otros
LOG_LEVEL=info
INVOICES_DIR=./invoices
```

### Modos de Operación

#### Modo SIMULADO (por defecto)
- Se activa cuando faltan las variables `ATV_KEY_PATH`, `ATV_CERT_PATH` o `ATV_CLIENT_ID`
- Genera respuestas realistas sin conectar a Hacienda
- Ideal para desarrollo y testing
- Las facturas se guardan localmente con estado "SIMULATED"

#### Modo REAL
- Requiere configurar todas las variables ATV_* con las llaves reales
- Utiliza el SDK oficial @facturacr/atv-sdk
- Se conecta realmente con los servicios de Hacienda
- **Nota**: Las llaves no están incluidas en este proyecto

## 🏃‍♂️ Uso

### Iniciar el servidor

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start

# Ver información del sistema
curl http://localhost:3000/info
```

### Scripts disponibles

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo con nodemon
npm test           # Ejecutar tests
npm run test:watch # Tests en modo watch
npm run test:coverage # Tests con cobertura
npm run lint       # Verificar código con ESLint
npm run lint:fix   # Corregir problemas automáticamente
npm run format     # Formatear código con Prettier
npm run clean:invoices # Limpiar facturas (con confirmación)
```

## 📡 API Endpoints

### Información del Sistema

```bash
GET /               # Información general de la API
GET /health         # Health check
GET /info           # Información detallada del sistema
GET /api/facturas/status # Estado del sistema de facturación
```

### Operaciones de Facturas

#### 1. Emitir Factura
```bash
POST /api/facturas/emitir

# Ejemplo de payload (ver examples/factura-ejemplo.json)
{
  "emisor": {
    "nombre": "Empresa Ejemplo S.A.",
    "identificacion": "312345678901",
    "tipoIdentificacion": "02"
  },
  "receptor": {
    "nombre": "Juan Pérez Gómez", 
    "identificacion": "123456789",
    "tipoIdentificacion": "01"
  },
  "detalleServicio": [...],
  "resumenFactura": {...}
}

# Respuesta
{
  "success": true,
  "consecutivo": "00100101000000000001",
  "clave": "50612345678901234567890123456789012345678901234567",
  "estado": "SIMULATED_EMITIDO",
  "mode": "SIMULATED",
  "archivos": {
    "json": "/path/to/FACTURA_00100101000000000001_timestamp.json",
    "xml": "/path/to/FACTURA_00100101000000000001.xml"
  }
}
```

#### 2. Validar Factura
```bash
POST /api/facturas/validar

# Por clave
{"clave": "50612345678901234567890123456789012345678901234567"}

# Por consecutivo  
{"consecutivo": "00100101000000000001"}

# Por payload completo
{"payload": {...}}
```

#### 3. Enviar Factura (Simulado)
```bash
POST /api/facturas/enviar

# Por clave o consecutivo
{"clave": "50612345..."}
# o
{"consecutivo": "00100101000000000001"}

# Respuesta
{
  "success": true,
  "estado": "ENVIADO_SIMULADO",
  "respuestaHacienda": {
    "codigo": "01",
    "mensaje": "Comprobante recibido correctamente (SIMULADO)"
  }
}
```

#### 4. Consultar Factura
```bash
GET /api/facturas/{consecutivo}
GET /api/facturas/{consecutivo}?includeContent=false

# Respuesta
{
  "success": true,
  "consecutivo": "00100101000000000001",
  "encontrada": true,
  "contenido": {
    "json": {...},
    "xml": "..."
  },
  "estadoATV": {...}
}
```

#### 5. Listar Facturas
```bash
GET /api/facturas?status=all&limit=50&offset=0

# Filtros disponibles:
# - status: all|pending|sent
# - includeContent: true|false
# - limit: número (máx 100)  
# - offset: número
```

#### 6. Eliminar Factura (Solo desarrollo)
```bash
DELETE /api/facturas/{consecutivo}
# Solo funciona si NODE_ENV=development
```

## 📄 Ejemplo de Uso Completo

```bash
# 1. Verificar estado del sistema
curl http://localhost:3000/api/facturas/status

# 2. Emitir una factura usando el ejemplo
curl -X POST http://localhost:3000/api/facturas/emitir \
  -H "Content-Type: application/json" \
  -d @examples/factura-ejemplo.json

# 3. Validar la factura emitida
curl -X POST http://localhost:3000/api/facturas/validar \
  -H "Content-Type: application/json" \
  -d '{"consecutivo": "00100101000000000001"}'

# 4. Enviar la factura
curl -X POST http://localhost:3000/api/facturas/enviar \
  -H "Content-Type: application/json" \
  -d '{"consecutivo": "00100101000000000001"}'

# 5. Consultar estado
curl http://localhost:3000/api/facturas/00100101000000000001

# 6. Listar todas las facturas
curl http://localhost:3000/api/facturas
```

## 🗂️ Estructura del Proyecto

```
├── src/
│   ├── server.js              # Punto de entrada del servidor
│   ├── app.js                 # Configuración de Express
│   ├── config/
│   │   └── index.js           # Configuración centralizada
│   ├── routes/
│   │   └── facturas.js        # Rutas de la API
│   ├── controllers/
│   │   └── facturaController.js # Lógica de controladores
│   ├── services/
│   │   ├── atvAdapter.js      # Adaptador del SDK ATV
│   │   └── invoiceStorage.js  # Gestión de archivos
│   ├── validators/
│   │   └── facturaValidator.js # Validación de datos
│   ├── models/
│   │   └── facturaModel.js    # Definición de modelos
│   ├── utils/
│   │   ├── filenames.js       # Utilidades de archivos
│   │   └── logger.js          # Configuración de logging
│   └── data/
│       └── consecutivo.json   # Control de consecutivos
├── invoices/                  # Facturas generadas
│   └── sent/                  # Facturas enviadas
├── tests/
│   ├── unit/                  # Tests unitarios
│   ├── integration/           # Tests de integración
│   └── setup.js               # Configuración de tests
├── examples/
│   └── factura-ejemplo.json   # Ejemplo de factura
├── docs/
│   └── openapi.json           # Especificación OpenAPI
└── scripts/
    └── clean-invoices.js      # Script de limpieza
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Tests específicos
npm test -- --testNamePattern="ATV Adapter"
npm test -- tests/unit/atvAdapter.test.js
```

### Cobertura Esperada
- **Líneas**: >80%
- **Funciones**: >80%
- **Ramas**: >80%
- **Declaraciones**: >80%

## 📚 Documentación API

La documentación OpenAPI está disponible en:
- **Archivo**: `docs/openapi.json`
- **URL**: `http://localhost:3000/info` (información del sistema)

## 📁 Gestión de Archivos

### Estructura de Archivos Generados

```
invoices/
├── FACTURA_{consecutivo}_{timestamp}.json    # Datos completos
├── FACTURA_{consecutivo}.xml                 # XML del comprobante
└── sent/
    ├── FACTURA_{consecutivo}_{timestamp}.json    # Copia de enviadas
    ├── FACTURA_{consecutivo}.xml                 # XML de enviadas
    └── ENVIO_{consecutivo}_{timestamp}.json      # Metadata del envío
```

### Limpieza de Archivos

```bash
# Limpiar todas las facturas (con confirmación)
npm run clean:invoices

# Limpiar sin confirmación
node scripts/clean-invoices.js --force
```

## 🔧 Desarrollo

### Configuración del IDE

Se recomienda VS Code con las siguientes extensiones:
- ESLint
- Prettier
- Jest
- Thunder Client (para probar la API)

### Hooks de Git (opcional)

```bash
# Instalar husky para hooks pre-commit
npm install --save-dev husky lint-staged

# Configurar pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm test"
```

### Variables de Entorno para Desarrollo

```bash
# .env para desarrollo local
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
SIMULATE_IF_NO_KEYS=true
```

## 🚨 Solución de Problemas

### Error: "ATVAdapter no está inicializado"
```bash
# Verificar que las variables de entorno estén configuradas
# Reiniciar el servidor
npm run dev
```

### Error: "Factura no encontrada"
```bash
# Verificar que el consecutivo tenga exactamente 20 dígitos
# Verificar que los archivos existan en /invoices
ls invoices/
```

### Error: Puerto en uso
```bash
# Cambiar el puerto en .env
PORT=3001

# O matar el proceso que usa el puerto
lsof -ti:3000 | xargs kill -9
```

### Tests fallando
```bash
# Limpiar cache de Jest
npx jest --clearCache

# Ejecutar tests individuales para debugging
npm test -- --testNamePattern="nombre del test"
```

## 🔐 Configuración para Producción

### Variables de Entorno Producción

```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn

# Para uso real (requiere llaves válidas)
ATV_KEY_PATH=/path/to/key.key
ATV_CERT_PATH=/path/to/cert.crt
ATV_CLIENT_ID=your_client_id
ATV_USERNAME=your_username  
ATV_PIN=your_pin
SIMULATE_IF_NO_KEYS=false
```

### Despliegue

```bash
# Instalar dependencias de producción solamente
npm ci --only=production

# Ejecutar tests antes del despliegue
npm test

# Iniciar en producción
npm start
```

## 📝 Notas Importantes

### Modo Simulado vs Real

- **Simulado**: Los comprobantes no se envían a Hacienda. Todas las respuestas son simuladas pero realistas.
- **Real**: Requiere llaves criptográficas válidas del Ministerio de Hacienda de Costa Rica.

### Seguridad

- Las llaves criptográficas **NUNCA** se deben versionar
- Usar HTTPS en producción
- Validar todos los inputs de usuario
- Mantener logs de auditoría

### Rendimiento

- Los archivos se almacenan localmente, considerar limpieza periódica
- Para alto volumen, considerar base de datos
- El modo simulado es más rápido que el real

## 🤝 Contribución

1. Fork del repositorio
2. Crear branch para feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push al branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código

- Seguir las reglas de ESLint configuradas
- Mantener cobertura de tests >80%
- Documentar funciones públicas
- Usar commits descriptivos

## 📞 Soporte

Para reportar problemas o solicitar funcionalidades:

1. Crear issue en el repositorio
2. Incluir logs relevantes
3. Especificar versión de Node.js y npm
4. Describir pasos para reproducir

## 📄 Licencia

ISC - Ver archivo LICENSE para más detalles.

## 🙏 Agradecimientos

- Ministerio de Hacienda de Costa Rica por las especificaciones
- Comunidad de @facturacr/atv-sdk
- Contribuidores del proyecto

---

**Versión**: 1.0.0  
**Fecha**: 2025  
**Node.js**: >=16.0.0