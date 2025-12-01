const express = require("express");
const cors = require("cors");
require("dotenv").config();


const app = express();
const http = require('http');
const { Server } = require('socket.io');
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
// Stripe webhook requiere raw body, declararlo antes del json parser
app.use("/api/pagos/webhook", express.raw({ type: "application/json" }));


app.use(express.json());
// ...existing code...
const usuariosRoutes = require("./routes/usuarios");
const canchasRoutes = require("./routes/canchas");
const reservasRoutes = require("./routes/reservas");
const passwordRoutes = require("./routes/password");
const pagosRoutes = require("./routes/pagos");
const metodosPagoRoutes = require("./routes/metodosPago");
const serviciosExtraRoutes = require("./routes/servicesExtra");
const reviewsRoutes = require("./routes/reviews");




app.use("/api/servicios-extra", serviciosExtraRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/canchas", canchasRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/metodos-pago", metodosPagoRoutes);

// Rutas de reviews (reseñas)
app.use('/api', reviewsRoutes);


// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("Error en servidor:", err);
  res.status(500).json({
    error: "Error interno del servidor",
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});


// servidor con Socket.IO
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET','POST']
  }
});

// Exponer la instancia io en app para usar en controladores
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 Cliente Socket.IO conectado', socket.id);
  socket.on('disconnect', () => console.log('🔌 Cliente Socket.IO desconectado', socket.id));
});

server.listen(PORT, () => console.log(`✅ Servidor corriendo con Socket.IO en puerto ${PORT}`));