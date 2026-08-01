const express = require("express");
const cors = require("cors");

const consumoRoutes = require("./routes/consumoRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("API de Gestão de Kitnets funcionando.");
});

const consController = require("./controllers/consController");
app.get("/api/contratos", consController.listarContrato);
app.get("/api/inquilinos", consController.listarInquilino);
app.get("/api/kitnet", consController.listarKitnet);
app.get("/api/conteudo", consController.listarConten);

//routes
app.use("/api/consumo", consumoRoutes);

module.exports = app;
