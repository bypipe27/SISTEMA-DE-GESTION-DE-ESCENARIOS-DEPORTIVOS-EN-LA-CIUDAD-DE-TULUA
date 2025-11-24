# SISTEMA DE GESTIÓN DE ESCENARIOS DEPORTIVOS (Tuluá)
Proyecto para la materia DDS - I

---

## 🚀 ¡IMPORTANTE! Lee Esto Primero

### 📖 **[LEEME_PRIMERO.md](LEEME_PRIMERO.md)** ← Empieza aquí

**Nuevo usuario?** Este archivo te guiará en 5 minutos. Incluye:
- ✅ Qué se implementó
- ✅ Cómo iniciar en 3 pasos
- ✅ Qué esperar en la demo
- ✅ Checklist pre-presentación

---

## 🎓 Pagos con Stripe (MODO SIMULADO para Proyecto Académico)

Este proyecto utiliza un **sistema de pagos completamente simulado** sin conexión real a Stripe.
Perfecto para demostraciones académicas sin costos ni necesidad de cuentas reales.

### ⚡ Inicio Rápido

**Ver:** `INICIO_RAPIDO.md` para configuración en 3 pasos

### 📚 Documentación Completa

| Documento | Descripción | Para quién |
|-----------|-------------|------------|
| **[LEEME_PRIMERO.md](LEEME_PRIMERO.md)** | Introducción rápida | 👨‍🎓 Todos |
| **[INDICE_DOCUMENTACION.md](INDICE_DOCUMENTACION.md)** | Índice general | 👨‍🎓 Todos |
| **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** | Configuración en 3 pasos | 👨‍🎓 Estudiantes |
| **[GUIA_STRIPE_SIMULADO.md](GUIA_STRIPE_SIMULADO.md)** | Guía completa detallada | 👨‍🎓 Estudiantes |
| **[DATOS_DE_PRUEBA.md](DATOS_DE_PRUEBA.md)** | Casos de prueba | 👨‍🎓 Estudiantes |
| **[GUIA_EVALUACION_PROFESOR.md](GUIA_EVALUACION_PROFESOR.md)** | Guía para evaluar | 👨‍🏫 Profesores |

### 🔧 Configuración Básica

Variables de entorno necesarias:

- **Backend** (`backend/.env`):
  ```env
  # Base de datos
  DB_HOST=localhost
  DB_USER=postgres
  DB_PASSWORD=tu_password
  DB_NAME=sistema_canchas
  
  # JWT
  JWT_SECRET=tu_jwt_secret
  
  # Email (opcional)
  EMAIL_USER=tu_email@gmail.com
  EMAIL_PASSWORD=tu_app_password
  
  # ⭐ STRIPE SIMULADO ⭐
  STRIPE_SIMULATION_MODE=true
  # NO necesitas: STRIPE_SECRET_KEY ni STRIPE_WEBHOOK_SECRET
  ```

- **Frontend** (`frontend/.env`):
  ```env
  VITE_API_URL=http://localhost:5000
  
  # ⭐ STRIPE SIMULADO ⭐
  VITE_STRIPE_SIMULATION_MODE=true
  # NO necesitas: VITE_STRIPE_PUBLIC_KEY
  ```

### ✅ Ventajas del Modo Simulación

- ❌ No necesitas cuenta de Stripe
- ❌ No gastas dinero en pruebas
- ❌ No necesitas webhook ni CLI de Stripe
- ✅ Funcionalidad completa para demos
- ✅ Facturas PDF reales
- ✅ Notificaciones por email
- ✅ Ideal para presentaciones académicas

### 🧪 Datos de Prueba

Cuando realices un pago, usa cualquier dato. Ejemplo:
- **Tarjeta:** `4242 4242 4242 4242`
- **Fecha:** `12/25`
- **CVC:** `123`
- **Nombre:** Tu nombre completo

### 📊 Migración de Base de Datos

En tu base de datos PostgreSQL, ejecuta el script:
```bash
psql -U postgres -d sistema_canchas -f backend/database_pagos.sql
```

Esto crea las tablas `pagos` y `facturas` necesarias.

---

## 📖 Documentación Adicional
