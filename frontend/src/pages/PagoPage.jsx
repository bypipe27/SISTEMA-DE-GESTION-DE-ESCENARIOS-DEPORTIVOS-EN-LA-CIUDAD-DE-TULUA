import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SideNavBar from '../components/SideNavBar';
import { crearPaymentIntent, confirmarPago } from '../services/pagoService';
import { FaCreditCard, FaLock, FaCheckCircle, FaGraduationCap, FaInfoCircle } from 'react-icons/fa';

// Modo simulación para proyecto académico (siempre activo)
const SIMULATION_MODE = true;

// Función auxiliar para formatear precios
const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(precio);
};

// Función auxiliar para formatear fechas
const formatearFechaLocal = (valor) => {
  try {
    const d = typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)
      ? new Date(`${valor}T00:00:00`)
      : new Date(valor);
    if (isNaN(d)) return 'Fecha no disponible';
    return d.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Fecha no disponible';
  }
};

// Formulario de pago simulado para proyecto académico
function SimulatedCheckoutForm({ reserva, cancha, horario, onSuccess, paymentIntentId }) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isPenalized, setIsPenalized] = useState(false);
  const [penaltyTimer, setPenaltyTimer] = useState(10);

  // Efecto para el temporizador de penalización
  useEffect(() => {
    let interval;
    if (isPenalized && penaltyTimer > 0) {
      interval = setInterval(() => {
        setPenaltyTimer((prev) => prev - 1);
      }, 1000);
    } else if (penaltyTimer === 0) {
      setIsPenalized(false);
      setPenaltyTimer(10);
      setErrorMessage('');
      // Limpiar los campos
      setCardNumber('');
      setExpiryDate('');
      setCvc('');
      setCardHolder('');
    }
    return () => clearInterval(interval);
  }, [isPenalized, penaltyTimer]);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    if (!paymentIntentId) {
      setErrorMessage('No se pudo inicializar el pago. Por favor, recarga la página.');
      setIsProcessing(false);
      return;
    }

    // Validaciones básicas
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMessage('Número de tarjeta inválido');
      setIsProcessing(false);
      setIsPenalized(true);
      setPenaltyTimer(10);
      return;
    }

    if (!expiryDate || expiryDate.length < 5) {
      setErrorMessage('Fecha de expiración inválida');
      setIsProcessing(false);
      setIsPenalized(true);
      setPenaltyTimer(10);
      return;
    }

    if (!cvc || cvc.length < 3) {
      setErrorMessage('CVC inválido');
      setIsProcessing(false);
      setIsPenalized(true);
      setPenaltyTimer(10);
      return;
    }

    if (!cardHolder) {
      setErrorMessage('Nombre del titular requerido');
      setIsProcessing(false);
      setIsPenalized(true);
      setPenaltyTimer(10);
      return;
    }

    // Validación de datos de prueba recomendados
    const cardClean = cardNumber.replace(/\s/g, '');
    const isValidTestCard = cardClean === '4242424242424242';
    const isValidExpiry = expiryDate === '12/25';
    const isValidCvc = cvc === '123';

    if (!isValidTestCard || !isValidExpiry || !isValidCvc) {
      setErrorMessage('Datos incorrectos. Por favor, usa los datos de prueba sugeridos.');
      setIsProcessing(false);
      setIsPenalized(true);
      setPenaltyTimer(10);
      return;
    }

    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Usar el payment intent ID que fue creado previamente en el backend
      console.log('Confirmando pago con ID:', paymentIntentId);

      // Confirmar el pago en nuestro backend
      const resultado = await confirmarPago(paymentIntentId);
      
      setSuccessMessage('¡Pago procesado exitosamente! (SIMULADO)');
      
      // Esperar un momento para mostrar el mensaje
      setTimeout(() => {
        onSuccess(resultado);
        navigate('/confirmacion-reserva', {
          state: { 
            reserva: {
              ...reserva,
              pagado: true,
              factura: resultado.factura
            }, 
            cancha, 
            horario 
          }
        });
      }, 1500);
    } catch (error) {
      console.error('Error al procesar pago simulado:', error);
      setErrorMessage(error.message || 'Error al procesar el pago');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Banner de modo simulación */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 flex items-start gap-3 shadow-lg border border-purple-400/30">
        <FaGraduationCap className="text-white text-4xl flex-shrink-0 mt-1 drop-shadow-md" />
        <div>
          <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-lg">
            🎓 Modo Simulación - Proyecto Académico
            <span className="text-xs bg-white/30 backdrop-blur-sm text-white px-3 py-1 rounded-full font-semibold">DEMO</span>
          </h3>
          <p className="text-sm text-purple-50 mb-3">
            Este es un sistema de pago <strong>completamente simulado</strong> para demostración académica. 
            No se procesarán cargos reales ni se conectará a Stripe.
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mt-2 border border-white/30">
            <p className="text-xs text-white font-semibold mb-2">💡 Datos de prueba EXACTOS requeridos:</p>
            <ul className="text-xs text-purple-50 space-y-1 ml-4 list-disc">
              <li>Tarjeta: <code className="bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded font-mono font-bold">4242 4242 4242 4242</code></li>
              <li>Fecha: <code className="bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded font-mono font-bold">12/25</code></li>
              <li>CVC: <code className="bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded font-mono font-bold">123</code></li>
              <li>Nombre: Cualquier nombre</li>
            </ul>
            <p className="text-xs text-yellow-200 mt-2 font-semibold">⚠️ Datos incorrectos activarán penalización de 10 segundos</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border border-slate-200 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
            <FaCreditCard className="text-white text-2xl" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Información de Pago (Simulado)
          </h3>
        </div>
        
        <div className="space-y-5">
          {/* Número de tarjeta */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Número de Tarjeta
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
              maxLength="19"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all shadow-sm hover:border-blue-400"
              required
            />
            <p className="text-xs text-blue-600 mt-1.5 font-medium">
              💳 Sugerencia: 4242 4242 4242 4242
            </p>
          </div>

          {/* Fecha y CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fecha de Expiración
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/AA"
                maxLength="5"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all shadow-sm hover:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                CVC
              </label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength="4"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all shadow-sm hover:border-blue-400"
                required
              />
            </div>
          </div>

          {/* Nombre del titular */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre del Titular
            </label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              placeholder="NOMBRE APELLIDO"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all shadow-sm hover:border-blue-400"
              required
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-rose-600 to-red-600 rounded-2xl p-5 shadow-2xl border-2 border-red-400/50 animate-scaleIn">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-rose-400/20 animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-base mb-1">⚠️ Error en los datos de pago</p>
                <p className="text-white/95 text-sm">{errorMessage}</p>
              </div>
            </div>
            
            {isPenalized && (
              <div className="mt-4 pt-4 border-t border-white/30">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-bold text-sm">🔒 Tiempo de espera</p>
                    <div className="flex items-center gap-2">
                      <div className="relative w-14 h-14">
                        {/* Círculo de fondo */}
                        <svg className="transform -rotate-90 w-14 h-14">
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="4"
                            fill="none"
                          />
                          {/* Círculo de progreso */}
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="white"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 24}`}
                            strokeDashoffset={`${2 * Math.PI * 24 * (1 - penaltyTimer / 10)}`}
                            className="transition-all duration-1000 ease-linear"
                            strokeLinecap="round"
                          />
                        </svg>
                        {/* Número en el centro */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-xl drop-shadow-lg">{penaltyTimer}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/90 text-xs text-center">
                    Por favor espera <strong>{penaltyTimer} segundo{penaltyTimer !== 1 ? 's' : ''}</strong> para intentar nuevamente
                  </p>
                  <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-white/80 text-xs text-center mb-2">📋 Datos de prueba correctos:</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between bg-white/10 rounded px-2 py-1.5">
                        <span className="text-white/70 text-xs">Tarjeta:</span>
                        <code className="text-white font-mono text-xs font-bold">4242 4242 4242 4242</code>
                      </div>
                      <div className="flex items-center justify-between bg-white/10 rounded px-2 py-1.5">
                        <span className="text-white/70 text-xs">Fecha:</span>
                        <code className="text-white font-mono text-xs font-bold">12/25</code>
                      </div>
                      <div className="flex items-center justify-between bg-white/10 rounded px-2 py-1.5">
                        <span className="text-white/70 text-xs">CVC:</span>
                        <code className="text-white font-mono text-xs font-bold">123</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 flex items-center gap-3 shadow-lg border border-emerald-400/50">
          <FaCheckCircle className="text-white text-3xl flex-shrink-0 drop-shadow-md" />
          <div className="flex-1">
            <p className="text-white font-bold text-base">{successMessage}</p>
            <p className="text-emerald-50 text-sm mt-1">Redirigiendo a la confirmación...</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-slate-600 text-sm bg-slate-100/50 rounded-xl p-3 border border-slate-200/50">
        <FaLock className="text-blue-600" />
        <span className="font-medium">Pago seguro simulado para proyecto académico</span>
      </div>

      <button
        type="submit"
        disabled={isProcessing || !paymentIntentId || isPenalized}
        className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all transform shadow-xl ${
          isProcessing || isPenalized
            ? 'bg-slate-400 cursor-not-allowed opacity-60'
            : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 active:scale-[0.98] hover:shadow-2xl hover:scale-[1.02]'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Procesando pago simulado...
          </span>
        ) : isPenalized ? (
          <span className="flex items-center justify-center gap-3">
            <FaLock className="text-xl" />
            🔒 Bloqueado - Espera {penaltyTimer}s
          </span>
        ) : (
          `🎓 Pagar ${formatearPrecio(cancha.precio)} (SIMULADO)`
        )}
      </button>

      <p className="text-xs text-center text-slate-600 leading-relaxed bg-amber-50 border border-amber-200 rounded-xl p-3">
        Al hacer clic en "Pagar", confirmas esta reserva. <br/>
        <strong className="text-amber-800">Este es un pago simulado para demostración académica.</strong><br/>
        No se realizarán cargos reales a ninguna tarjeta.
      </p>
    </form>
  );
}
function PagoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reserva, cancha, horario} = location.state || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  useEffect(() => {
    // Validar que tenemos los datos necesarios
    if (!reserva || !cancha || !horario) {
      navigate('/dashboard');
      return;
    }

    // Inicializar pago simulado
    const inicializarPago = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        console.log('🔷 Iniciando pago SIMULADO para reserva:', reserva.id);
        console.log('🔷 Datos de reserva:', { reserva, cancha, horario });
        
        const resultado = await crearPaymentIntent(
          reserva.id,
          cancha.precio,
          {
            cancha_nombre: cancha.nombre,
            fecha: reserva.fecha,
            horario: `${horario.start} - ${horario.end}`
          }
        );
        
        console.log('✅ Payment intent creado (simulado):', resultado);
        
        // Verificar que recibimos el paymentIntentId
        if (!resultado || !resultado.paymentIntentId) {
          throw new Error('No se recibió el ID del payment intent del servidor');
        }
        
        // Usar el payment intent ID que fue creado previamente en el backend
        setPaymentIntentId(resultado.paymentIntentId);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error al inicializar pago:', error);
        console.error('❌ Detalles del error:', {
          message: error.message,
          stack: error.stack,
          response: error.response
        });
        setError(error.message || 'Error al inicializar el pago. Por favor, intenta nuevamente.');
        setIsLoading(false);
      }
    };

    inicializarPago();
  }, [reserva, cancha, horario, navigate]);

  const handleSuccess = (resultado) => {
    console.log('Pago exitoso:', resultado);
  };

  // Si se accede directamente a /pago (refresh o URL manual) se pierde location.state
  // En lugar de devolver null (pantalla completamente en blanco), mostramos un aviso breve
  if (!reserva || !cancha || !horario) {
    return (
      <div className="flex h-screen bg-slate-50">
        <SideNavBar />
        <main className="flex-1 ml-64 p-6 flex items-center justify-center">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Datos de pago no disponibles</h2>
            <p className="text-sm text-slate-600 mb-4">
              Parece que abriste esta página directamente o refrescaste el navegador.
              Necesitamos la información de la reserva para continuar.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              Ir al Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Decoraciones de fondo animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <SideNavBar />
      
      <main className="flex-1 ml-64 p-4 sm:p-6 lg:p-10 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header con gradiente mejorado */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl border border-emerald-400/30 mb-4 shadow-2xl hover:shadow-emerald-500/20 transition-all group">
              <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <FaCreditCard className="text-2xl text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  Procesar Pago
                </h1>
                <p className="text-emerald-200 text-sm font-medium">
                  Completa tu reserva de forma segura 🔒
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resumen de la reserva - Mejorado */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white via-emerald-50/30 to-slate-50 rounded-2xl shadow-2xl hover:shadow-emerald-500/20 border border-slate-200 p-6 sticky top-6 transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Resumen de Reserva
                  </h2>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 transition-all hover:shadow-md hover:-translate-y-0.5">
                    <p className="text-xs text-emerald-700 font-semibold mb-1 uppercase tracking-wide flex items-center gap-2">
                      <span>⚽</span> Cancha
                    </p>
                    <p className="text-sm font-bold text-slate-900">{cancha.nombre}</p>
                    <p className="text-xs text-emerald-600 font-medium">{cancha.tipo}</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all hover:shadow-md hover:-translate-y-0.5">
                    <p className="text-xs text-blue-700 font-semibold mb-1 uppercase tracking-wide flex items-center gap-2">
                      <span>📅</span> Fecha
                    </p>
                    <p className="text-sm font-bold text-slate-900">{formatearFechaLocal(reserva.fecha)}</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all hover:shadow-md hover:-translate-y-0.5">
                    <p className="text-xs text-purple-700 font-semibold mb-1 uppercase tracking-wide flex items-center gap-2">
                      <span>⏰</span> Horario
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {horario.start} - {horario.end}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-all hover:shadow-md hover:-translate-y-0.5">
                    <p className="text-xs text-amber-700 font-semibold mb-1 uppercase tracking-wide flex items-center gap-2">
                      <span>👤</span> Cliente
                    </p>
                    <p className="text-sm font-bold text-slate-900">{reserva.cliente_nombre}</p>
                  </div>
                </div>

                {/* Desglose de costos mejorado */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 space-y-3 border-2 border-slate-200 shadow-inner">
                  <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                    <span className="text-sm font-bold text-slate-700">Subtotal</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatearPrecio(cancha.precio / 1.19)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                    <span className="text-sm font-bold text-slate-700">IVA (19%)</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatearPrecio(cancha.precio - (cancha.precio / 1.19))}
                    </span>
                  </div>
                  <div className="border-t-2 border-dashed border-slate-300 my-2"></div>
                  <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                    <span className="text-base font-bold text-white flex items-center gap-2">
                      <span className="text-lg">💰</span> Total
                    </span>
                    <span className="text-2xl font-black text-white drop-shadow-lg">
                      {formatearPrecio(cancha.precio)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border border-blue-400/30">
                  <p className="text-xs text-white font-semibold flex items-center gap-2">
                    <span className="text-lg">✉️</span>
                    <span>Recibirás una factura electrónica en tu correo después del pago</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario de pago */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-400 mb-4"></div>
                    <p className="text-white font-medium">Inicializando pago seguro...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-red-400/50 shadow-2xl p-8">
                  <div className="text-center">
                    <div className="text-red-400 text-5xl mb-4 animate-pulse">⚠️</div>
                    <h3 className="text-xl font-bold text-white mb-2">Error al inicializar el pago</h3>
                    <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-4 backdrop-blur-sm">
                      <p className="text-red-200 text-sm font-semibold mb-2">Detalles del error:</p>
                      <p className="text-red-100 text-sm">{error}</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mb-4 text-left backdrop-blur-sm">
                      <p className="text-blue-200 text-xs mb-2 font-semibold">💡 Posibles soluciones:</p>
                      <ul className="text-blue-100 text-xs space-y-1 ml-4 list-disc">
                        <li>Verifica que el servidor backend esté corriendo en el puerto 5000</li>
                        <li>Abre la consola del navegador (F12) para ver más detalles</li>
                        <li>Verifica que estés autenticado correctamente</li>
                        <li>Intenta recargar la página o volver a crear la reserva</li>
                      </ul>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 text-sm font-semibold shadow-lg"
                      >
                        Reintentar
                      </button>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 text-sm font-semibold border border-white/30"
                      >
                        Volver al Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-200">
                  <SimulatedCheckoutForm
                    reserva={reserva}
                    cancha={cancha}
                    horario={horario}
                    paymentIntentId={paymentIntentId}
                    onSuccess={handleSuccess}
                  />
                </div>
              )}

              {/* Información de seguridad */}
              <div className="mt-6 bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FaLock className="text-blue-600" />
                  Sistema de Pago Simulado
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span><strong>Modo Académico:</strong> Sin cargos reales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span><strong>Facturación:</strong> Se genera factura simulada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span><strong>Notificaciones:</strong> Correos de confirmación incluidos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span><strong>Seguridad:</strong> Datos no se almacenan ni envían a terceros</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800 flex items-start gap-2">
                    <FaInfoCircle className="flex-shrink-0 mt-0.5" />
                    <span>
                      Este proyecto usa una implementación simulada de Stripe para fines educativos. 
                      Toda la funcionalidad es demostrativa y no procesa pagos reales.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PagoPage;
