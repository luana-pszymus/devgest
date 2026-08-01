const { Sequelize } = require("sequelize");
const database = require("../database/db");

const Inquilino = database.define(
  "inqulino",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },

    nome: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },

    telefone: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },

    email: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "inquilino",
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = Inquilino;
