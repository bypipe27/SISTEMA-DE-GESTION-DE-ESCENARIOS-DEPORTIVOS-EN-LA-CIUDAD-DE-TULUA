const express = require("express");
const router = express.Router();
// Importamos los controladores relacionados a reservas.
// Añadimos aquí 'cancelReserva' (función que implementa la cancelación/eliminación
// de una reserva por su id) para exponerla en una ruta RESTful.
const { availability, createReserva, cancelReserva } = require("../controllers/reservasController"); 

// Ruta: GET /api/reservas/cancha/:id/availability
// - Devuelve los slots disponibles/reservados/bloqueados para una cancha en una fecha.
// - Parámetros: :id (id de la cancha) y query ?date=YYYY-MM-DD&slotMinutes=60
router.get("/cancha/:id/availability", availability);

// Ruta: POST /api/reservas
// - Crea una nueva reserva.
// - Body: { cancha_id, date, start, end, cliente_nombre, cliente_telefono, metodo_pago, total }
router.post("/", createReserva);

// Ruta: DELETE /api/reservas/:id
// - Cancela (elimina) la reserva cuyo id se pasa en la URL.
// - Respuesta: { success: true, reserva: <fila_eliminada> } o 404 si no existe.
// - Nota: actualmente es una eliminación física en BD. Si prefieres mantener historial,
//   cambiar a soft-delete (columna cancelada) sería recomendable.
router.delete("/:id", cancelReserva);

module.exports = router;