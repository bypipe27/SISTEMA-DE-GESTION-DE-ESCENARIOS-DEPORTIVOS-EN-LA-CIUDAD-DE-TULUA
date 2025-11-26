import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SideNavBar from '../components/SideNavBar';
import { crearPaymentIntent, confirmarPago } from '../services/pagoService';
import { obtenerMetodosPago, crearMetodoPago, detectarTarjeta } from '../services/metodoPagoService';
import { FaCreditCard, FaLock, FaCheckCircle, FaGraduationCap, FaInfoCircle, FaPlus, FaUniversity, FaSave } from 'react-icons/fa';

// Modo simulación para proyecto académico (siempre activo)
const SIMULATION_MODE = true;

// Componente para logos de marcas de tarjetas
const CardBrandLogo = ({ brand, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-16',
    xl: 'h-24'
  };

  const logos = {
    'Visa': (
      <div className={`${sizeClasses[size]} flex items-center`}>
        <svg viewBox="0 0 48 16" className={sizeClasses[size]} fill="none">
          <rect width="48" height="16" rx="2" fill="#1434CB"/>
          <path d="M18.5 11.5L20.2 4.5H22.3L20.6 11.5H18.5Z" fill="white"/>
          <path d="M27.8 4.7C27.4 4.5 26.7 4.3 25.9 4.3C23.9 4.3 22.5 5.3 22.5 6.8C22.5 7.9 23.5 8.5 24.3 8.8C25.1 9.1 25.4 9.3 25.4 9.6C25.4 10.1 24.8 10.3 24.2 10.3C23.4 10.3 22.9 10.2 22.3 9.9L22 9.7L21.7 11.3C22.2 11.5 23.1 11.7 24 11.7C26.2 11.7 27.5 10.7 27.5 9.1C27.5 8.2 26.9 7.6 25.6 7.1C24.9 6.8 24.5 6.6 24.5 6.3C24.5 6 24.9 5.7 25.7 5.7C26.4 5.7 26.9 5.8 27.3 6L27.5 6.1L27.8 4.7Z" fill="white"/>
          <path d="M31.5 4.5H29.9C29.4 4.5 29 4.7 28.8 5.1L25.5 11.5H27.7L28.2 10.2H30.8L31.1 11.5H33L31.5 4.5ZM28.9 8.6L29.8 6.3L30.3 8.6H28.9Z" fill="white"/>
          <path d="M16.2 4.5L14.1 9.4L13.9 8.3C13.5 7.1 12.4 5.8 11.2 5.2L13.1 11.5H15.4L18.5 4.5H16.2Z" fill="white"/>
          <path d="M12.3 4.5H9.1L9 4.6C11.6 5.3 13.3 6.9 13.9 8.8L13.2 5.2C13.1 4.8 12.7 4.5 12.3 4.5Z" fill="#F7B600"/>
        </svg>
      </div>
    ),
    'Mastercard': (
      <div className={`${sizeClasses[size]} flex items-center`}>
        <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
          <rect width="48" height="32" rx="3" fill="#000000"/>
          <circle cx="18" cy="16" r="9" fill="#EB001B"/>
          <circle cx="30" cy="16" r="9" fill="#FF5F00"/>
          <path d="M24 9C26.2 10.5 27.5 13.1 27.5 16C27.5 18.9 26.2 21.5 24 23C21.8 21.5 20.5 18.9 20.5 16C20.5 13.1 21.8 10.5 24 9Z" fill="#F79E1B"/>
        </svg>
      </div>
    ),
    'American Express': (
      <div className={`${sizeClasses[size]} flex items-center`}>
        <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
          <rect width="48" height="32" rx="3" fill="#006FCF"/>
          <text x="24" y="20" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">AMEX</text>
        </svg>
      </div>
    ),
    'Diners Club': (
      <div className={`${sizeClasses[size]} flex items-center`}>
        <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
          <rect width="48" height="32" rx="3" fill="#0079BE"/>
          <circle cx="18" cy="16" r="8" fill="white"/>
          <circle cx="30" cy="16" r="8" fill="white"/>
          <path d="M24 8C19.6 8 16 11.6 16 16C16 20.4 19.6 24 24 24C28.4 24 32 20.4 32 16C32 11.6 28.4 8 24 8Z" fill="#0079BE"/>
        </svg>
      </div>
    ),
    'Discover': (
      <div className={`${sizeClasses[size]} flex items-center`}>
        <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
          <rect width="48" height="32" rx="3" fill="#FF6000"/>
          <text x="24" y="20" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">DISCOVER</text>
        </svg>
      </div>
    ),
    'Nequi': (
      <div className={`${sizeClasses[size]} flex items-center`}>
        <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
          <rect width="48" height="32" rx="3" fill="#3F1E79"/>
          <circle cx="24" cy="16" r="8" fill="#FF006B" opacity="0.9"/>
          <text x="24" y="28" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">Nequi</text>
        </svg>
      </div>
    ),
    'Bancolombia': (
      <div className={`${sizeClasses[size]} flex items-center`}>
        <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
          <rect width="48" height="32" rx="3" fill="#FFDD00"/>
          <path d="M12 8H36V24H12V8Z" fill="#003DA5"/>
          <text x="24" y="19" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">BANCOLOMBIA</text>
        </svg>
      </div>
    ),
    'Davivienda': (
      <div className={`${sizeClasses[size]} flex items-center`}>
        <svg viewBox="0 0 48 32" className={sizeClasses[size]} fill="none">
          <rect width="48" height="32" rx="3" fill="#ED1C24"/>
          <path d="M10 12L24 8L38 12V20L24 24L10 20V12Z" fill="white" opacity="0.9"/>
          <text x="24" y="28" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">Davivienda</text>
        </svg>
      </div>
    )
  };

  return logos[brand] || (
    <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-r from-slate-600 to-slate-700 rounded px-3`}>
      <FaCreditCard className="text-white text-xl" />
    </div>
  );
};

// Modal de transacción aprobada estilo bancario
const TransactionApprovedModal = ({ show, cardBrand, lastDigits, amount, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
        {/* Header con marca */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Transacción Aprobada</h2>
            <p className="text-emerald-50 text-sm">Tu pago ha sido procesado exitosamente</p>
          </div>
        </div>

        {/* Detalles de la transacción */}
        <div className="p-6 space-y-4">
          {/* Monto */}
          <div className="text-center py-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-600 mb-1">Monto Cobrado</p>
            <p className="text-3xl font-bold text-slate-900">{formatearPrecio(amount)}</p>
          </div>

          {/* Información de la tarjeta */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Método de Pago</span>
                <CardBrandLogo brand={cardBrand} size="sm" />
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                </div>
                <span className="text-lg font-mono tracking-wider">{lastDigits}</span>
              </div>
              
              <p className="text-xs text-slate-400">{cardBrand}</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between py-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">Estado</span>
              <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                Aprobada
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">Fecha</span>
              <span className="text-sm font-semibold text-slate-900">
                {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600">Hora</span>
              <span className="text-sm font-semibold text-slate-900">
                {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Mensaje de confirmación */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <FaInfoCircle className="text-blue-600 text-lg flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900">
              Recibirás un comprobante de esta transacción en tu correo electrónico registrado.
            </p>
          </div>

          {/* Botón de continuar */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

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
  
  // Nuevos estados para métodos de pago guardados
  const [metodosPago, setMetodosPago] = useState([]);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [mostrarNuevoMetodo, setMostrarNuevoMetodo] = useState(false);
  const [loadingMetodos, setLoadingMetodos] = useState(true);
  
  // Estados para modal de guardar método
  const [modalGuardarMetodo, setModalGuardarMetodo] = useState(false);
  const [datosMetodoTemp, setDatosMetodoTemp] = useState(null);
  const [guardarComoDefault, setGuardarComoDefault] = useState(false);
  
  // Estados para modal de transacción aprobada
  const [mostrarTransaccionAprobada, setMostrarTransaccionAprobada] = useState(false);
  const [datosTransaccion, setDatosTransaccion] = useState(null);
  
  // Estados para control de intentos fallidos
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);

  // Cargar métodos de pago guardados
  useEffect(() => {
    const cargarMetodos = async () => {
      try {
        const metodos = await obtenerMetodosPago();
        setMetodosPago(metodos);
        
        // Seleccionar método predeterminado si existe
        const predeterminado = metodos.find(m => m.es_predeterminado);
        if (predeterminado) {
          setMetodoSeleccionado(predeterminado.id);
        } else if (metodos.length === 0) {
          setMostrarNuevoMetodo(true);
        }
      } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
      } finally {
        setLoadingMetodos(false);
      }
    };
    
    cargarMetodos();
  }, []);

  // Efecto para el temporizador de bloqueo
  useEffect(() => {
    let interval;
    if (bloqueado && tiempoRestante > 0) {
      interval = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            setBloqueado(false);
            setIntentosFallidos(0);
            setErrorMessage('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [bloqueado, tiempoRestante]);

  // Función para registrar intento fallido
  const registrarIntentoFallido = () => {
    const nuevosIntentos = intentosFallidos + 1;
    setIntentosFallidos(nuevosIntentos);
    
    if (nuevosIntentos >= 3) {
      setBloqueado(true);
      setTiempoRestante(10);
      setErrorMessage('Demasiados intentos fallidos. Sistema bloqueado por seguridad.');
    }
  };

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
    
    // Verificar si está bloqueado
    if (bloqueado) {
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage('');

    if (!paymentIntentId) {
      setErrorMessage('No se pudo inicializar el pago. Por favor, recarga la página.');
      setIsProcessing(false);
      registrarIntentoFallido();
      return;
    }

    // Si hay un método seleccionado, usar ese
    if (metodoSeleccionado && !mostrarNuevoMetodo) {
      try {
        // Simular procesamiento de pago con método guardado
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Confirmando pago con método guardado ID:', metodoSeleccionado);
        const resultado = await confirmarPago(paymentIntentId);
        
        // Obtener datos del método
        const metodo = metodosPago.find(m => m.id === metodoSeleccionado);
        
        setDatosTransaccion({
          cardBrand: metodo?.marca || metodo?.banco || 'Tarjeta',
          lastDigits: metodo?.ultimos_digitos || '****',
          amount: cancha.precio
        });
        
        setMostrarTransaccionAprobada(true);
        setIsProcessing(false);
      } catch (error) {
        console.error('Error al procesar pago con método guardado:', error);
        setErrorMessage(error.message || 'Error al procesar el pago');
        setIsProcessing(false);
      }
      return;
    }

    // Validaciones para nuevo método
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      setErrorMessage('Número de tarjeta inválido (mínimo 13 dígitos)');
      setIsProcessing(false);
      registrarIntentoFallido();
      return;
    }

    if (!expiryDate || expiryDate.length < 5) {
      setErrorMessage('Fecha de expiración inválida (formato MM/YY)');
      setIsProcessing(false);
      registrarIntentoFallido();
      return;
    }

    const [mes, anio] = expiryDate.split('/');
    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt(anio, 10) + 2000;
    const fechaActual = new Date();
    const fechaTarjeta = new Date(anioNum, mesNum - 1);
    
    if (mesNum < 1 || mesNum > 12) {
      setErrorMessage('Mes inválido (debe ser 01-12)');
      setIsProcessing(false);
      registrarIntentoFallido();
      return;
    }
    
    if (fechaTarjeta < fechaActual) {
      setErrorMessage('La tarjeta está vencida');
      setIsProcessing(false);
      registrarIntentoFallido();
      return;
    }

    if (!cvc || cvc.length < 3) {
      setErrorMessage('CVC inválido (mínimo 3 dígitos)');
      setIsProcessing(false);
      registrarIntentoFallido();
      return;
    }

    if (!cardHolder || cardHolder.trim().length < 3) {
      setErrorMessage('Nombre del titular requerido');
      setIsProcessing(false);
      registrarIntentoFallido();
      return;
    }

    // Validar tarjeta con el backend
    const cardClean = cardNumber.replace(/\s/g, '');
    try {
      const deteccion = await detectarTarjeta(cardClean);
      
      if (!deteccion.valido) {
        setErrorMessage('Número de tarjeta inválido (no pasa validación Luhn)');
        setIsProcessing(false);
        registrarIntentoFallido();
        return;
      }
      
      // Guardar datos temporalmente y mostrar modal
      setDatosMetodoTemp({
        numero: cardClean,
        marca: deteccion.marca,
        tipo: deteccion.tipo,
        titular: cardHolder,
        expiracion: `${mes}/20${anio}`,
        cvc
      });
      
      setModalGuardarMetodo(true);
      setIsProcessing(false);
      return;
      
    } catch (error) {
      console.error('Error al validar tarjeta:', error);
      setErrorMessage('Error al validar la tarjeta. Inténtalo de nuevo.');
      setIsProcessing(false);
      registrarIntentoFallido();
      return;
    }

    // Este código ya no debería ejecutarse porque el modal interrumpe el flujo
  };

  // Función para procesar el pago (con o sin guardar método)
  const procesarPago = async (guardarMetodo = false) => {
    setIsProcessing(true);
    setModalGuardarMetodo(false);
    
    try {
      // Si el usuario quiere guardar el método, guardarlo primero
      if (guardarMetodo && datosMetodoTemp) {
        try {
          await crearMetodoPago({
            tipo: datosMetodoTemp.tipo,
            numero_completo: datosMetodoTemp.numero,
            marca: datosMetodoTemp.marca,
            nombre_titular: datosMetodoTemp.titular,
            fecha_expiracion: datosMetodoTemp.expiracion,
            es_predeterminado: guardarComoDefault
          });
          
          setSuccessMessage('Método de pago guardado exitosamente');
        } catch (error) {
          console.error('Error al guardar método:', error);
          // Continuar con el pago aunque falle el guardado
        }
      }
      
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Confirmando pago con ID:', paymentIntentId);
      const resultado = await confirmarPago(paymentIntentId);
      
      // Obtener datos del método usado
      let cardBrand = 'Tarjeta';
      let lastDigits = '****';
      
      if (metodoSeleccionado && !mostrarNuevoMetodo) {
        const metodo = metodosPago.find(m => m.id === metodoSeleccionado);
        if (metodo) {
          cardBrand = metodo.marca || metodo.banco || 'Tarjeta';
          lastDigits = metodo.ultimos_digitos || '****';
        }
      } else if (datosMetodoTemp) {
        cardBrand = datosMetodoTemp.marca || 'Tarjeta';
        lastDigits = datosMetodoTemp.numero.slice(-4);
      }
      
      // Guardar datos de transacción y mostrar modal
      setDatosTransaccion({
        cardBrand,
        lastDigits,
        amount: cancha.precio
      });
      
      // Resetear intentos fallidos en caso de éxito
      setIntentosFallidos(0);
      setBloqueado(false);
      setTiempoRestante(0);
      
      setMostrarTransaccionAprobada(true);
      setIsProcessing(false);
      
      // El modal manejará la navegación
    } catch (error) {
      console.error('Error al procesar pago:', error);
      setErrorMessage(error.message || 'Error al procesar el pago');
      setIsProcessing(false);
    }
  };
  
  // Función para cerrar modal de transacción y navegar
  const handleCerrarTransaccion = () => {
    setMostrarTransaccionAprobada(false);
    navigate('/confirmacion-reserva', {
      state: { 
        reserva: {
          ...reserva,
          pagado: true
        }, 
        cancha, 
        horario 
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Modal de transacción aprobada */}
      {mostrarTransaccionAprobada && datosTransaccion && (
        <TransactionApprovedModal
          show={mostrarTransaccionAprobada}
          cardBrand={datosTransaccion.cardBrand}
          lastDigits={datosTransaccion.lastDigits}
          amount={datosTransaccion.amount}
          onClose={handleCerrarTransaccion}
        />
      )}
      
      {/* Banner de modo simulación */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 flex items-start gap-3 shadow-lg border border-purple-400/30">
        <FaGraduationCap className="text-white text-4xl flex-shrink-0 mt-1 drop-shadow-md" />
        <div>
          <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-lg">
            Modo Simulación - Proyecto Académico
            <span className="text-xs bg-white/30 backdrop-blur-sm text-white px-3 py-1 rounded-full font-semibold">DEMO</span>
          </h3>
          <p className="text-sm text-purple-50 mb-3">
            Este es un sistema de pago <strong>completamente simulado</strong> para demostración académica. 
            No se procesarán cargos reales ni se conectará a Stripe.
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mt-2 border border-white/30">
            <p className="text-xs text-white font-semibold mb-2">Cualquier tarjeta válida es aceptada:</p>
            <ul className="text-xs text-purple-50 space-y-1 ml-4 list-disc">
              <li>Tarjeta Visa: <code className="bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded font-mono font-bold">4242 4242 4242 4242</code></li>
              <li>Mastercard: <code className="bg-white/30 backdrop-blur-sm px-2 py-0.5 rounded font-mono font-bold">5555 5555 5555 4444</code></li>
              <li>Fecha: MM/YY (cualquier fecha futura)</li>
              <li>CVC: Cualquier 3-4 dígitos</li>
              <li>Nombre: Cualquier nombre</li>
            </ul>
            <p className="text-xs text-green-200 mt-2 font-semibold">✅ El sistema valida automáticamente usando el algoritmo Luhn</p>
          </div>
        </div>
      </div>

      {/* Selección de método de pago */}
      {!loadingMetodos && metodosPago.length > 0 && (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl border border-slate-200 shadow-lg">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FaCreditCard className="text-indigo-600" />
            Selecciona un Método de Pago
          </h3>
          
          <div className="space-y-3 mb-4">
            {metodosPago.map((metodo) => (
              <button
                key={metodo.id}
                type="button"
                onClick={() => {
                  setMetodoSeleccionado(metodo.id);
                  setMostrarNuevoMetodo(false);
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  metodoSeleccionado === metodo.id
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {metodo.tipo === 'cuenta_bancaria' ? (
                      <CardBrandLogo brand={metodo.banco} size="md" />
                    ) : (
                      <CardBrandLogo brand={metodo.marca} size="md" />
                    )}
                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-2">
                        {metodo.marca || metodo.banco}
                        {metodo.es_predeterminado && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                            Predeterminado
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-600">
                        {metodo.tipo === 'cuenta_bancaria' ? 'Cuenta' : 'Tarjeta'} •••• {metodo.ultimos_digitos}
                      </p>
                      <p className="text-xs text-slate-500">{metodo.nombre_titular}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    metodoSeleccionado === metodo.id
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-slate-300'
                  }`}>
                    {metodoSeleccionado === metodo.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <button
            type="button"
            onClick={() => {
              setMostrarNuevoMetodo(!mostrarNuevoMetodo);
              setMetodoSeleccionado(null);
            }}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-semibold ${
              mostrarNuevoMetodo
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
            }`}
          >
            <FaPlus className="text-sm" />
            {mostrarNuevoMetodo ? 'Usar método guardado' : 'Agregar nuevo método de pago'}
          </button>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/metodos-pago')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium underline"
            >
              Administrar métodos de pago
            </button>
          </div>
        </div>
      )}

      {/* Formulario para nuevo método o si no hay métodos guardados */}
      {(mostrarNuevoMetodo || metodosPago.length === 0) && (
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
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all shadow-sm hover:border-blue-400"
                required
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Ingresa los 16 dígitos de tu tarjeta
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
      )}

      {errorMessage && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-rose-600 to-red-600 rounded-2xl p-5 shadow-2xl border-2 border-red-400/50 animate-scaleIn">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-rose-400/20"></div>
          <div className="relative z-10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                {bloqueado ? (
                  <FaLock className="w-6 h-6 text-white" />
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-base mb-1">
                  {bloqueado ? '⚠️ Sistema Bloqueado' : 'Error de Validación'}
                </p>
                <p className="text-white/95 text-sm">{errorMessage}</p>
                {bloqueado && (
                  <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-semibold">Tiempo de espera:</span>
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10">
                          <svg className="transform -rotate-90 w-10 h-10">
                            <circle
                              cx="20"
                              cy="20"
                              r="16"
                              stroke="rgba(255,255,255,0.3)"
                              strokeWidth="3"
                              fill="none"
                            />
                            <circle
                              cx="20"
                              cy="20"
                              r="16"
                              stroke="white"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 16}`}
                              strokeDashoffset={`${2 * Math.PI * 16 * (1 - tiempoRestante / 10)}`}
                              className="transition-all duration-1000"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{tiempoRestante}</span>
                          </div>
                        </div>
                        <span className="text-white text-sm">segundos</span>
                      </div>
                    </div>
                  </div>
                )}
                {!bloqueado && intentosFallidos > 0 && (
                  <p className="text-yellow-200 text-xs mt-2 font-semibold">
                    ⚠️ Intentos fallidos: {intentosFallidos}/3
                  </p>
                )}
              </div>
            </div>
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
        disabled={isProcessing || bloqueado || !paymentIntentId || (!metodoSeleccionado && !mostrarNuevoMetodo && metodosPago.length > 0)}
        className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all transform shadow-xl ${
          isProcessing || bloqueado || (!metodoSeleccionado && !mostrarNuevoMetodo && metodosPago.length > 0)
            ? 'bg-slate-400 cursor-not-allowed opacity-60'
            : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 active:scale-[0.98] hover:shadow-2xl hover:scale-[1.02]'
        }`}
      >
        {bloqueado ? (
          <span className="flex items-center justify-center gap-3">
            <FaLock className="text-xl" />
            Bloqueado - Espera {tiempoRestante}s
          </span>
        ) : isProcessing ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Procesando pago simulado...
          </span>
        ) : (
          `Pagar ${formatearPrecio(cancha.precio)} (SIMULADO)`
        )}
      </button>

      <p className="text-xs text-center text-slate-600 leading-relaxed bg-amber-50 border border-amber-200 rounded-xl p-3">
        Al hacer clic en "Pagar", confirmas esta reserva. <br/>
        <strong className="text-amber-800">Este es un pago simulado para demostración académica.</strong><br/>
        No se realizarán cargos reales a ninguna tarjeta.
      </p>

      {/* Modal para guardar método de pago */}
      {modalGuardarMetodo && datosMetodoTemp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <FaSave className="text-indigo-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Guardar Método de Pago</h3>
                <p className="text-sm text-slate-600">Para futuras compras más rápidas</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-slate-700 mb-3">
                ¿Deseas guardar este método de pago para tus próximas reservas?
              </p>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <FaCreditCard className="text-indigo-600 text-2xl" />
                <div>
                  <p className="font-bold text-slate-800">
                    {datosMetodoTemp.marca || 'Tarjeta'}
                  </p>
                  <p className="text-sm text-slate-600">
                    •••• {datosMetodoTemp.numero.slice(-4)}
                  </p>
                  <p className="text-xs text-slate-500">{datosMetodoTemp.titular}</p>
                </div>
              </div>

              <label className="flex items-center gap-3 mt-4 p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors">
                <input
                  type="checkbox"
                  checked={guardarComoDefault}
                  onChange={(e) => setGuardarComoDefault(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Establecer como método predeterminado
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => procesarPago(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
              >
                No Guardar
              </button>
              <button
                type="button"
                onClick={() => procesarPago(true)}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg"
              >
                Guardar y Pagar
              </button>
            </div>
          </div>
        </div>
      )}
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
