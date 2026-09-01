const express = require("express");

const router = express.Router();

const contratoController = require("../controllers/contratoController");

router.get("/", contratoController.listarContratos);
router.get("/:id", contratoController.buscarContratoPorId);
router.post("/", contratoController.cadastrarContrato);
router.put("/:id", contratoController.atualizarContrato);
router.delete("/:id", contratoController.excluirContrato);

module.exports = router;
