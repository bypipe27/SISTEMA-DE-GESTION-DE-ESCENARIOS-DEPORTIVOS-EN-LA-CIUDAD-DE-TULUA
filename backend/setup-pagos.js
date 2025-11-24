const fs = require('fs');
const path = require('path');
const db = require('./db.js');
const pool = db.pool || db.default || db;

async function setupPagosTables() {
  try {
    console.log('🔧 Configurando tablas de pagos y facturas...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'database_pagos.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar el SQL
    await pool.query(sql);
    
    console.log('✅ Tablas de pagos y facturas creadas exitosamente');
    
    // Verificar que las tablas existen
    const checkTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('pagos', 'facturas')
      ORDER BY table_name
    `);
    
    console.log('📊 Tablas encontradas:', checkTables.rows.map(r => r.table_name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al configurar tablas:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupPagosTables();
