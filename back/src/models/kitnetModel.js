const { Sequelize } = require("sequelize");
const database = require("../database/db");

const Kitnet = database.define(
  "kitnet",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },

    numero: {
      type: Sequelize.STRING(10),
      allowNull: false,
    },

    valor_aluguel: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
  },

  {
    tableName: "kitnet",
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = Kitnet;
