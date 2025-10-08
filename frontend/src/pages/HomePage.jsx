import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h1>⚽ Bienvenido al Sistema de Gestión de Canchas</h1>
      <p>Reserva, administra y lleva el control de tus escenarios deportivos.</p>

      <div style={{ marginTop: "40px" }}>
        <Link to="/login">
          <button style={{ marginRight: "20px", padding: "10px 20px" }}>
            Iniciar Sesión
          </button>
        </Link>

        <Link to="/register">
          <button style={{ padding: "10px 20px" }}>
            Registrarse
          </button>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
