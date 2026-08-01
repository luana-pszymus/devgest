const Contrato = require("../models/contratoModel");
const Consumo = require("../models/consumoModel");
const Kitnet = require("../models/kitnetModel");

exports.registrarConsumo = async (req, res) => {
  console.log("Body recebido:", req.body);

  try {
    const { contrato_id, mes, ano, leitura_atual, preco_kwh } = req.body;

    if (!contrato_id || !mes || !ano || !leitura_atual || !preco_kwh) {
      return res.status(400).json({
        erro: "Todos os campos são obrigatórios.",
      });
    }

    const consumoExistente = await Consumo.findOne({
      where: {
        contrato_id,
        mes,
        ano,
      },
    });

    if (consumoExistente) {
      return res.status(400).json({
        erro: "Já existe um consumo cadastrado para este mês.",
      });
    }

    const ultimoConsumo = await Consumo.findOne({
      // consultar o ultimo consumo
      where: {
        contrato_id,
      },
      order: [
        ["ano", "DESC"],
        ["mes", "DESC"],
      ],
    });

    const leitura_anterior = ultimoConsumo // calcula o consumo
      ? Number(ultimoConsumo.leitura_atual)
      : 0;

    if (Number(leitura_atual) < leitura_anterior) {
      return res.status(400).json({
        erro: "A leitura atual não pode ser menor que a anterior.",
      });
    }

    const consumo_kwh = Number(leitura_atual) - leitura_anterior; // calcula a energia em kwh

    const valor_energia = Number(consumo_kwh * Number(preco_kwh)).toFixed(2); // calcula o valor da energia

    const contrato = await Contrato.findByPk(
      // busca o contrato pelo id
      contrato_id,
    );

    const kitnet = await Kitnet.findByPk(contrato.kitnet_id);

    const valor_aluguel = Number(kitnet.valor_aluguel);

    const valor_total = Number(valor_aluguel + Number(valor_energia)).toFixed(
      2,
    ); // soma o valo de aluguel mais o valo da energia consumida

    console.log({
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
    });

    console.log("Contrato:", contrato);
    console.log("Kitnet:", kitnet);
    console.log("Valor aluguel:", valor_aluguel);

    await Consumo.create({
      // registra na tabela
      contrato_id,

      mes,
      ano,

      leitura_anterior: leitura_anterior,
      leitura_atual: leitura_atual,

      consumo_kwh: consumo_kwh,

      preco_kwh: preco_kwh,

      valor_energia: valor_energia,

      valor_aluguel: valor_aluguel,

      valor_total: valor_total,
    });

    res.status(201).json({
      mensagem: "Consumo registrado com sucesso",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao registrar consumo");
  }
};

exports.listarConsumos = async (req, res) => {
  const consumo = await Consumo.findAll({
    order: [
      ["ano", "DESC"],
      ["mes", "DESC"],
    ],
  });

  res.json(consumo);
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

    await consumo.destroy();

    res.json({
      mensagem: "Consumo excluído com sucesso",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao excluir consumo");
  }
};
