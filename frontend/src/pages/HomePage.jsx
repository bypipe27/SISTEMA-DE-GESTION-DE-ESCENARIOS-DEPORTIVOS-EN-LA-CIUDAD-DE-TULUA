import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFutbol } from "react-icons/fa";

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-900 text-white flex flex-col">
      {/* Barra de navegación */}
      <nav className="w-full py-4 px-10 flex justify-between items-center bg-green-900/80 backdrop-blur-md fixed top-0 z-50 shadow-lg text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaFutbol className="text-green-300 text-3xl animate-pulse" />
          <span>SISTEMA DE GESTION DE ESCENARIOS DEPORTIVOS </span>
        </h1>

        <div className="space-x-6 text-lg">
          <Link to="/" className="hover:text-green-300 transition">Inicio</Link>
          <Link to="/login" className="hover:text-green-300 transition">Registro para cancha</Link>
        </div>
      </nav>

      {/* Sección principal */}
      <div className="flex-grow flex flex-col items-center justify-center text-center mt-20">
        {/* Balón con animación 3D */}
        <motion.div
          className="text-8xl mb-6"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        >
          <FaFutbol className="drop-shadow-lg" />
        </motion.div>

        <motion.h1
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
           Bienvenido al Sistema de Gestión de Canchas
        </motion.h1>

        <motion.p
          className="text-lg max-w-xl mb-10 opacity-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Registra tu cuenta para reservar ya mismo tu cancha favorita y disfruta del deporte. 
        </motion.p>

        {/* Botones de acción (aparecen al hacer scroll o esperar animación) */}
        <motion.div
          className="flex gap-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <Link to="/login">
            <button className="bg-white text-green-700 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-green-100 transition">
              Iniciar Sesión
            </button>
          </Link>

          <Link to="/register">
            <button className="bg-green-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-green-800 transition">
              Crear Cuenta
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-200 text-sm bg-green-800/30 backdrop-blur-sm">
        © 2025 Sistema de Gestión de Canchas — Proyecto académico
      </footer>
    </div>
  );
}

export default HomePage;
