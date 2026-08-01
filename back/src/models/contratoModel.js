const { Sequelize } = require("sequelize");
const database = require("../database/db");

const Contrato = database.define(
  "contrato",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },

    kitnet_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "kitnet",
        key: "id",
      },
    },

    inquilino_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "inquilino",
        key: "id",
      },
    },

    data_inicio: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    data_fim: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "contrato",
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = Contrato;
