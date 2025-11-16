import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VerifyCodePage from "./pages/VerifyCodePage"; 
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CanchaDetailsPage from "./pages/CanchadetailsPage";
import ReservaPage from "./pages/ReservaPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; 
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ConfirmacionReservaPage from "./pages/ConfirmacionReservaPage";
import MisReservasPage from "./pages/MisReservasPage";
import RegisterProvider from "./pages/RegisterProvider";
import ProviderDashboard from "./pages/DashboardProvider"; 
import ProviderReservas from "./pages/ProviderReservas";
import CanchasManager from "./pages/CanchasMananger";


function FocusToMainOnNavigation() {
  // Hook que enfoca el landmark principal cuando cambia la ruta
  const location = useLocation();
  useEffect(() => {
    const main = document.getElementById("main");
    if (main) main.focus();
  }, [location.pathname]);
  return null;
}

function App() {
  return (
    <Router>
      {/* Landmark principal para lectores de pantalla y Lighthouse */}
      <main id="main" role="main" aria-label="Contenido principal" tabIndex={-1}>
        <FocusToMainOnNavigation />
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyCodePage />} /> {/* ✅ Nueva ruta */}
        <Route path="/cancha/:id" element={<CanchaDetailsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} /> {/* ✅ Nueva ruta */}
        <Route path="/reservar/:id" element={<ReservaPage/>} />     
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
        <Route path="/reset-password" element={<ResetPasswordPage />} />   
        <Route path="/confirmacion-reserva" element={<ConfirmacionReservaPage />} />
        <Route path="/mis-reservas" element={<MisReservasPage />} />
        <Route path="/register-provider" element={<RegisterProvider/>} />
        <Route path="/dashboard-provider" element={<ProviderDashboard />} />
        <Route path="/reservas-provider" element={<ProviderReservas />} />
        <Route path="/canchas-manager" element={<CanchasManager />} />
        </Routes>
      </main>
    </Router>
  );
}



export default App;

