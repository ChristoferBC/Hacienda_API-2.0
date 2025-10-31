// Prueba rápida de generación de consecutivos
const { generateConsecutivo } = require('./src/utils/filenames');

async function testConsecutivos() {
    console.log('🔢 Probando generación de consecutivos...\n');
    
    for (let i = 1; i <= 3; i++) {
        try {
            const consecutivo = await generateConsecutivo();
            console.log(`Consecutivo ${i}: ${consecutivo}`);
            console.log(`  Longitud: ${consecutivo.length} caracteres`);
            console.log(`  Válido: ${consecutivo.length === 20 && /^[0-9]+$/.test(consecutivo) ? '✅' : '❌'}`);
            console.log('');
        } catch (error) {
            console.error(`❌ Error generando consecutivo ${i}:`, error.message);
        }
    }
}

testConsecutivos();