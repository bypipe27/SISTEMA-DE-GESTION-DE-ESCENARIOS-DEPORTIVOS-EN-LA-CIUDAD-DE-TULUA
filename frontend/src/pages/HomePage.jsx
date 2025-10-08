import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFutbol } from "react-icons/fa";
import Button from "../components/Button"; // <-- añadido
import NavBar from "../components/NavBar";
 
function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-900 text-white flex flex-col">
      {/* Barra de navegación */}
      <NavBar /> 

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
            <Button color="white">Iniciar Sesión</Button>  {/* <-- usa Button */}
          </Link>

          <Link to="/register">
            <Button color="green">Crear Cuenta</Button>     {/* <-- usa Button */}
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
