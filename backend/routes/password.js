const express = require("express");
const router = express.Router();
const {
  solicitarResetPassword,
  verificarTokenReset,
  resetearPassword,
} = require("../controllers/passwordController");

router.post("/forgot-password", solicitarResetPassword);
router.post("/verify-reset-token", verificarTokenReset);
router.post("/reset-password", resetearPassword);

module.exports = router;