const express = require("express");
const router = express.Router();

const kitnetController = require("../controllers/kitnetController");

router.get("/listar", kitnetController.listarKitnet);
router.get("/listar/:id", kitnetController.listarKitnetId);
router.post("/", kitnetController.cadastrarKitnet);
router.put("/:id", kitnetController.atualizarKitnet);
router.delete("/:id", kitnetController.excluirKitnet);

module.exports = router;
