const express = require("express");
const router = express.Router();

const consumoController = require("../controllers/consumoController");

router.post("/registrar", consumoController.registrarConsumo);
router.get("/listar", consumoController.listarConsumos);
router.delete("/:id", consumoController.excluirConsumo);

module.exports = router;
