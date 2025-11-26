const fs = require('fs');
const path = require('path');
const db = require('./db.js');
const pool = db.pool || db.default || db;

async function setupMetodosPagoTable() {
  try {
    console.log('🔧 Configurando tabla de métodos de pago...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'database_metodos_pago.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar el SQL
    await pool.query(sql);
    
    console.log('✅ Tabla metodos_pago creada exitosamente');
    
    // Verificar que la tabla existe
    const checkTable = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'metodos_pago'
    `);
    
    if (checkTable.rows.length > 0) {
      console.log('📊 Tabla encontrada:', checkTable.rows[0].table_name);
      
      // Mostrar estructura de la tabla
      const columns = await pool.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'metodos_pago'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Columnas de la tabla:');
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('⚠️ La tabla no se encontró después de la creación');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al configurar tabla:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupMetodosPagoTable();
