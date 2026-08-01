require("dotenv").config();

const app = require("./src/app");
const sequelize = require("./src/database/db");

require("./src/models/kitnetModel");
require("./src/models/inquilinoModel");
require("./src/models/referenciasModel");
require("./src/models/contratoModel");

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  console.log("Banco sincronizado");

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});
