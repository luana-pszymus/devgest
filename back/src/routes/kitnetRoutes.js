const express = require("express");
const router = express.Router();
const autenticar = require("../middleware/authMiddleware");

const kitnetController = require("../controllers/kitnetController");

router.use(autenticar);

router.get("/listar", kitnetController.listarKitnet);
router.get("/listar/:id", kitnetController.listarKitnetId);
router.post("/", kitnetController.cadastrarKitnet);
router.put("/:id", kitnetController.atualizarKitnet);
router.delete("/:id", kitnetController.excluirKitnet);

module.exports = router;
