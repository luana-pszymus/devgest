const Contrato = require("../models/contratoModel");
const Consumo = require("../models/consumoModel");
const Kitnet = require("../models/kitnetModel");
const Inquilino = require("../models/inquilinoModel");

// LISTAR TODOS
exports.listarInquilinos = async (req, res) => {
  try {
    const inquilinos = await Inquilino.findAll({});
    res.json(inquilinos);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar inquilinos");
  }
};

// LISTAR POR ID
exports.listarInquilinoId = async (req, res) => {
  try {
    const { id } = req.params;

    const inquilino = await Inquilino.findByPk(id);

    if (!inquilino) {
      return res.status(404).json({
        erro: "Inquilino não encontrado.",
      });
    }

    res.json(inquilino);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar inquilino.");
  }
};

// CADASTRAR
exports.cadastrarInquilino = async (req, res) => {
  try {
    const { nome, telefone, email } = req.body;

    if (!nome) {
      return res.status(400).json({
        erro: "O nome é obrigatório",
      });
    }

    const novoInquilino = await Inquilino.create({
      nome,
      telefone,
      email,
    });

    res.status(201).json(novoInquilino);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao cadastrar inquilino",
      detalhes: error.message,
    });
  }
};

// ATUALIZAR
exports.atualizarInquilino = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email } = req.body;

    const inquilino = await Inquilino.findByPk(id);

    if (!inquilino) {
      return res.status(404).json({
        erro: "Inquilino não encontrado",
      });
    }

    await inquilino.update({
      nome,
      telefone,
      email,
    });

    res.status(200).json(inquilino);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao atualizar inquilino",
      detalhes: error.message,
    });
  }
};

// EXCLUIR
exports.excluirInquilino = async (req, res) => {
  try {
    const { id } = req.params;

    const inquilino = await Inquilino.findByPk(id);

    if (!inquilino) {
      return res.status(404).json({
        erro: "Inquilino não encontrado",
      });
    }

    await inquilino.destroy();

    res.status(200).json({
      mensagem: "Inquilino excluído com sucesso",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao excluir inquilino",
      detalhes: error.message,
    });
  }
};
