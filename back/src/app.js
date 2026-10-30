
const express = require("express"); 
const cors = require("cors");
const path = require("path");

const consumoRoutes = require("./routes/consumoRoutes");
const inquilinoRoutes = require("./routes/inquilinoRoutes");
const contratoRoutes = require("./routes/contratoRoutes");
const kitnetRoutes = require("./routes/kitnetRoutes");
const resumoRoutes = require("./routes/resumoRoutes");
const loginRoutes = require("./routes/loginRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Disponibiliza as fotos dos medidores.
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

app.get("/api", (req, res) => {
  res.send("API de Gestão de Kitnets funcionando.");
});

// Rotas do sistema.
app.use("/api/consumo", consumoRoutes);
app.use("/api/inquilino", inquilinoRoutes);
app.use("/api/contratos", contratoRoutes);
app.use("/api/kitnet", kitnetRoutes);
app.use("/api/resumo", resumoRoutes);
app.use("/api", loginRoutes);

module.exports = app;
