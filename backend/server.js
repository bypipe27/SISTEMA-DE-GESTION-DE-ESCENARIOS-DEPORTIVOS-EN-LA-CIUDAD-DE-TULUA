const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// rutas
const usuariosRoutes = require("./routes/usuarios");
const canchasRoutes = require("./routes/canchas");
const reservasRoutes = require("./routes/reservas");
const passwordRoutes = require("./routes/password");  


app.use("/api/reservas", reservasRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/canchas", canchasRoutes);
app.use("/api/password", passwordRoutes);  


// servir frontend estático (build de Vite -> dist)
const path = require("path");
const frontendDist = path.join(__dirname, "../frontend/dist"); // ajusta si tu carpeta se llama diferente
app.use(express.static(frontendDist));

// cualquier ruta que no sea /api/* devuelve index.html (SPA)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
