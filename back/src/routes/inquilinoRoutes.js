const express = require("express");
const router = express.Router();

const inquilinoController = require("../controllers/inquilinoController");

router.get("/listar", inquilinoController.listarInquilinos);
router.get("/listar/:id", inquilinoController.listarInquilinoId);
router.post("/", inquilinoController.cadastrarInquilino);
router.put("/:id", inquilinoController.atualizarInquilino);
router.delete("/:id", inquilinoController.excluirInquilino);

module.exports = router;
