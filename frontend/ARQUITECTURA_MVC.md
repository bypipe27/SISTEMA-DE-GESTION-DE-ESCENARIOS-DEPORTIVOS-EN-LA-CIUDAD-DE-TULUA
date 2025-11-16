# Arquitectura MVC - Frontend

## 📁 Estructura Implementada

```
frontend/src/
├── models/              # 📦 MODELO - Datos y validaciones
│   ├── Usuario.js       # ✅ Validaciones de usuario
│   ├── Cancha.js        # ✅ Transformaciones de canchas
│   └── Reserva.js       # ✅ Formateo de reservas
├── services/            # 🔌 SERVICIOS - Acceso a API
│   ├── api.js           # ✅ Cliente HTTP base
│   ├── authService.js   # ✅ Autenticación
│   ├── canchaService.js # ✅ Operaciones de canchas
│   ├── reservaService.js # ✅ Operaciones de reservas
│   ├── passwordService.js # ✅ Recuperación de contraseña
│   └── verificationService.js # ✅ Verificación de código
├── hooks/               # 🎮 CONTROLADOR - Lógica de negocio
│   ├── useAuth.js       # ✅ Autenticación
│   ├── useCanchas.js    # ✅ Gestión de canchas
│   ├── useReservas.js   # ✅ Gestión de reservas
│   ├── usePasswordRecovery.js # ✅ Recuperación de contraseña
│   ├── useVerification.js # ✅ Verificación de código
│   ├── useProviderReservasManager.js # ✅ Gestión de reservas del proveedor
│   ├── useMisReservas.js # ✅ Gestión de reservas del usuario
│   ├── useReservaForm.js # ✅ Formulario de creación de reservas
│   └── useCanchasManager.js # ✅ Gestión CRUD de canchas
├── pages/               # 🖼️ VISTA - Presentación
│   ├── LoginPage.jsx                 # ✅ Refactorizado
│   ├── RegisterPage.jsx              # ✅ Refactorizado
│   ├── RegisterProvider.jsx          # ✅ Refactorizado
│   ├── ForgotPasswordPage.jsx        # ✅ Refactorizado
│   ├── ResetPasswordPage.jsx         # ✅ Refactorizado
│   ├── VerifyCodePage.jsx            # ✅ Refactorizado
│   ├── CanchaDetailsPage.jsx         # ✅ Refactorizado
│   ├── DashboardPage.jsx             # ✅ Refactorizado
│   ├── DashboardProvider.jsx         # ✅ Refactorizado
│   ├── ConfirmacionReservaPage.jsx   # ✅ Refactorizado
│   ├── ProviderReservas.jsx          # ✅ Refactorizado
│   ├── MisReservasPage.jsx           # ✅ Refactorizado
│   ├── ReservaPage.jsx               # ✅ Refactorizado
│   └── CanchasManager.jsx            # ✅ Refactorizado
└── components/          # 🧩 Componentes reutilizables
```

---

## 🏗️ Capas de la Arquitectura

### 1️⃣ **MODELO** (`models/`)

**Responsabilidad:** Definir estructura de datos, validaciones y transformaciones

#### `Usuario.js`

```javascript
// Clase que define la entidad Usuario
export class Usuario {
  // Validaciones estáticas
  static isValidEmail(email) { ... }
  static isValidPassword(password) { ... }
  static validateRegister(data) { ... }
  static validateLogin(data) { ... }
}
```

#### `Cancha.js`

```javascript
export default class Cancha {
  // Constantes
  static DAY_NAMES = { 0: "Domingo", 1: "Lunes", ... }

  // Transformaciones
  static formatTime(t) { ... }           // HH:MM
  static formatPrice(v) { ... }          // $1,000 COP
  static parseHorarios(raw) { ... }      // Normaliza horarios
  static parseCerradosDias(cancha) { ... } // Array de días cerrados
  static parseCerradosFechas(cancha) { ... } // Array de fechas cerradas
}
```

#### `Reserva.js`

```javascript
export default class Reserva {
  static formatearFecha(fechaStr) { ... }  // Fecha en español
  static formatearPrecio(precio) { ... }   // $X,XXX COP
  static formatearNumeroReserva(id) { ... } // #000001
  static generarMensajeCompartir(...) { ... }
  static validarDatosReserva(...) { ... }
}
```

**Ventajas:**

- ✅ Validaciones centralizadas y reutilizables
- ✅ Lógica de datos independiente de la UI
- ✅ Fácil de testear
- ✅ Transformaciones consistentes en toda la app

---

### 2️⃣ **SERVICIOS** (`services/`)

**Responsabilidad:** Comunicación con la API backend

#### `api.js` - Cliente HTTP base

```javascript
export async function get(endpoint) { ... }
export async function post(endpoint, body) { ... }
export async function put(endpoint, body) { ... }
export async function del(endpoint) { ... }
```

#### `authService.js` - Servicios de autenticación

```javascript
export async function login(email, password) { ... }
export async function register(userData) { ... }
export async function registerProvider(providerData) { ... }
export function logout() { ... }
export function getCurrentUser() { ... }
```

#### `canchaService.js` - Servicios de canchas

```javascript
export async function getAllCanchas() { ... }
export async function getCanchaById(id) { ... }
export function isCanchaAvailable(cancha, fechaIso) { ... }
export function filterCanchasByOwner(canchas, propietarioId) { ... }
```

#### `reservaService.js` - Servicios de reservas

```javascript
export async function getProviderReservas() { ... }
export async function getProviderProximasReservas() { ... }
export async function getProviderReportes(year, month) { ... }
export function normalizeReserva(reserva) { ... }
```

#### `passwordService.js` - Recuperación de contraseña

```javascript
export async function forgotPassword(email) { ... }
export async function verifyResetToken(token, email) { ... }
export async function resetPassword(token, email, nuevaContrasena) { ... }
```

#### `verificationService.js` - Verificación de código

```javascript
export async function verifyUsuario(email, codigo) { ... }
export async function verifyCancha(correo, codigo) { ... }
export async function resendCodeUsuario(email) { ... }
export async function resendCodeCancha(correo) { ... }
```

**Ventajas:**

- ✅ Elimina código duplicado (antes fetch repetido en cada página)
- ✅ Manejo centralizado de headers y tokens
- ✅ Fácil modificar URLs o agregar interceptores
- ✅ Normalización de datos en un solo lugar

---

### 3️⃣ **CONTROLADOR** (`hooks/`)

**Responsabilidad:** Lógica de negocio y coordinación entre servicios y vistas

#### `useAuth.js` - Autenticación

```javascript
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (email, password) => {
    // 1. Validar con el Modelo
    const validation = Usuario.validateLogin({ email, password });

    // 2. Llamar al Servicio
    const data = await authService.login(email, password);

    // 3. Navegar según resultado
    navigate(
      data.usuario.role === "provider" ? "/dashboard-provider" : "/dashboard"
    );
  };

  return {
    loading,
    error,
    handleLogin,
    handleRegister,
    handleRegisterProvider,
  };
}
```

#### `useCanchas.js` - Gestión de canchas

```javascript
export function useCanchas(filters = {}) {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros integrados: searchTerm, tipo, soloDisponibles, fecha, propietarioId
  const canchasFiltradas = useMemo(() => {
    // Lógica de filtrado
  }, [allCanchas, filters]);

  return { canchas: canchasFiltradas, loading, error, tipos, refetch };
}

export function useCancha(id) {
  // Hook para una sola cancha
}
```

#### `useReservas.js` - Gestión de reservas

```javascript
export function useProviderReservas() {
  // Todas las reservas del proveedor con normalización
}

export function useProviderProximasReservas() {
  // Solo las próximas reservas
}

export function useProviderReportes(year, month) {
  // Estadísticas para dashboard
}
```

#### `useProviderReservasManager.js` - Gestión completa de reservas del proveedor

```javascript
export function useProviderReservasManager() {
  // Estado: reservas, filters, loading, openMenu
  // Funciones: getCancelInfo, getCompleteInfo
  // Acciones: cancelarReserva, completarReserva, marcarNoShow
  // Filtrado: por término, estado, rango de fechas
  // Retorna: reservas filtradas y funciones de gestión
}
```

#### `useMisReservas.js` - Gestión de reservas del usuario

```javascript
export function useMisReservas() {
  // Estado: reservas, loading, searchTerm, filterStatus, usuario
  // Funciones: getEstadoReserva, canCancelReserva
  // Acciones: cargarReservas, handleCancelarReserva
  // Filtrado: por estado (todas, próximas, programadas, completadas, canceladas)
  // Estadísticas: total, próximas, programadas, completadas, canceladas
  // Retorna: reservas filtradas, funciones de gestión y estadísticas
}
```

#### `useReservaForm.js` - Formulario de creación de reservas

```javascript
export function useReservaForm(canchaId) {
  // Estado: cancha, loading, date, slots, selectedSlot, clienteNombre, clienteTelefono
  // Carga inicial: cancha desde state o API, fecha desde location.state
  // Disponibilidad: fetchSlots para obtener horarios libres
  // Funciones: handleDateChange, handleSlotChange, handleSubmit
  // Navegación: redirige a confirmación después de crear reserva
  // Retorna: todo el estado y funciones para el formulario de reserva
}
```

#### `useCanchasManager.js` - Gestión CRUD completa de canchas

```javascript
export function useCanchasManager() {
  // Estado: canchas, loading, error, openForm, editing, form, fechaToAdd, openDayPanels
  // Constantes: DAY_NAMES, HOUR_OPTIONS, ALLOWED_TIPOS, ALLOWED_CAPACIDADES, PRICE_OPTIONS
  // Validaciones: validatePrice, validateIframe, alignHour, normalizeHorarios
  // Horarios: togglePanel, toggleClosedDay, addInterval, removeInterval, updateInterval
  // Fechas cerradas: addFecha, removeFecha
  // CRUD: fetchCanchas, abrirNuevo, abrirEdicion, guardar, eliminar
  // Retorna: todo el estado y funciones necesarias para el manager completo
}
```

#### `usePasswordRecovery.js` - Recuperación de contraseña

```javascript
export function useForgotPassword() {
  // Estado y lógica para solicitar enlace de recuperación
}

export function useResetPassword(token, email) {
  // Estado y lógica para restablecer contraseña
  // Incluye verificación de token
}
```

#### `useVerification.js` - Verificación de código

```javascript
export function useVerification(email, tipo, resendSeconds) {
  // Estado y lógica para verificar código de 6 dígitos
  // Temporizador para reenvío
  // Soporte para usuarios y propietarios de canchas
}
```

**Ventajas:**

- ✅ Lógica reutilizable en múltiples componentes
- ✅ Separa la lógica de la presentación
- ✅ Estado compartido y manejado centralmente
- ✅ Filtros y transformaciones encapsulados

---

### 4️⃣ **VISTA** (`pages/`)

**Responsabilidad:** SOLO presentación y experiencia de usuario

#### Ejemplo: LoginPage

```javascript
function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { loading, error, handleLogin, clearError } = useAuth(); // 🎮 Hook (Controlador)

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(form.email, form.password); // ✅ Lógica delegada al hook
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button disabled={loading}>Iniciar Sesión</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

**Características de la Vista:**

- ✅ Solo maneja presentación y eventos de UI
- ✅ No contiene lógica de negocio
- ✅ No hace llamadas directas a la API
- ✅ Delega toda la lógica a los hooks
- ✅ Fácil de testear y mantener

---

## 🔄 Flujo de Datos Completo

```
┌──────────────┐
│  USUARIO     │
│  interactúa  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  VISTA (LoginPage)       │  ← Solo presenta UI y captura eventos
│  - Formulario            │
│  - Botones               │
└──────────┬───────────────┘
           │ onClick/onSubmit
           ▼
┌──────────────────────────┐
│  CONTROLADOR (useAuth)   │  ← Coordina la lógica
│  - handleLogin()         │
│  - Valida con Modelo     │
│  - Llama Servicio        │
│  - Maneja estado         │
└──────────┬───────────────┘
           │
           ├─► MODELO (Usuario)  ← Valida datos
           │   - validateLogin()
           │
           └─► SERVICIO (authService) ← Llama API
               - login()
                 │
                 ▼
            ┌─────────────┐
            │   BACKEND   │
            └─────────────┘
```

### Ejemplo Práctico: Login de Usuario

**1. Usuario escribe credenciales y hace click en "Iniciar Sesión"**

```javascript
// pages/LoginPage.jsx
function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { loading, error, handleLogin } = useAuth(); // ← Hook del Controlador

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(form.email, form.password); // ← Delega al Controlador
  };

  return (
    <form onSubmit={onSubmit}>
      <input value={form.email} onChange={...} />
      <input value={form.password} onChange={...} />
      <button disabled={loading}>Iniciar Sesión</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

**2. Hook (Controlador) valida con el Modelo y llama al Servicio**

```javascript
// hooks/useAuth.js
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError("");

    // PASO 1: Validar con el Modelo
    const validation = Usuario.validateLogin({ email, password });
    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      setLoading(false);
      return;
    }

    try {
      // PASO 2: Llamar al Servicio (API)
      const data = await authService.login(email, password);

      // PASO 3: Navegar según rol
      if (data.usuario.role === "provider") {
        navigate("/dashboard-provider");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleLogin };
}
```

**3. Modelo valida los datos**

```javascript
// models/Usuario.js
export class Usuario {
  static validateLogin(data) {
    const errors = [];

    if (!data.email) {
      errors.push("El email es requerido");
    } else if (!this.isValidEmail(data.email)) {
      errors.push("El email no es válido");
    }

    if (!data.password) {
      errors.push("La contraseña es requerida");
    } else if (data.password.length < 6) {
      errors.push("La contraseña debe tener al menos 6 caracteres");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

**4. Servicio hace la petición HTTP al Backend**

```javascript
// services/authService.js
import { post } from "./api";

export async function login(email, password) {
  const data = await post("/api/usuarios/login", {
    email,
    contrasena: password,
  });

  // Guardar token y usuario en localStorage
  if (data.token && data.usuario) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
  }

  return data;
}
```

**5. Cliente HTTP base (api.js) envía la petición**

```javascript
// services/api.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function post(endpoint, body) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error en la petición");
  }

  return await response.json();
}
```

**6. Backend procesa y responde**

```javascript
// backend/routes/usuarios.js
router.post("/login", iniciarSesion);

// backend/controllers/usuariosController.js
async function iniciarSesion(req, res) {
  const { email, contrasena } = req.body;
  // ... validar credenciales
  // ... generar JWT token
  res.json({ token, usuario });
}
```

---

## 📖 Guía Detallada: Cómo Agregar Nuevas Funcionalidades

### 🎯 Escenario 1: Agregar Sistema de Comentarios/Reseñas

**Objetivo:** Permitir que usuarios dejen reseñas en canchas

#### **PASO 1: Crear el Modelo** (`models/Resena.js`)

```javascript
/**
 * Modelo de Reseña
 * Define estructura, validaciones y transformaciones
 */
export default class Resena {
  /**
   * Valida datos de una nueva reseña
   * @param {object} data - { canchaId, usuarioId, calificacion, comentario }
   * @returns {object} { isValid, errors }
   */
  static validarResena(data) {
    const errors = [];

    if (!data.canchaId) {
      errors.push("La cancha es requerida");
    }

    if (!data.usuarioId) {
      errors.push("El usuario es requerido");
    }

    if (!data.calificacion || data.calificacion < 1 || data.calificacion > 5) {
      errors.push("La calificación debe estar entre 1 y 5 estrellas");
    }

    if (!data.comentario || data.comentario.trim().length < 10) {
      errors.push("El comentario debe tener al menos 10 caracteres");
    }

    if (data.comentario && data.comentario.length > 500) {
      errors.push("El comentario no puede exceder 500 caracteres");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Formatea fecha de reseña
   * @param {string} fecha - ISO string
   * @returns {string} - "Hace 2 días"
   */
  static formatearFechaRelativa(fecha) {
    const ahora = new Date();
    const fechaResena = new Date(fecha);
    const diffMs = ahora - fechaResena;
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return "Hoy";
    if (diffDias === 1) return "Hace 1 día";
    if (diffDias < 7) return `Hace ${diffDias} días`;
    if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
    return fechaResena.toLocaleDateString("es-CO");
  }

  /**
   * Calcula promedio de calificaciones
   * @param {Array} resenas - Array de reseñas
   * @returns {number} - Promedio redondeado a 1 decimal
   */
  static calcularPromedioCalificacion(resenas) {
    if (!Array.isArray(resenas) || resenas.length === 0) return 0;

    const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0);
    return Math.round((suma / resenas.length) * 10) / 10;
  }

  /**
   * Genera objeto de estadísticas de reseñas
   * @param {Array} resenas
   * @returns {object} { total, promedio, distribucion: { 5: 10, 4: 5, ... } }
   */
  static generarEstadisticas(resenas) {
    const distribucion = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    resenas.forEach((r) => {
      distribucion[r.calificacion]++;
    });

    return {
      total: resenas.length,
      promedio: this.calcularPromedioCalificacion(resenas),
      distribucion,
    };
  }
}
```

#### **PASO 2: Crear el Servicio** (`services/resenaService.js`)

```javascript
/**
 * Servicio de Reseñas
 * Maneja todas las operaciones HTTP relacionadas con reseñas
 */
import { get, post, put, del } from "./api";

/**
 * Obtiene todas las reseñas de una cancha
 * @param {number} canchaId
 * @returns {Promise<Array>}
 */
export async function getResenasByCancha(canchaId) {
  return await get(`/api/resenas/cancha/${canchaId}`);
}

/**
 * Obtiene reseñas de un usuario
 * @param {number} usuarioId
 * @returns {Promise<Array>}
 */
export async function getResenasByUsuario(usuarioId) {
  return await get(`/api/resenas/usuario/${usuarioId}`);
}

/**
 * Crea una nueva reseña
 * @param {object} resenaData - { canchaId, usuarioId, calificacion, comentario }
 * @returns {Promise<object>}
 */
export async function createResena(resenaData) {
  return await post("/api/resenas", resenaData);
}

/**
 * Actualiza una reseña existente
 * @param {number} id
 * @param {object} updates - { calificacion?, comentario? }
 * @returns {Promise<object>}
 */
export async function updateResena(id, updates) {
  return await put(`/api/resenas/${id}`, updates);
}

/**
 * Elimina una reseña
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function deleteResena(id) {
  return await del(`/api/resenas/${id}`);
}

/**
 * Verifica si el usuario ya reseñó una cancha
 * @param {number} canchaId
 * @param {number} usuarioId
 * @returns {Promise<boolean>}
 */
export async function hasUserReviewed(canchaId, usuarioId) {
  try {
    const resena = await get(
      `/api/resenas/verificar?canchaId=${canchaId}&usuarioId=${usuarioId}`
    );
    return !!resena;
  } catch {
    return false;
  }
}
```

#### **PASO 3: Crear el Hook (Controlador)** (`hooks/useResenas.js`)

```javascript
/**
 * Hook personalizado para gestión de reseñas
 * Centraliza la lógica de negocio
 */
import { useState, useEffect } from "react";
import * as resenaService from "../services/resenaService";
import Resena from "../models/Resena";

/**
 * Hook para obtener y gestionar reseñas de una cancha
 * @param {number} canchaId
 * @returns {object}
 */
export function useResenasCancha(canchaId) {
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  const cargarResenas = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await resenaService.getResenasByCancha(canchaId);
      setResenas(data);

      // Calcular estadísticas con el Modelo
      const stats = Resena.generarEstadisticas(data);
      setEstadisticas(stats);
    } catch (err) {
      setError(err.message || "Error al cargar reseñas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canchaId) {
      cargarResenas();
    }
  }, [canchaId]);

  return {
    resenas,
    loading,
    error,
    estadisticas,
    refetch: cargarResenas,
  };
}

/**
 * Hook para crear/editar reseñas
 * @returns {object}
 */
export function useResenaForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const crearResena = async (resenaData) => {
    setLoading(true);
    setError(null);

    // PASO 1: Validar con el Modelo
    const validation = Resena.validarResena(resenaData);
    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      setLoading(false);
      return null;
    }

    try {
      // PASO 2: Llamar al Servicio
      const nuevaResena = await resenaService.createResena(resenaData);
      return nuevaResena;
    } catch (err) {
      setError(err.message || "Error al crear reseña");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const actualizarResena = async (id, updates) => {
    setLoading(true);
    setError(null);

    try {
      const resenaActualizada = await resenaService.updateResena(id, updates);
      return resenaActualizada;
    } catch (err) {
      setError(err.message || "Error al actualizar reseña");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const eliminarResena = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await resenaService.deleteResena(id);
      return true;
    } catch (err) {
      setError(err.message || "Error al eliminar reseña");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    crearResena,
    actualizarResena,
    eliminarResena,
  };
}
```

#### **PASO 4: Crear la Vista** (`pages/ResenasPage.jsx`)

```javascript
/**
 * Vista de Reseñas
 * SOLO presenta UI y maneja eventos
 */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useResenasCancha, useResenaForm } from "../hooks/useResenas";
import { getCurrentUser } from "../services/authService";
import Resena from "../models/Resena";

function ResenasPage() {
  const { canchaId } = useParams();
  const usuario = getCurrentUser();

  // Hook 1: Obtener reseñas existentes
  const { resenas, loading, estadisticas, refetch } =
    useResenasCancha(canchaId);

  // Hook 2: Formulario de nueva reseña
  const {
    loading: submitting,
    error: submitError,
    crearResena,
  } = useResenaForm();

  // Estado local del formulario
  const [form, setForm] = useState({
    calificacion: 5,
    comentario: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resenaData = {
      canchaId: Number(canchaId),
      usuarioId: usuario.id,
      calificacion: form.calificacion,
      comentario: form.comentario,
    };

    // Delegar al Hook (Controlador)
    const nuevaResena = await crearResena(resenaData);

    if (nuevaResena) {
      // Resetear formulario y recargar
      setForm({ calificacion: 5, comentario: "" });
      refetch();
    }
  };

  if (loading) return <div>Cargando reseñas...</div>;

  return (
    <div className="resenas-page">
      {/* Estadísticas */}
      {estadisticas && (
        <div className="estadisticas">
          <h2>{estadisticas.promedio} ⭐</h2>
          <p>{estadisticas.total} reseñas</p>

          {/* Distribución de estrellas */}
          <div className="distribucion">
            {[5, 4, 3, 2, 1].map((estrella) => (
              <div key={estrella}>
                {estrella}⭐ - {estadisticas.distribucion[estrella]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario de nueva reseña */}
      <form onSubmit={handleSubmit} className="form-resena">
        <h3>Deja tu reseña</h3>

        <div>
          <label>Calificación:</label>
          <select
            value={form.calificacion}
            onChange={(e) =>
              setForm({ ...form, calificacion: Number(e.target.value) })
            }
          >
            <option value={5}>⭐⭐⭐⭐⭐ Excelente</option>
            <option value={4}>⭐⭐⭐⭐ Muy bueno</option>
            <option value={3}>⭐⭐⭐ Bueno</option>
            <option value={2}>⭐⭐ Regular</option>
            <option value={1}>⭐ Malo</option>
          </select>
        </div>

        <div>
          <label>Comentario:</label>
          <textarea
            value={form.comentario}
            onChange={(e) => setForm({ ...form, comentario: e.target.value })}
            placeholder="Comparte tu experiencia..."
            maxLength={500}
          />
          <small>{form.comentario.length}/500 caracteres</small>
        </div>

        {submitError && <p className="error">{submitError}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Enviando..." : "Publicar Reseña"}
        </button>
      </form>

      {/* Lista de reseñas */}
      <div className="lista-resenas">
        <h3>Reseñas de usuarios</h3>

        {resenas.length === 0 ? (
          <p>No hay reseñas aún. ¡Sé el primero!</p>
        ) : (
          resenas.map((resena) => (
            <div key={resena.id} className="resena-card">
              <div className="resena-header">
                <strong>{resena.usuario_nombre}</strong>
                <span>{"⭐".repeat(resena.calificacion)}</span>
                <small>
                  {Resena.formatearFechaRelativa(resena.fecha_creacion)}
                </small>
              </div>
              <p>{resena.comentario}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ResenasPage;
```

#### **PASO 5: Integrar en la Aplicación**

```javascript
// App.jsx - Agregar ruta
import ResenasPage from "./pages/ResenasPage";

<Route path="/cancha/:canchaId/resenas" element={<ResenasPage />} />;

// CanchaDetailsPage.jsx - Agregar enlace
import { Link } from "react-router-dom";

<Link to={`/cancha/${cancha.id}/resenas`}>
  Ver Reseñas ({cancha.total_resenas})
</Link>;
```

#### **PASO 6: Backend (API)**

```javascript
// backend/routes/resenas.js
const express = require("express");
const router = express.Router();
const {
  getResenasByCancha,
  getResenasByUsuario,
  createResena,
  updateResena,
  deleteResena,
  verificarResena,
} = require("../controllers/resenasController");
const { auth } = require("../middleware/auth");

router.get("/cancha/:canchaId", getResenasByCancha);
router.get("/usuario/:usuarioId", auth, getResenasByUsuario);
router.get("/verificar", auth, verificarResena);
router.post("/", auth, createResena);
router.put("/:id", auth, updateResena);
router.delete("/:id", auth, deleteResena);

module.exports = router;

// backend/server.js - Registrar rutas
const resenasRoutes = require("./routes/resenas");
app.use("/api/resenas", resenasRoutes);
```

---

## 🎯 Escenario 2: Agregar Filtros Avanzados en Dashboard

**Objetivo:** Filtrar canchas por precio, ubicación y disponibilidad

#### **PASO 1: Extender el Modelo** (`models/Cancha.js`)

```javascript
// Agregar método de filtrado
export default class Cancha {
  // ... código existente ...

  /**
   * Filtra canchas por múltiples criterios
   * @param {Array} canchas
   * @param {object} filtros - { precioMin, precioMax, ubicacion, disponible }
   * @returns {Array}
   */
  static filtrarCanchas(canchas, filtros) {
    return canchas.filter((cancha) => {
      // Filtro de precio
      if (filtros.precioMin && cancha.precio < filtros.precioMin) {
        return false;
      }
      if (filtros.precioMax && cancha.precio > filtros.precioMax) {
        return false;
      }

      // Filtro de ubicación
      if (
        filtros.ubicacion &&
        !cancha.direccion
          .toLowerCase()
          .includes(filtros.ubicacion.toLowerCase())
      ) {
        return false;
      }

      // Filtro de disponibilidad
      if (
        filtros.disponible &&
        filtros.fecha &&
        !this.isCanchaAvailable(cancha, filtros.fecha)
      ) {
        return false;
      }

      return true;
    });
  }
}
```

#### **PASO 2: Actualizar el Hook** (`hooks/useCanchas.js`)

```javascript
// Agregar nuevos filtros al hook existente
export function useCanchas(filters = {}) {
  const [allCanchas, setAllCanchas] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... código existente ...

  const canchasFiltradas = useMemo(() => {
    let resultado = [...allCanchas];

    // Aplicar filtros existentes (searchTerm, tipo, etc.)
    // ...

    // NUEVO: Aplicar filtros avanzados con el Modelo
    resultado = Cancha.filtrarCanchas(resultado, {
      precioMin: filters.precioMin,
      precioMax: filters.precioMax,
      ubicacion: filters.ubicacion,
      disponible: filters.soloDisponibles,
      fecha: filters.fecha,
    });

    return resultado;
  }, [allCanchas, filters]);

  return { canchas: canchasFiltradas, loading, error, refetch };
}
```

#### **PASO 3: Actualizar la Vista** (`pages/DashboardPage.jsx`)

```javascript
// Agregar controles de filtros avanzados
function DashboardPage() {
  const [filtros, setFiltros] = useState({
    searchTerm: "",
    tipo: "",
    precioMin: null,
    precioMax: null,
    ubicacion: "",
    soloDisponibles: false,
    fecha: null,
  });

  const { canchas, loading } = useCanchas(filtros);

  return (
    <div>
      <div className="filtros-avanzados">
        {/* Filtro de precio */}
        <div>
          <label>Precio mínimo:</label>
          <input
            type="number"
            value={filtros.precioMin || ""}
            onChange={(e) =>
              setFiltros({ ...filtros, precioMin: Number(e.target.value) })
            }
            placeholder="50,000"
          />
        </div>

        <div>
          <label>Precio máximo:</label>
          <input
            type="number"
            value={filtros.precioMax || ""}
            onChange={(e) =>
              setFiltros({ ...filtros, precioMax: Number(e.target.value) })
            }
            placeholder="100,000"
          />
        </div>

        {/* Filtro de ubicación */}
        <div>
          <label>Ubicación:</label>
          <input
            type="text"
            value={filtros.ubicacion}
            onChange={(e) =>
              setFiltros({ ...filtros, ubicacion: e.target.value })
            }
            placeholder="Ej: Centro, Norte..."
          />
        </div>
      </div>

      {/* Mostrar canchas filtradas */}
      {canchas.map((cancha) => (
        <div key={cancha.id}>{/* ... */}</div>
      ))}
    </div>
  );
}
```

---

## 📋 Checklist para Nuevas Funcionalidades

Usa esta lista cada vez que agregues algo nuevo:

### ✅ Planificación

- [ ] Definir claramente qué funcionalidad necesitas
- [ ] Identificar si necesitas Modelo, Servicio, Hook o solo Vista
- [ ] Verificar si algo ya existe que puedas reutilizar

### ✅ Implementación

**Si necesitas datos o validaciones:**

- [ ] Crear/actualizar Modelo (`models/`)
- [ ] Agregar validaciones estáticas
- [ ] Agregar transformaciones/formateo

**Si necesitas comunicarte con el backend:**

- [ ] Crear/actualizar Servicio (`services/`)
- [ ] Definir funciones async para cada endpoint
- [ ] Reutilizar cliente HTTP base (`api.js`)

**Si necesitas lógica de negocio:**

- [ ] Crear/actualizar Hook (`hooks/`)
- [ ] Validar con el Modelo
- [ ] Llamar al Servicio
- [ ] Manejar loading/error/success

**Si necesitas interfaz:**

- [ ] Crear/actualizar Vista (`pages/`)
- [ ] Usar el Hook
- [ ] SOLO presentación, sin lógica

### ✅ Testing

- [ ] Verificar errores con `get_errors`
- [ ] Probar en navegador
- [ ] Verificar que no rompiste funcionalidad existente

### ✅ Documentación

- [ ] Actualizar `ARQUITECTURA_MVC.md`
- [ ] Agregar comentarios JSDoc
- [ ] Documentar nuevos endpoints si aplica

---

## 🎯 Páginas Pendientes de Refactorización

Las siguientes páginas aún no implementan el patrón MVC y podrían beneficiarse de la refactorización:

1. **CanchasManager.jsx** - Crear `useCanchasManager.js` + métodos CRUD en `canchaService.js`
2. **MisReservasPage.jsx** - Reutilizar `useReservas.js`
3. **ReservaPage.jsx** - Crear `useReserva.js` para flujo de reserva

---

## 📚 Guía de Uso Rápida

### Para usar servicios

```javascript
import * as canchaService from "../services/canchaService";

const canchas = await canchaService.getAllCanchas();
const cancha = await canchaService.getCanchaById(5);
```

### Para usar modelos

```javascript
import Cancha from "../models/Cancha";

const precio = Cancha.formatPrice(50000); // "$50,000 COP"
const hora = Cancha.formatTime("14:30"); // "14:30"
```

### Para usar hooks

```javascript
import { useCanchas } from "../hooks/useCanchas";

function MiComponente() {
  const { canchas, loading, error, refetch } = useCanchas({
    searchTerm: "futbol",
    tipo: "futbol",
    soloDisponibles: true,
    fecha: "2025-12-01"
  });

  if (loading) return <div>Cargando...</div>;
  return <div>{canchas.map(...)}</div>;
}
```

---

## 🔗 Conexión Frontend-Backend

### ¿Los cambios MVC afectan al backend?

**NO.** El patrón MVC en el frontend es una reorganización interna que NO modifica:

- ✅ Rutas de API (`/api/usuarios/login`, `/api/canchas`, etc.)
- ✅ Headers HTTP (Authorization, Content-Type)
- ✅ Formato de request/response
- ✅ Autenticación con JWT
- ✅ Contratos de datos

### Backend ya implementa MVC

El backend ya sigue el patrón MVC correctamente:

```
backend/
├── models/           # Modelos de base de datos
├── controllers/      # Lógica de negocio
├── services/         # Servicios reutilizables
└── routes/           # Definición de endpoints
```

Ahora **frontend y backend** comparten la misma arquitectura, facilitando:

- ✅ Onboarding de nuevos desarrolladores
- ✅ Mantenimiento consistente
- ✅ Escalabilidad del proyecto

### Mapeo Frontend-Backend Verificado

#### **1. Autenticación (authService.js ↔ usuarios.js)**

| Frontend Service                      | Backend Route                     | Método | Auth |
| ------------------------------------- | --------------------------------- | ------ | ---- |
| `authService.login()`                 | `/api/usuarios/login`             | POST   | ❌   |
| `authService.register()`              | `/api/usuarios/register`          | POST   | ❌   |
| `authService.registerProvider()`      | `/api/usuarios/register-provider` | POST   | ❌   |
| `verificationService.verifyUsuario()` | `/api/usuarios/verify`            | POST   | ❌   |
| `verificationService.resendCode()`    | `/api/usuarios/resend-code`       | POST   | ❌   |

**Flujo de autenticación:**

1. Usuario envía credenciales → `authService.login()`
2. Servicio llama → `POST /api/usuarios/login`
3. Backend responde con `{ token, usuario }`
4. Token guardado en `localStorage`
5. `api.js` inyecta automáticamente en headers: `Authorization: Bearer ${token}`

#### **2. Reservas (reservaService.js ↔ reservas.js)**

| Frontend Service                               | Backend Route                           | Método | Auth |
| ---------------------------------------------- | --------------------------------------- | ------ | ---- |
| `reservaService.getProviderReservas()`         | `/api/reservas/provider`                | GET    | ✅   |
| `reservaService.getProviderProximasReservas()` | `/api/reservas/provider/proximas`       | GET    | ✅   |
| `reservaService.getProviderReportes()`         | `/api/reservas/provider/reportes`       | GET    | ✅   |
| `reservaService.cancelarReserva()`             | `/api/reservas/provider/cancelar/:id`   | PUT    | ✅   |
| `reservaService.completarReserva()`            | `/api/reservas/provider/completar/:id`  | PUT    | ✅   |
| `reservaService.marcarNoShow()`                | `/api/reservas/provider/no-show/:id`    | PUT    | ✅   |
| `useReservas.getReservasByUsuario()`           | `/api/reservas/usuario/:id`             | GET    | ❌   |
| `useReservas.createReserva()`                  | `/api/reservas`                         | POST   | ❌   |
| `useReservas.getAvailability()`                | `/api/reservas/cancha/:id/availability` | GET    | ❌   |
| `useMisReservas.handleCancelarReserva()`       | `/api/reservas/cancelar/:id`            | PUT    | ❌   |

**Nota:** Las rutas `/provider/*` requieren autenticación (`auth` middleware en backend)

#### **3. Canchas (canchaService.js ↔ canchas.js)**

| Frontend Service                     | Backend Route               | Método | Auth |
| ------------------------------------ | --------------------------- | ------ | ---- |
| `canchaService.getAllCanchas()`      | `/api/canchas`              | GET    | ❌   |
| `canchaService.getCanchaById()`      | `/api/canchas/:id`          | GET    | ❌   |
| `canchaService.getProviderCanchas()` | `/api/canchas/provider`     | GET    | ✅   |
| `useCanchasManager.guardar()`        | `/api/canchas/provider`     | POST   | ✅   |
| `useCanchasManager.guardar()`        | `/api/canchas/provider/:id` | PUT    | ✅   |
| `useCanchasManager.eliminar()`       | `/api/canchas/provider/:id` | DELETE | ✅   |

#### **4. Password Recovery (passwordService.js ↔ password.js)**

| Frontend Service                     | Backend Route                      | Método | Auth |
| ------------------------------------ | ---------------------------------- | ------ | ---- |
| `passwordService.forgotPassword()`   | `/api/password/forgot-password`    | POST   | ❌   |
| `passwordService.verifyResetToken()` | `/api/password/verify-reset-token` | POST   | ❌   |
| `passwordService.resetPassword()`    | `/api/password/reset-password`     | POST   | ❌   |

### Autenticación y Middleware

**Frontend (`api.js`):**

```javascript
export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // ... manejo de respuesta
}
```

**Backend (`middleware/auth.js`):**

```javascript
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
}

module.exports = { auth };
```

**Flujo completo:**

1. Usuario autenticado → Token en `localStorage`
2. `api.js` detecta token → Agrega header `Authorization: Bearer ${token}`
3. Backend recibe petición → `auth` middleware verifica JWT
4. Si válido → `req.usuario` contiene datos del usuario → continúa al controlador
5. Si inválido → 401 Unauthorized

### ✅ Verificación de Integridad

**Total de endpoints mapeados:** 24  
**Correctamente conectados:** 24/24 (100%)

**Estado:**

- ✅ Todas las rutas frontend apuntan a endpoints backend correctos
- ✅ Métodos HTTP coinciden (GET, POST, PUT, DELETE)
- ✅ Autenticación configurada correctamente
- ✅ Headers `Authorization` y `Content-Type` automáticos
- ✅ Formato de datos compatible (JSON)
- ✅ Manejo de errores centralizado

**Conclusión:** La refactorización MVC **no rompió ninguna integración**. El sistema mantiene 100% de compatibilidad con el backend existente.

---

## 🎓 Principios Aplicados

### 1. **Separación de Responsabilidades (SoC - Separation of Concerns)**

Cada capa tiene una responsabilidad única y claramente definida:

**Problema sin MVC:**

```javascript
// ❌ TODO mezclado en un solo componente
function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    // Validación mezclada con UI
    if (!email.includes("@")) {
      alert("Email inválido");
      return;
    }

    // Lógica de API mezclada
    const res = await fetch("/api/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Manejo de respuesta mezclado
    const data = await res.json();
    localStorage.setItem("token", data.token);

    // Navegación mezclada
    navigate("/dashboard");
  };

  return <form>...</form>;
}
```

**Solución con MVC:**

```javascript
// ✅ Responsabilidades separadas

// MODELO: Solo validaciones
class Usuario {
  static validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// SERVICIO: Solo comunicación HTTP
async function login(email, password) {
  return await post("/api/usuarios/login", { email, password });
}

// CONTROLADOR: Orquesta lógica
function useAuth() {
  const handleLogin = async (email, password) => {
    if (!Usuario.validateEmail(email)) {
      setError("Email inválido");
      return;
    }
    const data = await authService.login(email, password);
    navigate("/dashboard");
  };
  return { handleLogin };
}

// VISTA: Solo presentación
function LoginPage() {
  const { handleLogin } = useAuth();
  return <form onSubmit={handleLogin}>...</form>;
}
```

### 2. **DRY (Don't Repeat Yourself)**

Elimina duplicación de código mediante reutilización:

**Antes:**

```javascript
// ❌ Código duplicado en 10+ archivos
// LoginPage.jsx
const res = await fetch("/api/usuarios/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

// RegisterPage.jsx
const res = await fetch("/api/usuarios/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

// ... repetido en 8 páginas más
```

**Después:**

```javascript
// ✅ Una sola implementación
// services/api.js
export async function post(endpoint, body) {
  return await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Reutilizado en todos lados
await post("/api/usuarios/login", data);
await post("/api/usuarios/register", data);
```

### 3. **Single Responsibility Principle (SRP)**

Cada función/clase tiene una sola razón para cambiar:

```javascript
// ✅ Cada función tiene UNA responsabilidad

// Solo formatea precios
static formatPrice(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
  }).format(value);
}

// Solo valida emails
static isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Solo calcula promedio
static calcularPromedioCalificacion(resenas) {
  const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0);
  return Math.round((suma / resenas.length) * 10) / 10;
}
```

### 4. **Composición sobre Herencia**

Los hooks componen funcionalidad en lugar de heredar:

```javascript
// ✅ Composición con hooks
function MisReservasPage() {
  // Componer múltiples hooks
  const { reservas, loading } = useMisReservas();
  const { canCancelReserva, handleCancelarReserva } = useReservaActions();
  const { usuario } = useAuth();

  // Cada hook es independiente y reutilizable
  return <div>...</div>;
}
```

### 5. **Inversión de Dependencias (DIP)**

Los componentes dependen de abstracciones (hooks), no de implementaciones concretas:

```javascript
// ✅ Vista depende de la abstracción (hook)
function LoginPage() {
  const { handleLogin } = useAuth(); // Abstracción
  // La vista NO sabe cómo se implementa handleLogin
  return <button onClick={handleLogin}>Login</button>;
}

// La implementación puede cambiar sin afectar la vista
function useAuth() {
  const handleLogin = async (email, password) => {
    // Puede cambiar a OAuth, Firebase, etc.
    // sin modificar LoginPage.jsx
    await authService.login(email, password);
  };
  return { handleLogin };
}
```

### 6. **Open/Closed Principle**

Abierto para extensión, cerrado para modificación:

```javascript
// ✅ Extender sin modificar código existente

// Base existente
export function useCanchas(filters = {}) {
  const [canchas, setCanchas] = useState([]);
  // ... lógica base
  return { canchas, loading };
}

// Extender con nueva funcionalidad SIN modificar el hook original
export function useCanchasConFavoritos() {
  const { canchas, loading } = useCanchas(); // Reutiliza base
  const [favoritos, setFavoritos] = useState([]);

  // Nueva funcionalidad
  const toggleFavorito = (id) => {
    // ...
  };

  return { canchas, loading, favoritos, toggleFavorito };
}
```

### 7. **Principio de Menor Conocimiento (Law of Demeter)**

Los componentes solo conocen lo que necesitan:

```javascript
// ✅ La vista solo conoce la interfaz del hook
function DashboardPage() {
  const { canchas, loading } = useCanchas();
  // NO sabe cómo se obtienen las canchas
  // NO sabe qué servicio se usa
  // NO sabe si hay caché o no
}

// El hook encapsula toda la complejidad
function useCanchas() {
  // La vista no necesita saber esto
  const [cache, setCache] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchCanchas = async () => {
    if (cache && Date.now() - lastFetch < 60000) {
      return cache; // Caché de 1 minuto
    }
    const data = await canchaService.getAllCanchas();
    setCache(data);
    setLastFetch(Date.now());
    return data;
  };
}
```

### Resumen de Beneficios

| Principio                     | Beneficio                             | Ejemplo en el Proyecto                         |
| ----------------------------- | ------------------------------------- | ---------------------------------------------- |
| **SoC**                       | Código más mantenible y testeable     | Modelo/Servicio/Hook/Vista separados           |
| **DRY**                       | Menos bugs, cambios centralizados     | `api.js` reutilizado en todos los servicios    |
| **SRP**                       | Funciones pequeñas y enfocadas        | `formatPrice()`, `validateEmail()`             |
| **Composición**               | Flexibilidad sin herencia compleja    | Múltiples hooks en un componente               |
| **Inversión de Dependencias** | Fácil cambiar implementación          | Cambiar backend sin tocar vistas               |
| **Open/Closed**               | Agregar features sin romper existente | `useCanchasConFavoritos` extiende `useCanchas` |
| **Menor Conocimiento**        | Componentes simples y desacoplados    | Vista no conoce detalles de fetching           |

---

## 📞 Soporte y Mantenimiento

### Cuándo Actualizar Esta Documentación

Este documento debe actualizarse cuando:

- ✅ **Nuevos Modelos:** Se agrega `models/NuevoModelo.js`
- ✅ **Nuevos Servicios:** Se agrega `services/nuevoService.js`
- ✅ **Nuevos Hooks:** Se agrega `hooks/useNuevoHook.js`
- ✅ **Páginas Refactorizadas:** Se migra una página antigua a MVC
- ✅ **Cambios en Arquitectura:** Modificación de estructura de carpetas
- ✅ **Nuevos Endpoints:** Cambios en API backend que afectan servicios
- ✅ **Cambios en Autenticación:** Modificación del flujo de tokens/JWT

### Cómo Actualizar

1. **Agregar a la tabla de métricas** (sección "Archivos Creados")
2. **Actualizar el conteo de páginas** si aplica
3. **Documentar nuevos mapeos** frontend-backend en tabla de endpoints
4. **Agregar ejemplos** en la guía paso a paso si es funcionalidad compleja
5. **Actualizar la versión** al final del documento

### Troubleshooting Común

#### **Error: "The requested module does not provide an export named..."**

**Causa:** Mismatch entre tipo de export e import

```javascript
// ❌ Incorrecto
// Archivo: models/Cancha.js
export default class Cancha {}

// Archivo: pages/DashboardPage.jsx
import { Cancha } from "../models/Cancha"; // ❌ Named import

// ✅ Correcto
import Cancha from "../models/Cancha"; // ✅ Default import
```

**Solución:** Asegurar que imports coincidan con exports:

- `export default` → `import X from`
- `export const/function/class` → `import { X } from`

#### **Error: "Token inválido" o 401 Unauthorized**

**Causa:** Token no presente o expirado

**Solución:**

1. Verificar que `localStorage.getItem('token')` existe
2. Verificar que `api.js` inyecta el header:
   ```javascript
   Authorization: `Bearer ${token}`;
   ```
3. Verificar que backend acepta el token en `auth` middleware
4. Si expiró, hacer logout y login nuevamente

#### **Error: "Cannot read property of undefined"**

**Causa:** Hook retorna `undefined` en lugar de objeto

**Solución:**

```javascript
// ❌ Incorrecto
export function useCanchas() {
  const [canchas, setCanchas] = useState([]);
  // Falta return
}

// ✅ Correcto
export function useCanchas() {
  const [canchas, setCanchas] = useState([]);
  return { canchas, loading, error }; // ✅ Siempre retornar objeto
}
```

#### **Datos no se actualizan después de crear/editar**

**Causa:** Falta llamar `refetch()` o actualizar estado

**Solución:**

```javascript
const { canchas, refetch } = useCanchas();

const handleCrear = async (nuevaCancha) => {
  await canchaService.createCancha(nuevaCancha);
  refetch(); // ✅ Recargar datos
};
```

### Herramientas de Desarrollo

#### **Ver errores de compilación:**

```bash
npm run dev
# Observar consola para errores de sintaxis/imports
```

#### **Buscar uso de una función:**

```bash
# Buscar dónde se usa authService.login
grep -r "authService.login" src/
```

#### **Verificar estructura de imports:**

```bash
# Ver todos los imports de un modelo
grep -r "from.*Usuario" src/
```

### Contacto

Para preguntas sobre la arquitectura MVC:

- **Desarrollador Principal:** [Tu nombre]
- **Documentación Backend:** `backend/README.md`
- **API Docs:** `backend/API_DOCUMENTATION.md`

---

## 📚 Referencias y Recursos

### Documentación Oficial

- **React Hooks:** [react.dev/reference/react](https://react.dev/reference/react)
- **Fetch API:** [developer.mozilla.org/en-US/docs/Web/API/Fetch_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- **LocalStorage:** [developer.mozilla.org/en-US/docs/Web/API/Window/localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### Patrones de Diseño

- **MVC Pattern:** [refactoring.guru/design-patterns/mvc](https://refactoring.guru/design-patterns)
- **Service Layer Pattern:** [martinfowler.com/eaaCatalog/serviceLayer.html](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- **Repository Pattern:** Para futuras mejoras en la capa de datos

### Mejores Prácticas

- **React Hooks Best Practices:** [react.dev/learn/reusing-logic-with-custom-hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- **SOLID Principles:** [digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design](https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)

---

**Última actualización:** 14 de Noviembre de 2025  
**Versión:** 4.0  
**Estado:** ✅ 14 de 14 páginas implementadas con arquitectura MVC

**Compatibilidad:** ✅ Toda la funcionalidad se mantiene intacta  
**Backend Integration:** ✅ 24/24 endpoints verificados y funcionando correctamente

---

## 💾 Flujo de Datos hacia la Base de Datos

### Arquitectura Completa: Frontend → Backend → Base de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
├─────────────────────────────────────────────────────────────────┤
│  VISTA (pages/)          → Captura datos del usuario           │
│  HOOK (hooks/)           → Valida con Modelo                   │
│  MODELO (models/)        → Validaciones y transformaciones     │
│  SERVICIO (services/)    → HTTP Request a API                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ POST /api/usuarios/register
                          │ { nombre, email, telefono, contrasena }
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  RUTA (routes/)          → Define endpoint                     │
│  MIDDLEWARE (auth.js)    → Valida token (si aplica)            │
│  CONTROLADOR (controllers/) → Lógica de negocio                │
│  MODELO (models/)        → Queries SQL                         │
│  DATABASE (db.js)        → Conexión MySQL                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │ INSERT INTO usuarios
                          │ VALUES (nombre, email, ...)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (MySQL)                        │
├─────────────────────────────────────────────────────────────────┤
│  usuarios                                                       │
│  canchas                                                        │
│  reservas                                                       │
│  pending_usuarios                                               │
│  password_reset_tokens                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Ejemplo Completo: Crear una Reserva

#### **1. Usuario llena el formulario (Frontend - VISTA)**

```javascript
// pages/ReservaPage.jsx
function ReservaPage() {
  const { cancha, loading, handleSubmit } = useReservaForm(canchaId);
  const [form, setForm] = useState({
    fecha: "",
    slot: null,
    clienteNombre: "",
    clienteTelefono: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(form); // Delega al hook
  };

  return <form onSubmit={onSubmit}>...</form>;
}
```

#### **2. Hook valida y envía (Frontend - HOOK)**

```javascript
// hooks/useReservaForm.js
export function useReservaForm(canchaId) {
  const handleSubmit = async (formData) => {
    // Validar con el Modelo
    const validacion = Reserva.validarDatosReserva(formData);
    if (!validacion.isValid) {
      setError(validacion.errors.join(", "));
      return;
    }

    // Preparar datos
    const reservaData = {
      cancha_id: canchaId,
      usuario_id: usuario.id,
      fecha_reserva: formData.fecha,
      hora_inicio: formData.slot.inicio,
      hora_fin: formData.slot.fin,
      precio: cancha.precio,
      cliente_nombre: formData.clienteNombre,
      cliente_telefono: formData.clienteTelefono,
    };

    // Llamar al Servicio
    const nuevaReserva = await reservaService.createReserva(reservaData);

    // Navegar a confirmación
    navigate("/confirmacion", { state: { reserva: nuevaReserva } });
  };

  return { handleSubmit };
}
```

#### **3. Servicio hace la petición HTTP (Frontend - SERVICIO)**

```javascript
// services/reservaService.js
import { post } from "./api";

export async function createReserva(reservaData) {
  return await post("/api/reservas", reservaData);
}

// services/api.js
export async function post(endpoint, body) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Error al crear reserva");
  }

  return await response.json();
}
```

#### **4. Backend recibe la petición (Backend - RUTA)**

```javascript
// backend/routes/reservas.js
const express = require("express");
const router = express.Router();
const { createReserva } = require("../controllers/reservasController");

router.post("/", createReserva);

module.exports = router;
```

#### **5. Controlador procesa la lógica (Backend - CONTROLADOR)**

```javascript
// backend/controllers/reservasController.js
const reservasModel = require("../models/reservasModel");

async function createReserva(req, res) {
  try {
    const {
      cancha_id,
      usuario_id,
      fecha_reserva,
      hora_inicio,
      hora_fin,
      precio,
      cliente_nombre,
      cliente_telefono,
    } = req.body;

    // Validaciones backend
    if (!cancha_id || !usuario_id || !fecha_reserva) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    // Verificar disponibilidad
    const disponible = await reservasModel.checkAvailability(
      cancha_id,
      fecha_reserva,
      hora_inicio,
      hora_fin
    );

    if (!disponible) {
      return res.status(409).json({ message: "Horario no disponible" });
    }

    // Crear reserva en la base de datos
    const nuevaReserva = await reservasModel.create({
      cancha_id,
      usuario_id,
      fecha_reserva,
      hora_inicio,
      hora_fin,
      precio,
      cliente_nombre,
      cliente_telefono,
      estado: "confirmada",
    });

    res.status(201).json({
      message: "Reserva creada exitosamente",
      reserva: nuevaReserva,
    });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = { createReserva };
```

#### **6. Modelo ejecuta el query SQL (Backend - MODELO)**

```javascript
// backend/models/reservasModel.js
const db = require("../db");

async function create(reservaData) {
  const query = `
    INSERT INTO reservas (
      cancha_id,
      usuario_id,
      fecha_reserva,
      hora_inicio,
      hora_fin,
      precio,
      cliente_nombre,
      cliente_telefono,
      estado,
      fecha_creacion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const [result] = await db.execute(query, [
    reservaData.cancha_id,
    reservaData.usuario_id,
    reservaData.fecha_reserva,
    reservaData.hora_inicio,
    reservaData.hora_fin,
    reservaData.precio,
    reservaData.cliente_nombre,
    reservaData.cliente_telefono,
    reservaData.estado,
  ]);

  // Obtener la reserva recién creada
  const [reserva] = await db.execute("SELECT * FROM reservas WHERE id = ?", [
    result.insertId,
  ]);

  return reserva[0];
}

async function checkAvailability(cancha_id, fecha, hora_inicio, hora_fin) {
  const query = `
    SELECT COUNT(*) as count
    FROM reservas
    WHERE cancha_id = ?
      AND fecha_reserva = ?
      AND estado != 'cancelada'
      AND (
        (hora_inicio < ? AND hora_fin > ?)
        OR (hora_inicio < ? AND hora_fin > ?)
        OR (hora_inicio >= ? AND hora_fin <= ?)
      )
  `;

  const [rows] = await db.execute(query, [
    cancha_id,
    fecha,
    hora_fin,
    hora_inicio,
    hora_fin,
    hora_inicio,
    hora_inicio,
    hora_fin,
  ]);

  return rows[0].count === 0;
}

module.exports = { create, checkAvailability };
```

#### **7. Conexión a la base de datos (Backend - DB)**

```javascript
// backend/db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "escenarios_deportivos",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
```

#### **8. Datos guardados en MySQL (Base de Datos)**

```sql
-- Tabla: reservas
+----+-----------+------------+----------------+-------------+----------+--------+----------------+-------------------+------------+------------------+
| id | cancha_id | usuario_id | fecha_reserva  | hora_inicio | hora_fin | precio | cliente_nombre | cliente_telefono  | estado     | fecha_creacion   |
+----+-----------+------------+----------------+-------------+----------+--------+----------------+-------------------+------------+------------------+
| 1  | 5         | 12         | 2025-11-20     | 14:00       | 15:00    | 50000  | Juan Pérez     | 3123456789        | confirmada | 2025-11-14 10:30 |
+----+-----------+------------+----------------+-------------+----------+--------+----------------+-------------------+------------+------------------+
```

### Resumen del Flujo Completo

1. **Usuario** → Llena formulario en la vista
2. **Vista** → Captura datos y llama al hook
3. **Hook** → Valida con modelo y llama al servicio
4. **Modelo (Frontend)** → Validaciones de estructura/formato
5. **Servicio** → HTTP POST a `/api/reservas`
6. **Ruta (Backend)** → Recibe petición y llama al controlador
7. **Controlador (Backend)** → Validaciones de negocio y llama al modelo
8. **Modelo (Backend)** → Ejecuta query SQL
9. **Database Connection** → Pool de conexiones MySQL
10. **MySQL** → Inserta datos en tabla `reservas`
11. **Respuesta** → Sube por todas las capas hasta el frontend
12. **Vista** → Muestra confirmación al usuario

### Beneficios de Esta Arquitectura

- ✅ **Separación clara**: Cada capa tiene una responsabilidad única
- ✅ **Validación doble**: Frontend (UX) + Backend (seguridad)
- ✅ **Reutilizable**: Servicios y modelos se usan en múltiples lugares
- ✅ **Mantenible**: Cambios en una capa no afectan otras
- ✅ **Testeable**: Cada capa se puede testear independientemente
- ✅ **Seguro**: Autenticación, validaciones, prepared statements

---

**¡Gracias por seguir las mejores prácticas de arquitectura de software! 🚀**
