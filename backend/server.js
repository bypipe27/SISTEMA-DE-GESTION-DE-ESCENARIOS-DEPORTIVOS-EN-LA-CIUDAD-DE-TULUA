const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
// reemplazamos app.use(cors()) por configuración controlada:
const FRONTEND_URL = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
const allowedOrigins = [
  FRONTEND_URL,
  "https://sistema-gestion-escenarios-deportivos.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // permitir peticiones sin origin (herramientas como curl/Postman)
    if (!origin) return callback(null, true);
    // permitir si está en la lista de orígenes permitidos
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // denegar en caso contrario (no pasar error para que CORS no rompa el preflight)
    console.warn(`CORS denied for origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true
}));;

app.use(express.json());
// ...existing code...
const usuariosRoutes = require("./routes/usuarios");
const canchasRoutes = require("./routes/canchas");
const reservasRoutes = require("./routes/reservas");
const passwordRoutes = require("./routes/password");  

app.use("/api/reservas", reservasRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/canchas", canchasRoutes);
app.use("/api/password", passwordRoutes);  

// servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));