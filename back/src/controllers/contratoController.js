const Contrato = require("../models/contratoModel");

exports.listarContratos = async (req, res) => {
  try {
    const contratos = await Contrato.findAll();

    res.json(contratos);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar contratos");
  }
};

// Buscar contrato por ID
exports.listarContratoId = async (req, res) => {
  try {
    const { id } = req.params;

    const contrato = await Contrato.findByPk(id);

    if (!contrato) {
      return res.status(404).send("Contrato não encontrado");
    }

    res.json(contrato);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar contrato");
  }
};

// Cadastrar contrato
exports.cadastrarContrato = async (req, res) => {
  try {
    const { inquilinoId, kitnetId, dataInicio, dataFim } = req.body;

    const contrato = await Contrato.create({
      inquilino_id: inquilinoId,
      kitnet_id: kitnetId,
      data_inicio: dataInicio,
      data_fim: dataFim,
    });

    res.status(201).json(contrato);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: "Erro ao cadastrar contrato",
      detalhes: err.message,
    });
  }
};

// Editar contrato
exports.atualizarContrato = async (req, res) => {
  try {
    const { id } = req.params;

    const { inquilinoId, kitnetId, dataInicio, dataFim } = req.body;

    const contrato = await Contrato.findByPk(id);

    if (!contrato) {
      return res.status(404).send("Contrato não encontrado");
    }

    await contrato.update({
      inquilino_id: inquilinoId,
      kitnet_id: kitnetId,
      data_inicio: dataInicio,
      data_fim: dataFim,
    });

    res.json({
      mensagem: "Contrato atualizado com sucesso",
      contrato,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: "Erro ao atualizar contrato",
      detalhes: err.message,
    });
  }
};

// Excluir contrato
exports.excluirContrato = async (req, res) => {
  try {
    const { id } = req.params;

    const contrato = await Contrato.findByPk(id);

    if (!contrato) {
      return res.status(404).send("Contrato não encontrado");
    }

    await contrato.destroy();

    res.json({
      mensagem: "Contrato excluído com sucesso",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: "Erro ao excluir contrato",
      detalhes: err.message,
    });
  }
};
