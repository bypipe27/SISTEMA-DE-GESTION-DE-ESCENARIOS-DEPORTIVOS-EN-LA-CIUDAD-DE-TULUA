# ==================================================
# Script de Configuración Rápida - Backend
# Sistema de Gestión de Escenarios Deportivos
# ==================================================

# Colores para output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

Write-Host "========================================" -ForegroundColor $Cyan
Write-Host "🚀 CONFIGURACIÓN AUTOMÁTICA - BACKEND" -ForegroundColor $Cyan
Write-Host "========================================" -ForegroundColor $Cyan
Write-Host ""

# Verificar si estamos en la carpeta backend
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la carpeta 'backend'" -ForegroundColor $Red
    exit 1
}

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor $Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor $Green
} catch {
    Write-Host "❌ Node.js no está instalado. Descárgalo de https://nodejs.org" -ForegroundColor $Red
    exit 1
}

# Verificar PostgreSQL
Write-Host ""
Write-Host "🔍 Verificando PostgreSQL..." -ForegroundColor $Yellow
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL instalado: $pgVersion" -ForegroundColor $Green
} catch {
    Write-Host "⚠️  PostgreSQL no detectado o no está en PATH" -ForegroundColor $Yellow
    Write-Host "   Asegúrate de tenerlo instalado y corriendo" -ForegroundColor $Yellow
}

# Crear .env si no existe
Write-Host ""
Write-Host "📝 Configurando archivo .env..." -ForegroundColor $Yellow

if (Test-Path ".env") {
    Write-Host "⚠️  El archivo .env ya existe" -ForegroundColor $Yellow
    $respuesta = Read-Host "¿Deseas sobrescribirlo? (s/n)"
    if ($respuesta -ne "s") {
        Write-Host "✅ Manteniendo .env existente" -ForegroundColor $Green
    } else {
        Copy-Item ".env.example" ".env" -Force
        Write-Host "✅ Archivo .env creado desde .env.example" -ForegroundColor $Green
    }
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado desde .env.example" -ForegroundColor $Green
}

# Instalar dependencias
Write-Host ""
Write-Host "📦 Instalando dependencias..." -ForegroundColor $Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor $Green
} else {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor $Red
    exit 1
}

# Instrucciones finales
Write-Host ""
Write-Host "========================================" -ForegroundColor $Cyan
Write-Host "✅ CONFIGURACIÓN COMPLETADA" -ForegroundColor $Green
Write-Host "========================================" -ForegroundColor $Cyan
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor $Yellow
Write-Host ""
Write-Host "1️⃣  Edita el archivo .env con tus datos:" -ForegroundColor $Yellow
Write-Host "   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME" -ForegroundColor $Yellow
Write-Host "   - JWT_SECRET (cualquier texto secreto)" -ForegroundColor $Yellow
Write-Host "   - EMAIL_USER y EMAIL_PASSWORD (opcional)" -ForegroundColor $Yellow
Write-Host ""
Write-Host "2️⃣  Verifica que STRIPE_SIMULATION_MODE=true" -ForegroundColor $Yellow
Write-Host "   (Ya está configurado por defecto)" -ForegroundColor $Yellow
Write-Host ""
Write-Host "3️⃣  Crea la base de datos PostgreSQL:" -ForegroundColor $Yellow
Write-Host "   psql -U postgres -c `"CREATE DATABASE sistema_canchas;`"" -ForegroundColor $Cyan
Write-Host ""
Write-Host "4️⃣  Ejecuta el script de migración:" -ForegroundColor $Yellow
Write-Host "   psql -U postgres -d sistema_canchas -f database_pagos.sql" -ForegroundColor $Cyan
Write-Host ""
Write-Host "5️⃣  Inicia el servidor:" -ForegroundColor $Yellow
Write-Host "   npm start" -ForegroundColor $Cyan
Write-Host ""
Write-Host "🎓 Deberías ver: `"MODO SIMULACIÓN ACTIVADO`"" -ForegroundColor $Green
Write-Host ""
Write-Host "========================================" -ForegroundColor $Cyan
