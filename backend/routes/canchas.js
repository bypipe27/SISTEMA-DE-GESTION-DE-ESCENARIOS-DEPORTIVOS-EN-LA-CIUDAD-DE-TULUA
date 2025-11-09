const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { obtenerCanchaPorId, obtenerCanchas, ProviderListCanchas, ProviderCreateCancha, ProviderUpdateCancha, ProviderDeleteCancha } = require("../controllers/canchasController");

router.get("/", obtenerCanchas);
router.get("/provider", auth, ProviderListCanchas);
router.post("/provider", auth, ProviderCreateCancha);
router.put("/provider/:id", auth, ProviderUpdateCancha);
router.delete("/provider/:id", auth, ProviderDeleteCancha);
router.get("/:id", obtenerCanchaPorId);

module.exports = router;