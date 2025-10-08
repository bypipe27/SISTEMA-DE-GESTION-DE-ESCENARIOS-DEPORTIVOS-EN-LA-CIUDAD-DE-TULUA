import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-600 to-green-900 text-white">
      <h1 className="text-4xl font-bold mb-4 text-center">
        ⚽ Bienvenido al Sistema de Gestión de Canchas
      </h1>
      <p className="text-lg text-center max-w-xl mb-10 opacity-90">
        Administra, reserva y lleva el control de tus escenarios deportivos de forma rápida y ordenada.
      </p>

      <div className="flex gap-6">
        <Link to="/login">
          <Button color="white">Iniciar Sesión</Button>
        </Link>

        <Link to="/register">
          <Button color="green">Registrarse</Button>
        </Link>
      </div>

      <footer className="mt-20 text-sm text-gray-200">
        © 2025 Sistema de Gestión de Canchas — Proyecto académico
      </footer>
    </div>
  );
}

export default HomePage;

