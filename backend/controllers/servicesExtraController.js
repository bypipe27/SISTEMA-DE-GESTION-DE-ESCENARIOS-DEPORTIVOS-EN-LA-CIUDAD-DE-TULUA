const {
  crearServicioExtra,
  obtenerServiciosPorCancha,
  obtenerServiciosPorPropietario,
  obtenerServicioExtraPorId,
  actualizarServicioExtra,
  eliminarServicioExtra
} = require("../models/servicesExtraModel");


async function listarServiciosPorCancha(req, res) {
  try {
    const canchaId = Number(req.params.canchaId);
    if (!canchaId) return res.status(400).json({ error: "ID de cancha inválido" });
   
    const servicios = await obtenerServiciosPorCancha(canchaId);
    return res.json(servicios);
  } catch (err) {
    console.error('Error obteniendo servicios por cancha:', err);
    return res.status(500).json({ error: "Error obteniendo servicios extra" });
  }
}


async function providerListarServicios(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "No autorizado" });
   
    const servicios = await obtenerServiciosPorPropietario(userId);
    return res.json(servicios);
  } catch (err) {
    console.error('Error listando servicios del proveedor:', err);
    return res.status(500).json({ error: "Error listando servicios" });
  }
}


async function providerCrearServicio(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "No autorizado" });
   
    const { cancha_id, tipo, nombre, descripcion, precio, duracion_minutos, requiere_anticipacion_horas } = req.body;
   
    if (!cancha_id || !tipo || !nombre) {
      return res.status(400).json({ error: "cancha_id, tipo y nombre son obligatorios" });
    }


    const tiposPermitidos = ['arbitraje', 'premiacion', 'celebracion'];
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({ error: "Tipo de servicio no válido" });
    }
   
    const db = require("../db");
    const ownerCheck = await db.query(
      "SELECT propietario_id FROM canchas WHERE id = $1 LIMIT 1",
      [cancha_id]
    );
   
    if (!ownerCheck.rows.length || Number(ownerCheck.rows[0].propietario_id) !== Number(userId)) {
      return res.status(403).json({ error: "No eres propietario de esta cancha" });
    }
   
    const servicio = await crearServicioExtra({
      propietario_id: userId,
      cancha_id: Number(cancha_id),
      tipo,
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      precio: precio ? Number(precio) : null,
      duracion_minutos: duracion_minutos ? Number(duracion_minutos) : 60,
      requiere_anticipacion_horas: requiere_anticipacion_horas ? Number(requiere_anticipacion_horas) : 24
    });
   
    return res.status(201).json({ servicio });
  } catch (err) {
    console.error('Error creando servicio:', err);
    return res.status(500).json({ error: "Error creando servicio: " + err.message });
  }
}


async function providerObtenerServicio(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "No autorizado" });
   
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });
   
    const servicio = await obtenerServicioExtraPorId(id);
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });
   
    if (Number(servicio.propietario_id) !== Number(userId)) {
      return res.status(403).json({ error: "No autorizado para este servicio" });
    }
   
    return res.json(servicio);
  } catch (err) {
    console.error('Error obteniendo servicio:', err);
    return res.status(500).json({ error: "Error obteniendo servicio" });
  }
}


async function providerActualizarServicio(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "No autorizado" });
   
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });
   
    const servicioExistente = await obtenerServicioExtraPorId(id);
    if (!servicioExistente) return res.status(404).json({ error: "Servicio no encontrado" });
   
    if (Number(servicioExistente.propietario_id) !== Number(userId)) {
      return res.status(403).json({ error: "No autorizado para este servicio" });
    }


    const { tipo } = req.body;
    if (tipo) {
      const tiposPermitidos = ['arbitraje', 'premiacion', 'celebracion'];
      if (!tiposPermitidos.includes(tipo)) {
        return res.status(400).json({ error: "Tipo de servicio no válido" });
      }
    }
   
    const servicio = await actualizarServicioExtra(id, req.body);
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });
   
    return res.json({ servicio });
  } catch (err) {
    console.error('Error actualizando servicio:', err);
    return res.status(500).json({ error: "Error actualizando servicio" });
  }
}


async function providerEliminarServicio(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "No autorizado" });
   
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });
   
    const servicioExistente = await obtenerServicioExtraPorId(id);
    if (!servicioExistente) return res.status(404).json({ error: "Servicio no encontrado" });
   
    if (Number(servicioExistente.propietario_id) !== Number(userId)) {
      return res.status(403).json({ error: "No autorizado para este servicio" });
    }


    const db = require("../db");
    const reservasConServicio = await db.query(
      "SELECT COUNT(*)::int as total FROM reserva_servicios_extra WHERE servicio_extra_id = $1",
      [id]
    );
   
    const totalReservas = (reservasConServicio.rows && reservasConServicio.rows[0] && Number(reservasConServicio.rows[0].total)) || 0;
    if (totalReservas > 0) {
      return res.status(400).json({
        error: `No se puede eliminar: el servicio tiene ${totalReservas} reserva(s) asociada(s)`
      });
    }
   
    const eliminado = await eliminarServicioExtra(id);
    if (!eliminado) return res.status(404).json({ error: "No se pudo eliminar el servicio" });
   
    return res.json({ mensaje: "Servicio eliminado exitosamente" });
  } catch (err) {
    console.error('Error eliminando servicio:', err);
    return res.status(500).json({ error: "Error eliminando servicio" });
  }
}


module.exports = {
  listarServiciosPorCancha,
  providerListarServicios,
  providerCrearServicio,
  providerObtenerServicio,
  providerActualizarServicio,
  providerEliminarServicio
};

