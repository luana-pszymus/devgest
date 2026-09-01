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

//busca contrato por id
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

//cadastrar contrato
exports.cadastrarContrato = async (req, res) => {
  try {
    const { inquilinoId, kitnetId, dataInicio, dataFim } = req.body;

    const contrato = await Contrato.create({
      inquilinoId,
      kitnetId,
      dataInicio,
      dataFim,
    });

    res.status(201).json(contrato);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao cadastrar contrato");
  }
};

//editar contrato
exports.atualizarContrato = async (req, res) => {
  try {
    const { id } = req.params;
    const { inquilinoId, kitnetId, dataInicio, dataFim } = req.body;

    const contrato = await Contrato.findByPk(id);

    if (!contrato) {
      return res.status(404).send("Contrato não encontrado");
    }

    await contrato.update({
      inquilinoId,
      kitnetId,
      dataInicio,
      dataFim,
    });

    res.json({
      mensagem: "Contrato atualizado com sucesso",
      contrato,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar contrato");
  }
};

//excluir contrato
exports.excluirContrato = async (req, res) => {
  try {
    const { id } = req.params;
    const contrato = await Contrato.findByPk(id);

    if (!contrato) {
      return res.status(404).send("Contrato não encontrado");
    }

    await contrato.destroy();
    res.json({ mensagem: "Contrato excluído com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao excluir contrato");
  }
};
