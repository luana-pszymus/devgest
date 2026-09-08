const Contrato = require("../models/contratoModel");
const Consumo = require("../models/consumoModel");
const Kitnet = require("../models/kitnetModel");
const Inquilino = require("../models/inquilinoModel");

exports.listarResumoInquilinos = async (req, res) => {
  try {
    const contratos = await Contrato.findAll({
      include: [
        {
          model: Inquilino,
          as: "inquilino",
        },
        {
          model: Kitnet,
          as: "kitnet",
        },
        {
          model: Consumo,
          as: "consumos",
        },
      ],
    });

    const resumo = contratos.map((contrato) => {
      const consumos = contrato.consumos || [];

      const consumoAtual =
        consumos.length > 0
          ? [...consumos].sort((a, b) => {
              if (b.ano !== a.ano) {
                return b.ano - a.ano;
              }

              return b.mes - a.mes;
            })[0]
          : null;

      return {
        inquilino_id: contrato.inquilino.id,
        nome: contrato.inquilino.nome,
        telefone: contrato.inquilino.telefone,
        email: contrato.inquilino.email,

        contrato_id: contrato.id,
        data_inicio: contrato.data_inicio,
        data_fim: contrato.data_fim,

        kitnet_id: contrato.kitnet.id,
        kitnet_numero: contrato.kitnet.numero,
        valor_aluguel: Number(contrato.kitnet.valor_aluguel),

        consumo: consumoAtual
          ? {
              mes: consumoAtual.mes,
              ano: consumoAtual.ano,
              leitura_anterior: Number(consumoAtual.leitura_anterior),
              leitura_atual: Number(consumoAtual.leitura_atual),
              consumo_kwh: Number(consumoAtual.consumo_kwh),
              preco_kwh: Number(consumoAtual.preco_kwh),
              valor_energia: Number(consumoAtual.valor_energia),
              valor_total: Number(consumoAtual.valor_total),
            }
          : null,
      };
    });

    res.json(resumo);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: "Erro ao buscar resumo dos inquilinos",
    });
  }
};
