const Kitnet = require("./kitnetModel");
const Inquilino = require("./inquilinoModel");
const Contrato = require("./contratoModel");
const Consumo = require("./consumoModel");

Contrato.belongsTo(Kitnet, {
  foreignKey: "kitnet_id",
  as: "kitnet",
});

Contrato.belongsTo(Inquilino, {
  foreignKey: "inquilino_id",
  as: "inquilino",
});

Inquilino.hasMany(Contrato, {
  foreignKey: "inquilino_id",
  as: "contratos",
});

Kitnet.hasMany(Contrato, {
  foreignKey: "kitnet_id",
  as: "contratos",
});

Consumo.belongsTo(Contrato, {
  foreignKey: "contrato_id",
  as: "contrato",
});

Contrato.hasMany(Consumo, {
  foreignKey: "contrato_id",
  as: "consumos",
});

module.exports = {
  Contrato,
  Inquilino,
  Kitnet,
  Consumo,
};
