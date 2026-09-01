const Contrato = require("../models/contratoModel");
const Consumo = require("../models/consumoModel");
const Kitnet = require("../models/kitnetModel");
const Inquilino = require("../models/inquilinoModel");
const Kitnet = require("../models/kitnetModel");

// LISTAR TODOS
exports.listarKitnet = async (req, res) => {
  try {
    const Kitnet = await Kitnet.findAll({});
    res.json(kitnet);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar kitnet");
  }
};

// LISTAR POR ID
exports.listarKitnetId = async (req, res) => {
  try {
    const { id } = req.params;

    const kitnet = await Kitnet.findByPk(id);

    if (!Kitnet) {
      return res.status(404).json({
        erro: "Kitnet não encontrado.",
      });
    }

    res.json(kitnet);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar kitnet.");
  }
};

// CADASTRAR
exports.cadastrarKitnet = async (req, res) => {
  try {
    const { numero, valor_aluguel } = req.body;

    if (!numero) {
      return res.status(400).json({
        erro: "O número é obrigatório",
      });
    }

    const novaKitnet = await Kitnet.create({
      numero,
      valor_aluguel,
    });

    res.status(201).json(novaKitnet);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao cadastrar kitnet",
      detalhes: error.message,
    });
  }
};

// ATUALIZAR
exports.atualizarKitnet = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, valor_aluguel } = req.body;

    const kitnet = await Kitnet.findByPk(id);

    if (!kitnet) {
      return res.status(404).json({
        erro: "Kitnet não encontrado",
      });
    }

    await kitnet.update({
      numero,
      valor_aluguel,
    });

    res.status(200).json(kitnet);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao atualizar kitnet",
      detalhes: error.message,
    });
  }
};

// EXCLUIR
exports.excluirKitnet = async (req, res) => {
  try {
    const { id } = req.params;

    const kitnet = await Kitnet.findByPk(id);

    if (!kitnet) {
      return res.status(404).json({
        erro: "Kitnet não encontrado",
      });
    }

    await kitnet.destroy();

    res.status(200).json({
      mensagem: "Kitnet excluída com sucesso",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao excluir kitnet",
      detalhes: error.message,
    });
  }
};
