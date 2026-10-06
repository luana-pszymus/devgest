const express = require("express");

const router = express.Router();

const loginController = require("../controllers/loginController");

router.post("/login", loginController.login);

router.post("/login/enviar-codigo", loginController.enviarCodigo);

router.post("/login/verificar-codigo", loginController.verificarCodigo);

module.exports = router;
