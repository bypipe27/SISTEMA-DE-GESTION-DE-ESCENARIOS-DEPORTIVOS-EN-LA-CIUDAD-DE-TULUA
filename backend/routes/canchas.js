

// const express = require("express");
// const router = express.Router();const {
//   obtenerCanchas,
//   ProviderListCanchas,
//   ProviderCreateCancha,
//   ProviderUpdateCancha,
//   ProviderDeleteCancha,
// } = require("../controllers/canchasController");

// // listado público
// router.get("/", obtenerCanchas);

// // provider: solo accesible con token (role provider)
// router.get("/provider", ProviderListCanchas);
// router.post("/provider", ProviderCreateCancha);
// router.put("/provider/:id", ProviderUpdateCancha);
// router.delete("/provider/:id", ProviderDeleteCancha);

// module.exports = router;


// const express = require("express");
// const router = express.Router();const {
//   obtenerCanchas,
//   ProviderListCanchas,
//   ProviderCreateCancha,
//   ProviderUpdateCancha,
//   ProviderDeleteCancha,
// } = require("../controllers/canchasController");

// // listado público
// router.get("/", obtenerCanchas);

// // provider: solo accesible con token (role provider)
// router.get("/provider", ProviderListCanchas);
// router.post("/provider", ProviderCreateCancha);
// router.put("/provider/:id", ProviderUpdateCancha);
// router.delete("/provider/:id", ProviderDeleteCancha);

// module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { obtenerCanchas, ProviderListCanchas, ProviderCreateCancha, ProviderUpdateCancha, ProviderDeleteCancha } = require("../controllers/canchasController");

router.get("/", obtenerCanchas);
router.get("/provider", auth, ProviderListCanchas);
router.post("/provider", auth, ProviderCreateCancha);
router.put("/provider/:id", auth, ProviderUpdateCancha);
router.delete("/provider/:id", auth, ProviderDeleteCancha);

module.exports = router;