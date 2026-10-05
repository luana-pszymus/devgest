const express = require("express");
const router = express.Router();

const resumoController = require("../controllers/resumoController");

const autenticar = require("../middleware/authMiddleware");

router.use(autenticar);

router.get("/inquilinos", resumoController.listarResumoInquilinos);

module.exports = router;
