const Kitnet = require("./kitnetModel");
const Inquilino = require("./inquilinoModel");
const Contrato = require("./contratoModel");
const Consumo = require("./consumoModel");

Contrato.belongsTo(Kitnet, {
  foreignKey: "kitnet_id",
});

Contrato.belongsTo(Inquilino, {
  foreignKey: "inquilino_id",
});

Inquilino.hasMany(Contrato, {
  foreignKey: "inquilino_id",
});

Kitnet.hasMany(Contrato, {
  foreignKey: "kitnet_id",
});

Consumo.belongsTo(Contrato, {
  foreignKey: "contrato_id",
});

Contrato.hasMany(Consumo, {
  foreignKey: "contrato_id",
});

module.exports = {
  Contrato,
  Inquilino,
  Kitnet,
  Consumo,
};
