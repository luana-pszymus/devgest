
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Pasta onde as fotos dos medidores serão armazenadas.
const pastaFotos = path.join(__dirname, "../../uploads/consumos");

// Cria a pasta caso ela ainda não exista.
fs.mkdirSync(pastaFotos, { recursive: true });

// Define como os arquivos serão salvos.
const armazenamento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaFotos);
  },

  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const nome = `${crypto.randomUUID()}${extensao}`;

    cb(null, nome);
  },
});

// Aceita somente imagens.
const upload = multer({
  storage: armazenamento,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Formato de imagem não permitido."));
    }
  },
});

module.exports = upload;
