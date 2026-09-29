const { Sequelize } = require("sequelize");

const database = require("../database/db");

const Usuario = database.define("Usuario", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  nome: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },

  senha: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Usuario;
