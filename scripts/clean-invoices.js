const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Script para limpiar facturas generadas
 * Uso: node scripts/clean-invoices.js [--force]
 */

const INVOICES_DIR = path.resolve('./invoices');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askConfirmation(message) {
  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      resolve(answer.toLowerCase().startsWith('s') || answer.toLowerCase().startsWith('y'));
    });
  });
}

async function cleanInvoices() {
  try {
    const force = process.argv.includes('--force');

    console.log('🧹 Script de limpieza de facturas');
    console.log(`📁 Directorio: ${INVOICES_DIR}`);

    // Verificar si el directorio existe
    if (!fs.existsSync(INVOICES_DIR)) {
      console.log('ℹ️  El directorio de facturas no existe');
      rl.close();
      return;
    }

    // Contar archivos
    const mainFiles = fs.readdirSync(INVOICES_DIR).filter(f => f.startsWith('FACTURA_'));
    const sentDir = path.join(INVOICES_DIR, 'sent');
    let sentFiles = [];
    
    if (fs.existsSync(sentDir)) {
      sentFiles = fs.readdirSync(sentDir);
    }

    const totalFiles = mainFiles.length + sentFiles.length;

    if (totalFiles === 0) {
      console.log('ℹ️  No hay facturas para limpiar');
      rl.close();
      return;
    }

    console.log(`📊 Archivos encontrados:`);
    console.log(`   - Facturas pendientes: ${mainFiles.length}`);
    console.log(`   - Facturas enviadas: ${sentFiles.length}`);
    console.log(`   - Total: ${totalFiles}`);
    console.log('');

    // Solicitar confirmación si no se usa --force
    if (!force) {
      const confirmed = await askConfirmation(
        '⚠️  ¿Está seguro de que desea eliminar TODAS las facturas? (s/N): '
      );

      if (!confirmed) {
        console.log('❌ Operación cancelada');
        rl.close();
        return;
      }
    }

    console.log('🗑️  Eliminando archivos...');

    // Eliminar archivos del directorio principal
    let deletedCount = 0;
    for (const file of mainFiles) {
      try {
        fs.unlinkSync(path.join(INVOICES_DIR, file));
        deletedCount++;
      } catch (error) {
        console.error(`❌ Error al eliminar ${file}:`, error.message);
      }
    }

    // Eliminar archivos del directorio 'sent'
    if (fs.existsSync(sentDir)) {
      for (const file of sentFiles) {
        try {
          fs.unlinkSync(path.join(sentDir, file));
          deletedCount++;
        } catch (error) {
          console.error(`❌ Error al eliminar sent/${file}:`, error.message);
        }
      }

      // Intentar eliminar el directorio 'sent' si está vacío
      try {
        const remainingSentFiles = fs.readdirSync(sentDir);
        if (remainingSentFiles.length === 0) {
          fs.rmdirSync(sentDir);
          console.log('📁 Directorio "sent" eliminado (estaba vacío)');
        }
      } catch (error) {
        // No es crítico si no se puede eliminar el directorio
      }
    }

    console.log('');
    console.log(`✅ Limpieza completada: ${deletedCount}/${totalFiles} archivos eliminados`);

    if (deletedCount < totalFiles) {
      console.log('⚠️  Algunos archivos no pudieron ser eliminados');
    }

    // Resetear consecutivo si se eliminaron todas las facturas
    if (deletedCount === totalFiles && fs.existsSync('./src/data/consecutivo.json')) {
      try {
        const consecutivoData = {
          current: 1,
          lastUpdated: new Date().toISOString(),
          format: 'YYYYMMDDHHMMSS',
          prefix: '00100101000000',
          resetBy: 'clean-invoices-script',
        };
        
        fs.writeFileSync('./src/data/consecutivo.json', JSON.stringify(consecutivoData, null, 2));
        console.log('🔄 Contador de consecutivos reiniciado');
      } catch (error) {
        console.warn('⚠️  No se pudo reiniciar el contador de consecutivos:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Ejecutar script
if (require.main === module) {
  cleanInvoices();
}

module.exports = cleanInvoices;