const express = require("express");
const router = express.Router();
const autenticar = require("../middleware/authMiddleware");

const consumoController = require("../controllers/consumoController");

router.use(autenticar);

router.post("/registrar", consumoController.registrarConsumo);
router.get("/listar", consumoController.listarConsumos);
router.delete("/:id", consumoController.excluirConsumo);

module.exports = router;
