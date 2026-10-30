
const fs = require("fs/promises");

const Contrato = require("../models/contratoModel");
const Consumo = require("../models/consumoModel");
const Kitnet = require("../models/kitnetModel");

// Apaga a foto caso o consumo não seja registrado.
async function apagarFoto(req) {
  if (req.file) {
    try {
      await fs.unlink(req.file.path);
    } catch (erro) {
      console.error("Erro ao apagar foto:", erro);
    }
  }
}

exports.registrarConsumo = async (req, res) => {
  try {
    const { contrato_id, mes, ano, leitura_atual, preco_kwh } = req.body;

    if (!contrato_id || !mes || !ano || !leitura_atual || !preco_kwh) {
      await apagarFoto(req);

      return res.status(400).json({
        erro: "Todos os campos são obrigatórios.",
      });
    }

    const consumoExistente = await Consumo.findOne({
      where: { contrato_id, mes, ano },
    });

    if (consumoExistente) {
      await apagarFoto(req);

      return res.status(400).json({
        erro: "Já existe um consumo cadastrado para este mês.",
      });
    }

    const ultimoConsumo = await Consumo.findOne({
      where: { contrato_id },
      order: [
        ["ano", "DESC"],
        ["mes", "DESC"],
      ],
    });

    const leitura_anterior = ultimoConsumo
      ? Number(ultimoConsumo.leitura_atual)
      : 0;

    if (Number(leitura_atual) < leitura_anterior) {
      await apagarFoto(req);

      return res.status(400).json({
        erro: "A leitura atual não pode ser menor que a anterior.",
      });
    }

    const consumo_kwh = Number(leitura_atual) - leitura_anterior;

    const valor_energia = Number(
      consumo_kwh * Number(preco_kwh)
    ).toFixed(2);

    const contrato = await Contrato.findByPk(contrato_id);

    if (!contrato) {
      await apagarFoto(req);

      return res.status(404).json({
        erro: "Contrato não encontrado.",
      });
    }

    const kitnet = await Kitnet.findByPk(contrato.kitnet_id);

    if (!kitnet) {
      await apagarFoto(req);

      return res.status(404).json({
        erro: "Kitnet não encontrada.",
      });
    }

    const valor_aluguel = Number(kitnet.valor_aluguel);

    const valor_total = Number(
      valor_aluguel + Number(valor_energia)
    ).toFixed(2);

    // Caminho da foto associado ao consumo.
    const foto_url = req.file
      ? `/uploads/consumos/${req.file.filename}`
      : null;

    await Consumo.create({
      contrato_id,
      mes,
      ano,
      leitura_anterior,
      leitura_atual,
      consumo_kwh,
      preco_kwh,
      valor_energia,
      valor_aluguel,
      valor_total,
      foto_url,
    });

    return res.status(201).json({
      mensagem: "Consumo registrado com sucesso",
      foto_url,
    });
  } catch (err) {
    await apagarFoto(req);

    console.error(err);

    return res.status(500).json({
      erro: "Erro ao registrar consumo.",
    });
  }
};

exports.listarConsumos = async (req, res) => {
  try {
    const consumo = await Consumo.findAll({
      order: [
        ["ano", "DESC"],
        ["mes", "DESC"],
      ],
    });

    return res.json(consumo);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      erro: "Erro ao listar consumos.",
    });
  }
};

exports.excluirConsumo = async (req, res) => {
  try {
    const { id } = req.params;

    const consumo = await Consumo.findByPk(id);

    if (!consumo) {
      return res.status(404).json({
        erro: "Consumo não encontrado",
      });
    }

    // Apaga também a foto vinculada ao consumo.
    if (consumo.foto_url) {
      const caminhoFoto = require("path").join(
        __dirname,
        "../../",
        consumo.foto_url
      );

      try {
        await fs.unlink(caminhoFoto);
      } catch (erro) {
        console.error("Não foi possível apagar a foto:", erro);
      }
    }

    await consumo.destroy();

    return res.json({
      mensagem: "Consumo excluído com sucesso",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      erro: "Erro ao excluir consumo",
    });
  }
};
