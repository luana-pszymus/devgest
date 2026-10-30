require("dotenv").config();

const app = require("./src/app");
const sequelize = require("./src/database/db");

require("./src/models/kitnetModel");
require("./src/models/inquilinoModel");
require("./src/models/referenciasModel");
require("./src/models/contratoModel");
require("./src/models/loginModel");

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    await sequelize.sync();

    // Adiciona a coluna da foto sem apagar os registros antigos.
    await sequelize.query(`
      ALTER TABLE "consumo"
      ADD COLUMN IF NOT EXISTS "foto_url" VARCHAR(255);
    `);

    console.log("Banco sincronizado");
    console.log("Coluna foto_url verificada");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (erro) {
    console.error("Erro ao iniciar o servidor:", erro);
  }
}

iniciarServidor();
