import React from "react";
import { Link } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";

function NavBar() {
  return (
    <nav className="w-full py-4 px-10 flex justify-between items-center bg-green-900/80 backdrop-blur-md fixed top-0 z-50 shadow-lg text-white">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FaFutbol className="text-green-300 text-3xl animate-pulse" />
        <span>SISTEMA DE GESTION DE ESCENARIOS DEPORTIVOS</span>
      </h1>

      <div className="space-x-6 text-lg">
        <Link to="/" className="hover:text-green-300 transition">Inicio</Link>
        <Link to="/register-provider" className="hover:text-green-300 transition">Registro para proveedor</Link>
      </div>
    </nav>
  );
}

export default NavBar; 