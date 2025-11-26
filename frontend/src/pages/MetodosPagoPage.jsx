import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavBar from '../components/SideNavBar';
import {
  obtenerMetodosPago,
  crearMetodoPago,
  eliminarMetodoPago,
  establecerMetodoPredeterminado,
  detectarTarjeta
} from '../services/metodoPagoService';
import {
  FaCreditCard,
  FaUniversity,
  FaTrash,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaStar,
  FaRegStar
} from 'react-icons/fa';

// Componente para logos de marcas de tarjetas y bancos
const CardBrandLogo = ({ brand, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-12'
  };

  const logos = {
    'Visa': (
      <svg viewBox="0 0 48 16" className={sizeClasses[size]} fill="none">
        <rect width="48" height="16" rx="2" fill="#1434CB"/>
        <path d="M18.5 11.5L20.2 4.5H22.3L20.6 11.5H18.5Z" fill="white"/>
        <path d="M27.8 4.7C27.4 4.5 26.7 4.3 25.9 4.3C23.9 4.3 22.5 5.3 22.5 6.8C22.5 7.9 23.5 8.5 24.3 8.8C25.1 9.1 25.4 9.3 25.4 9.6C25.4 10.1 24.8 10.3 24.2 10.3C23.4 10.3 22.9 10.2 22.3 9.9L22 9.7L21.7 11.3C22.2 11.5 23.1 11.7 24 11.7C26.2 11.7 27.5 10.7 27.5 9.1C27.5 8.2 26.9 7.6 25.6 7.1C24.9 6.8 24.5 6.6 24.5 6.3C24.5 6 24.9 5.7 25.7 5.7C26.4 5.7 26.9 5.8 27.3 6L27.5 6.1L27.8 4.7Z" fill="white"/>
        <path d="M31.5 4.5H29.9C29.4 4.5 29 4.7 28.8 5.1L25.5 11.5H27.7L28.2 10.2H30.8L31.1 11.5H33L31.5 4.5ZM28.9 8.6L29.8 6.3L30.3 8.6H28.9Z" fill="white"/>
        <path d="M16.2 4.5L14.1 9.4L13.9 8.3C13.5 7.1 12.4 5.8 11.2 5.2L13.1 11.5H15.4L18.5 4.5H16.2Z" fill="white"/>
        <path d="M12.3 4.5H9.1L9 4.6C11.6 5.3 13.3 6.9 13.9 8.8L13.2 5.2C13.1 4.8 12.7 4.5 12.3 4.5Z" fill="#F7B600"/>
      </svg>
    ),
    'Mastercard': (
      <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
        <rect width="48" height="32" rx="3" fill="#000000"/>
        <circle cx="18" cy="16" r="9" fill="#EB001B"/>
        <circle cx="30" cy="16" r="9" fill="#FF5F00"/>
        <path d="M24 9C26.2 10.5 27.5 13.1 27.5 16C27.5 18.9 26.2 21.5 24 23C21.8 21.5 20.5 18.9 20.5 16C20.5 13.1 21.8 10.5 24 9Z" fill="#F79E1B"/>
      </svg>
    ),
    'American Express': (
      <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
        <rect width="48" height="32" rx="3" fill="#006FCF"/>
        <text x="24" y="20" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">AMEX</text>
      </svg>
    ),
    'Diners Club': (
      <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
        <rect width="48" height="32" rx="3" fill="#0079BE"/>
        <circle cx="18" cy="16" r="8" fill="white"/>
        <circle cx="30" cy="16" r="8" fill="white"/>
        <path d="M24 8C19.6 8 16 11.6 16 16C16 20.4 19.6 24 24 24C28.4 24 32 20.4 32 16C32 11.6 28.4 8 24 8Z" fill="#0079BE"/>
      </svg>
    ),
    'Discover': (
      <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
        <rect width="48" height="32" rx="3" fill="#FF6000"/>
        <text x="24" y="20" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">DISCOVER</text>
      </svg>
    ),
    'Nequi': (
      <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
        <rect width="48" height="32" rx="3" fill="#3F1E79"/>
        <circle cx="24" cy="16" r="8" fill="#FF006B" opacity="0.9"/>
        <text x="24" y="28" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">Nequi</text>
      </svg>
    ),
    'Bancolombia': (
      <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
        <rect width="48" height="32" rx="3" fill="#FFDD00"/>
        <path d="M12 8H36V24H12V8Z" fill="#003DA5"/>
        <text x="24" y="19" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">BANCOLOMBIA</text>
      </svg>
    ),
    'Davivienda': (
      <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
        <rect width="48" height="32" rx="3" fill="#ED1C24"/>
        <path d="M10 12L24 8L38 12V20L24 24L10 20V12Z" fill="white" opacity="0.9"/>
        <text x="24" y="28" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">Davivienda</text>
      </svg>
    )
  };

  return (
    <div className={`${sizeClasses[size]} flex items-center`}>
      {logos[brand] || (
        <div className="flex items-center justify-center bg-gradient-to-r from-slate-600 to-slate-700 rounded h-full px-3">
          <FaCreditCard className="text-white" />
        </div>
      )}
    </div>
  );
};

const MetodosPagoPage = () => {
  const navigate = useNavigate();
  const [metodosPago, setMetodosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('tarjeta_credito');
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [modalEliminar, setModalEliminar] = useState(null); // Para confirmar eliminación

  // Campos del formulario
  const [nombreTitular, setNombreTitular] = useState('');
  const [numeroCompleto, setNumeroCompleto] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [cvv, setCvv] = useState('');
  const [banco, setBanco] = useState('');
  const [tipoCuenta, setTipoCuenta] = useState('ahorro');
  const [marcaDetectada, setMarcaDetectada] = useState('');
  const [validacionTarjeta, setValidacionTarjeta] = useState(null);

  useEffect(() => {
    cargarMetodosPago();
  }, []);

  const cargarMetodosPago = async () => {
    try {
      setLoading(true);
      const metodos = await obtenerMetodosPago();
      setMetodosPago(metodos);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
      setMensajeError('Error al cargar los métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  const formatearNumeroTarjeta = (valor) => {
    const limpio = valor.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const partes = limpio.match(/.{1,4}/g);
    return partes ? partes.join(' ') : limpio;
  };

  const formatearFechaExpiracion = (valor) => {
    const limpio = valor.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    if (limpio.length >= 2) {
      // Si tiene 4 dígitos o más, formato completo MM/YYYY
      if (limpio.length >= 4) {
        const mes = limpio.slice(0, 2);
        let anio = limpio.slice(2, 6);
        // Si el año es de 2 dígitos, convertir a 4 dígitos
        if (anio.length === 2) {
          anio = '20' + anio;
        }
        return `${mes}/${anio}`;
      }
      return `${limpio.slice(0, 2)}/${limpio.slice(2, 6)}`;
    }
    return limpio;
  };

  const handleNumeroChange = async (e) => {
    const formatted = formatearNumeroTarjeta(e.target.value);
    setNumeroCompleto(formatted);

    // Detectar tipo de tarjeta
    if (formatted.replace(/\s/g, '').length >= 6) {
      try {
        const deteccion = await detectarTarjeta(formatted);
        setMarcaDetectada(deteccion.marca);
        setValidacionTarjeta(deteccion.es_valido);
      } catch (error) {
        setMarcaDetectada('');
        setValidacionTarjeta(null);
      }
    } else {
      setMarcaDetectada('');
      setValidacionTarjeta(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError('');
    setMensajeExito('');

    try {
      const datos = {
        tipo: tipoSeleccionado,
        nombre_titular: nombreTitular,
        numero_completo: numeroCompleto.replace(/\s/g, ''),
        es_predeterminado: metodosPago.length === 0 // Primer método es predeterminado
      };

      if (tipoSeleccionado === 'cuenta_bancaria') {
        datos.banco = banco;
        datos.tipo_cuenta = tipoCuenta;
      } else {
        datos.fecha_expiracion = fechaExpiracion;
      }

      await crearMetodoPago(datos);
      setMensajeExito('Método de pago agregado exitosamente');
      
      // Limpiar formulario
      setNombreTitular('');
      setNumeroCompleto('');
      setFechaExpiracion('');
      setCvv('');
      setBanco('');
      setMarcaDetectada('');
      setValidacionTarjeta(null);
      setMostrarFormulario(false);

      // Recargar métodos
      await cargarMetodosPago();
    } catch (error) {
      setMensajeError(error.error || 'Error al agregar método de pago');
    }
  };

  const handleEliminar = async (id) => {
    const metodo = metodosPago.find(m => m.id === id);
    setModalEliminar(metodo);
  };

  const confirmarEliminar = async () => {
    if (!modalEliminar) return;

    try {
      await eliminarMetodoPago(modalEliminar.id);
      setMensajeExito('Método de pago eliminado exitosamente');
      setModalEliminar(null);
      await cargarMetodosPago();
    } catch (error) {
      setMensajeError('Error al eliminar método de pago');
      setModalEliminar(null);
    }
  };

  const handleEstablecerPredeterminado = async (id) => {
    try {
      await establecerMetodoPredeterminado(id);
      setMensajeExito('Método de pago establecido como predeterminado');
      await cargarMetodosPago();
    } catch (error) {
      setMensajeError('Error al establecer método predeterminado');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <SideNavBar />
      
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-indigo-700 bg-clip-text text-transparent mb-2">
              Métodos de Pago
            </h1>
            <p className="text-slate-600">
              Administra tus tarjetas y cuentas bancarias para pagos más rápidos
            </p>
          </div>

          {/* Mensajes */}
          {mensajeError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-red-700 font-medium">{mensajeError}</p>
            </div>
          )}
          {mensajeExito && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center gap-3">
              <FaCheckCircle className="text-green-600 text-xl" />
              <p className="text-green-700 font-medium">{mensajeExito}</p>
            </div>
          )}

          {/* Botón agregar */}
          {!mostrarFormulario && (
            <button
              onClick={() => setMostrarFormulario(true)}
              className="mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <FaPlus /> Agregar Método de Pago
            </button>
          )}

          {/* Formulario */}
          {mostrarFormulario && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Nuevo Método de Pago</h2>
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {/* Selector de tipo */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setTipoSeleccionado('tarjeta_credito')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoSeleccionado === 'tarjeta_credito'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <FaCreditCard className="text-3xl mx-auto mb-2 text-indigo-600" />
                  <p className="font-semibold text-sm">Tarjeta de Crédito</p>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoSeleccionado('tarjeta_debito')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoSeleccionado === 'tarjeta_debito'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <FaCreditCard className="text-3xl mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold text-sm">Tarjeta de Débito</p>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoSeleccionado('cuenta_bancaria')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipoSeleccionado === 'cuenta_bancaria'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <FaUniversity className="text-3xl mx-auto mb-2 text-green-600" />
                  <p className="font-semibold text-sm">Cuenta Bancaria</p>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nombre del titular */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombre del Titular
                  </label>
                  <input
                    type="text"
                    value={nombreTitular}
                    onChange={(e) => setNombreTitular(e.target.value.toUpperCase())}
                    placeholder="NOMBRE COMPLETO"
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                    required
                  />
                </div>

                {tipoSeleccionado === 'cuenta_bancaria' ? (
                  <>
                    {/* Banco */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Banco
                      </label>
                      <select
                        value={banco}
                        onChange={(e) => setBanco(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                        required
                      >
                        <option value="">Seleccionar banco</option>
                        <option value="Bancolombia">Bancolombia</option>
                        <option value="Nequi">Nequi</option>
                        <option value="Davivienda">Davivienda</option>
                      </select>
                    </div>

                    {/* Tipo de cuenta */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Tipo de Cuenta
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setTipoCuenta('ahorro')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            tipoCuenta === 'ahorro'
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                          }`}
                        >
                          Ahorro
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipoCuenta('corriente')}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            tipoCuenta === 'corriente'
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                          }`}
                        >
                          Corriente
                        </button>
                      </div>
                    </div>

                    {/* Número de cuenta */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Número de Cuenta
                      </label>
                      <input
                        type="text"
                        value={numeroCompleto}
                        onChange={(e) => setNumeroCompleto(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="1234567890"
                        maxLength="20"
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Número de tarjeta */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Número de Tarjeta
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={numeroCompleto}
                          onChange={handleNumeroChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                          required
                        />
                        {marcaDetectada && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-600">{marcaDetectada}</span>
                            {validacionTarjeta !== null && (
                              <span className={validacionTarjeta ? 'text-green-600' : 'text-red-600'}>
                                {validacionTarjeta ? '✓' : '✗'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fecha y CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Fecha de Expiración
                        </label>
                        <input
                          type="text"
                          value={fechaExpiracion}
                          onChange={(e) => setFechaExpiracion(formatearFechaExpiracion(e.target.value))}
                          placeholder="MM/AAAA"
                          maxLength="7"
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          maxLength="4"
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg"
                  >
                    Agregar Método de Pago
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de métodos de pago */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Cargando métodos de pago...</p>
            </div>
          ) : metodosPago.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
              <FaCreditCard className="text-6xl text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No tienes métodos de pago registrados
              </h3>
              <p className="text-slate-500">
                Agrega una tarjeta o cuenta bancaria para facilitar tus pagos
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {metodosPago.map((metodo) => (
                <div
                  key={metodo.id}
                  className={`bg-white rounded-2xl shadow-lg border-2 p-6 transition-all hover:shadow-xl ${
                    metodo.es_predeterminado
                      ? 'border-indigo-400 ring-2 ring-indigo-100'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardBrandLogo brand={metodo.marca || metodo.banco} size="lg" />
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-800">
                            {metodo.marca || metodo.banco}
                          </h3>
                          {metodo.es_predeterminado && (
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                              <FaStar className="text-xs" /> Predeterminado
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600">
                          {metodo.tipo === 'cuenta_bancaria' ? 'Cuenta' : 'Tarjeta'} •••• {metodo.ultimos_digitos}
                        </p>
                        <p className="text-sm text-slate-500">{metodo.nombre_titular}</p>
                        {metodo.fecha_expiracion && (
                          <p className="text-xs text-slate-400 mt-1">Vence: {metodo.fecha_expiracion}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!metodo.es_predeterminado && (
                        <button
                          onClick={() => handleEstablecerPredeterminado(metodo.id)}
                          className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Establecer como predeterminado"
                        >
                          <FaRegStar className="text-xl" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEliminar(metodo.id)}
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Eliminar Método de Pago</h3>
                <p className="text-sm text-slate-600">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-slate-700 mb-2">
                ¿Estás seguro de eliminar este método de pago?
              </p>
              <div className="flex items-center gap-3 mt-3 p-3 bg-white rounded-lg border border-slate-200">
                {modalEliminar.tipo === 'cuenta_bancaria' ? (
                  <FaUniversity className="text-green-600 text-2xl" />
                ) : (
                  <FaCreditCard className="text-indigo-600 text-2xl" />
                )}
                <div>
                  <p className="font-bold text-slate-800">
                    {modalEliminar.marca || modalEliminar.banco}
                  </p>
                  <p className="text-sm text-slate-600">
                    {modalEliminar.tipo === 'cuenta_bancaria' ? 'Cuenta' : 'Tarjeta'} •••• {modalEliminar.ultimos_digitos}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalEliminar(null)}
                className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetodosPagoPage;
