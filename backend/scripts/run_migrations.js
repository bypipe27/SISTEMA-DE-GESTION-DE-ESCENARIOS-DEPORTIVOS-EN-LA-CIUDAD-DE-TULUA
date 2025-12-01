const fs = require('fs');
const path = require('path');

// Cargar .env y la pool de db
require('dotenv').config();
const pool = require('../db.js');

async function run() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error('No se encontró la carpeta migrations:', migrationsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  if (files.length === 0) {
    console.log('No hay archivos SQL en migrations/');
    process.exit(0);
  }

  const client = await pool.connect();
  try {
    for (const file of files) {
      const full = path.join(migrationsDir, file);
      console.log(`Ejecutando migración: ${file}`);
      const sql = fs.readFileSync(full, { encoding: 'utf8' });
      // Ejecutar directamente. Los archivos pueden contener BEGIN/COMMIT.
      await client.query(sql);
      console.log(`✔ Migración aplicada: ${file}`);
    }
    console.log('Todas las migraciones han sido aplicadas.');
  } catch (err) {
    console.error('Error aplicando migraciones:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    // cerrar pool para terminar el proceso
    await pool.end?.();
  }
}

run();