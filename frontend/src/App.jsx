import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VerifyCodePage from "./pages/VerifyCodePage"; 
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CanchaDetailsPage from "./pages/CanchaDetailsPage";
import ReservaPage from "./pages/ReservaPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; // ✅ NUEVO
import ResetPasswordPage from "./pages/ResetPasswordPage";   // ✅ NUEVO

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyCodePage />} /> {/* ✅ Nueva ruta */}
        <Route path="/cancha/:id" element={<CanchaDetailsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} /> {/* ✅ Nueva ruta */}
        <Route path="/reservar/:id" element={<ReservaPage/>} />     
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* ✅ NUEVO */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />   {/* ✅ NUEVO */}
      </Routes>
    </Router>
  );
}



export default App;

