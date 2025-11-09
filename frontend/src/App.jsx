import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VerifyCodePage from "./pages/VerifyCodePage"; 
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CanchasDetailsPage from "./pages/CanchasDetailsPage";
import ReservaPage from "./pages/ReservaPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; 
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ConfirmacionReservaPage from "./pages/ConfirmacionReservaPage";
import MisReservasPage from "./pages/MisReservaspage";
import RegisterProvider from "./pages/RegisterProvider";
import ProviderDashboard from "./pages/DashboardProvider"; 
import ProviderReportes from "./pages/ProviderReportes";
import ProviderReservas from "./pages/ProviderReservas";
import CanchasManager from "./pages/CanchasMananger";


function App() {
  // `import.meta.env.BASE_URL` viene de Vite y será '/' en dev
  // y '/<repo>/' en producción si lo configuraste en `vite.config.js`.
  // Usar este basename permite que React Router funcione tanto
  // en localhost como en GitHub Pages sin cambiar el código.
  const basename = import.meta.env.BASE_URL || '/'

  return (
    <Router basename={basename}>
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
        <Route path="/reportes-provider" element={<ProviderReportes />} />
        <Route path="/reservas-provider" element={<ProviderReservas />} />
        <Route path="/canchas-manager" element={<CanchasManager />} />
        <Route path="/canchas-details/:id" element={<CanchasDetailsPage />} />
      </Routes>
    </Router>
  );
}



export default App;

