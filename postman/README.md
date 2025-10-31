# 🚀 Guía Completa de Postman para Hacienda API

## 📥 Instalación e Importación

### 1. **Descargar Postman**
- Descarga desde: https://www.postman.com/downloads/
- O usa la versión web: https://web.postman.co/

### 2. **Importar la Colección**

#### **Opción A: Importar desde archivo**
1. Abrir Postman
2. Click en **"Import"** (esquina superior izquierda)
3. Seleccionar **"Upload files"**
4. Importar estos archivos:
   - `postman/Hacienda_API_Collection.json` - La colección completa
   - `postman/Hacienda_API_Environment.json` - Variables de entorno

#### **Opción B: Importar desde URL**
Si tienes los archivos en un repositorio Git:
```
https://raw.githubusercontent.com/tu-repo/hacienda-api/main/postman/Hacienda_API_Collection.json
```

### 3. **Configurar el Ambiente**
1. En Postman, seleccionar el ambiente **"Hacienda API Environment"**
2. Verificar que `baseUrl` esté configurada como `http://localhost:3000`

---

## 🎯 Pruebas Paso a Paso

### **Paso 1: Verificar que el Servidor Esté Funcionando**

1. **Abrir terminal en VS Code**:
   ```powershell
   cd "C:\Users\Christofer Brenes\Documents\PRACTICA\Hacienda_API"
   npm run dev
   ```

2. **En Postman, ejecutar**:
   - **Request**: `🏠 Sistema > Health Check`
   - **Resultado esperado**: Status 200 con información del sistema

### **Paso 2: Obtener Información de la API**

1. **Ejecutar**: `🏠 Sistema > Información de la API`
2. **Verificar**: 
   - Modo: `SIMULATED`
   - Versión: `1.0.0`
   - Enlaces a documentación

### **Paso 3: Emitir tu Primera Factura**

1. **Ejecutar**: `📄 Gestión de Facturas > Emitir Factura`
2. **Automáticamente guarda**:
   - `consecutivo` en variable de entorno
   - `clave` en variable de entorno
3. **Verificar respuesta**:
   ```json
   {
     "success": true,
     "consecutivo": "50601012025102900000001",
     "clave": "ABC123...",
     "estado": "procesado",
     "archivos": {
       "json": "./invoices/50601012025102900000001.json",
       "xml": "./invoices/50601012025102900000001.xml"
     }
   }
   ```

### **Paso 4: Verificar que la Factura se Guardó**

1. **Ejecutar**: `📄 Gestión de Facturas > Consultar Factura por Consecutivo`
2. **Usa automáticamente** el consecutivo guardado de la emisión anterior
3. **Verifica** que `encontrada: true`

### **Paso 5: Ver Todas las Facturas**

1. **Ejecutar**: `📄 Gestión de Facturas > Listar Todas las Facturas`
2. **Ver estadísticas**:
   - Total de facturas
   - Facturas pendientes/enviadas
   - Lista de facturas recientes

---

## 📋 Requests Principales

### 🟢 **Emisión y Gestión**

| Request | Método | Endpoint | Descripción |
|---------|---------|----------|-------------|
| **Emitir Factura** | POST | `/api/facturas/emitir` | Crea una nueva factura |
| **Validar Factura** | POST | `/api/facturas/validar` | Valida una factura |
| **Enviar a Hacienda** | POST | `/api/facturas/enviar` | Simula envío a Hacienda |
| **Consultar Factura** | GET | `/api/facturas/{consecutivo}` | Obtiene factura específica |
| **Listar Facturas** | GET | `/api/facturas` | Lista todas las facturas |

### 🔍 **Sistema y Monitoreo**

| Request | Método | Endpoint | Descripción |
|---------|---------|----------|-------------|
| **Health Check** | GET | `/health` | Verifica estado del servidor |
| **Info API** | GET | `/` | Información general |
| **Estado Sistema** | GET | `/api/facturas/status` | Estado detallado |

### 🧪 **Pruebas y Desarrollo**

| Request | Método | Endpoint | Descripción |
|---------|---------|----------|-------------|
| **Factura Rápida** | POST | `/api/facturas/emitir` | Datos mínimos para prueba |
| **Datos Inválidos** | POST | `/api/facturas/emitir` | Prueba manejo de errores |
| **Eliminar Factura** | DELETE | `/api/facturas/{consecutivo}` | Solo en desarrollo |

---

## 🔧 Variables de Entorno Automáticas

La colección maneja automáticamente estas variables:

| Variable | Descripción | Actualizada por |
|----------|-------------|-----------------|
| `baseUrl` | URL del servidor | Manual |
| `consecutivo` | Número de la última factura | Emisión de facturas |
| `clave` | Clave de la última factura | Emisión de facturas |
| `testEmisorId` | ID de prueba del emisor | Manual |
| `testReceptorId` | ID de prueba del receptor | Manual |

---

## 🎯 Flujos de Prueba Recomendados

### **🚀 Flujo Básico (5 minutos)**

1. `Health Check` ✅
2. `Emitir Factura` ✅
3. `Consultar Factura por Consecutivo` ✅
4. `Listar Todas las Facturas` ✅

### **🔬 Flujo Completo (10 minutos)**

1. `Información de la API` ✅
2. `Estado del Sistema` ✅
3. `Emitir Factura` ✅
4. `Validar Factura` ✅
5. `Enviar a Hacienda` ✅
6. `Consultar Factura por Consecutivo` ✅
7. `Listar Facturas Pendientes` ✅
8. `Listar Todas las Facturas` ✅

### **🐛 Flujo de Testing (15 minutos)**

1. `Factura Rápida de Prueba` ✅
2. `Validar Payload Completo` ✅
3. `Prueba de Error - Datos Inválidos` ❌ (error esperado)
4. `Consultar Factura Inexistente` ❌ (error esperado)
5. `Eliminar Factura (Solo Dev)` ✅

---

## 📊 Tests Automáticos Incluidos

La colección incluye **tests automáticos** que verifican:

### **Tests Globales** (en cada request):
- ✅ Tiempo de respuesta < 5 segundos
- ✅ Content-Type correcto (application/json)
- ✅ Logs de status y tiempo

### **Tests Específicos** (Emisión de Facturas):
- ✅ Status 201 (Created)
- ✅ Consecutivo tiene 20 dígitos
- ✅ Clave tiene 50 caracteres
- ✅ Variables guardadas automáticamente

### **Ver Resultados de Tests**:
1. Ejecutar cualquier request
2. Click en la pestaña **"Test Results"**
3. Ver ✅/❌ de cada test

---

## 🔍 Verificar Archivos Generados

### **Desde Postman**:
1. Emitir una factura
2. Copiar el `consecutivo` de la respuesta
3. Usar `Consultar Factura por Consecutivo`
4. Verificar que `encontrada: true`

### **Desde el Explorador de Archivos**:
1. Abrir: `C:\Users\Christofer Brenes\Documents\PRACTICA\Hacienda_API\invoices`
2. Buscar archivos: `{consecutivo}.json` y `{consecutivo}.xml`
3. Verificar que se crearon correctamente

### **Desde VS Code**:
```powershell
# Listar facturas creadas
Get-ChildItem invoices\*.json | Select-Object Name, Length, LastWriteTime

# Ver contenido de la última factura
$ultimaFactura = Get-ChildItem invoices\*.json | Sort-Object LastWriteTime | Select-Object -Last 1
Get-Content $ultimaFactura.FullName | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

---

## 🚨 Solución de Problemas

### **Error: "Connection refused"**
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**Solución**: 
1. Verificar que el servidor esté corriendo: `npm run dev`
2. Verificar el puerto en `baseUrl`: `http://localhost:3000`

### **Error: "Module not found"**
```
Error: Cannot find module 'express'
```
**Solución**: 
```powershell
cd "C:\Users\Christofer Brenes\Documents\PRACTICA\Hacienda_API"
npm install
```

### **Error: "Invalid JSON"**
**Solución**:
1. Verificar que el Content-Type sea `application/json`
2. Validar el JSON en el Body del request
3. Usar el formateador de JSON de Postman

### **Variables no se actualizan**
**Solución**:
1. Verificar que el Environment esté seleccionado
2. Ejecutar el request de "Emitir Factura" primero
3. Ver la consola de Postman (View > Show Postman Console)

### **Archivos no se crean**
**Solución**:
1. Verificar permisos de escritura en la carpeta
2. Revisar logs del servidor en la terminal
3. Verificar que el directorio `invoices/` exista

---

## 📚 Recursos Adicionales

### **Documentación OpenAPI**:
- Importar desde: `docs/openapi.json`
- Ver en Swagger UI: `http://localhost:3000/docs` (si está configurado)

### **Tests Automatizados**:
```powershell
npm test                    # Todos los tests
npm run test:integration   # Solo integración
npm run test:watch        # Modo watch
```

### **Logs del Servidor**:
- Terminal: Ver logs en tiempo real
- Archivo: `logs/app.log`
- Nivel: Configurable en `.env`

---

## 🎉 ¡Listo para Usar!

Con esta configuración tienes:

✅ **Colección completa** con todos los endpoints
✅ **Variables automáticas** para flujo continuo  
✅ **Tests integrados** para validación
✅ **Ejemplos realistas** con datos de Costa Rica
✅ **Manejo de errores** para pruebas robustas
✅ **Documentación incluida** en cada request

**¡Ejecuta el flujo básico y verás tu API funcionando perfectamente en 5 minutos!** 🚀