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


// servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
