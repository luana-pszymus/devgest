const { Sequelize } = require("sequelize");
const database = require("../database/db");

const Consumo = database.define(
  "consumo",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },

    contrato_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "contrato",
        key: "id",
      },
    },

    mes: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    ano: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    consumo_kwh: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },

    preco_kwh: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },

    valor_energia: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },

    valor_aluguel: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    valor_total: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },

    leitura_anterior: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },

    leitura_atual: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "consumo",
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = Consumo;
