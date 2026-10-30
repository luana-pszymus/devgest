const express = require("express");
const router = express.Router();

const autenticar = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadConsumo");
const consumoController = require("../controllers/consumoController");

router.use(autenticar);

// Recebe a foto junto com os dados do consumo.
router.post(
  "/registrar",
  upload.single("foto"),
  consumoController.registrarConsumo
);

router.get("/listar", consumoController.listarConsumos);
router.delete("/:id", consumoController.excluirConsumo);

module.exports = router;
