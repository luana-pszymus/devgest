const express = require("express");
const router = express.Router();

const resumoController = require("../controllers/resumoController");

router.get("/inquilinos", resumoController.listarResumoInquilinos);

module.exports = router;
