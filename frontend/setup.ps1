# ==================================================
# Script de Configuración Rápida - Frontend
# Sistema de Gestión de Escenarios Deportivos
# ==================================================

# Colores para output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

Write-Host "========================================" -ForegroundColor $Cyan
Write-Host "🚀 CONFIGURACIÓN AUTOMÁTICA - FRONTEND" -ForegroundColor $Cyan
Write-Host "========================================" -ForegroundColor $Cyan
Write-Host ""

# Verificar si estamos en la carpeta frontend
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la carpeta 'frontend'" -ForegroundColor $Red
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
Write-Host "1️⃣  El archivo .env ya está configurado con:" -ForegroundColor $Yellow
Write-Host "   - VITE_API_URL=http://localhost:5000" -ForegroundColor $Yellow
Write-Host "   - VITE_STRIPE_SIMULATION_MODE=true" -ForegroundColor $Yellow
Write-Host ""
Write-Host "2️⃣  Asegúrate de que el backend esté corriendo" -ForegroundColor $Yellow
Write-Host "   en http://localhost:5000" -ForegroundColor $Yellow
Write-Host ""
Write-Host "3️⃣  Inicia la aplicación:" -ForegroundColor $Yellow
Write-Host "   npm run dev" -ForegroundColor $Cyan
Write-Host ""
Write-Host "4️⃣  Abre tu navegador en:" -ForegroundColor $Yellow
Write-Host "   http://localhost:5173" -ForegroundColor $Cyan
Write-Host ""
Write-Host "🎓 Verás el banner azul `"MODO SIMULACIÓN`" en la página de pago" -ForegroundColor $Green
Write-Host ""
Write-Host "========================================" -ForegroundColor $Cyan
