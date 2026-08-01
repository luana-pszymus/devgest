const Contrato = require("../models/contratoModel");
const Inquilino = require("../models/inquilinoModel");
const Kitnet = require("../models/kitnetModel");
const Consumo = require("../models/consumoModel");

exports.listarContrato = async (req, res) => {
  try {
    const contrato = await Contrato.findAll();
    console.log("RESULTADO:", contrato);
    res.json(contrato);
  } catch (err) {
    res.status(500).send("Erro ao buscar contratos");
  }
};

exports.listarInquilino = async (req, res) => {
  try {
    const inquilino = await Inquilino.findAll();
    res.json(inquilino);
  } catch (err) {
    res.status(500).send("Erro ao buscar inquilinos");
  }
};

exports.listarKitnet = async (req, res) => {
  try {
    const kitnet = await Kitnet.findAll();
    res.json(kitnet);
  } catch (err) {
    res.status(500).send("Erro ao buscar kitnets");
  }
};

exports.listarConten = async (req, res) => {
  try {
    const contratos = await Contrato.findAll({
      include: [
        {
          model: Inquilino,
        },
        {
          model: Kitnet,
        },
      ],
    });

    res.json(contratos);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar contratos");
  }
};
