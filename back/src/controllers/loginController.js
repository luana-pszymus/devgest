const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Usuario = require("../models/loginModel");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Gera, salva e envia o código (usada pelo login e pelo reenvio)
async function gerarEEnviarCodigo(usuario) {
  const codigo = crypto.randomInt(100000, 1000000).toString();

  await usuario.update({
    codigo_verificacao: codigo,
    codigo_expira: new Date(Date.now() + 5 * 60 * 1000),
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: usuario.email,
    subject: "Código de autenticação",
    text: `Seu código de autenticação é: ${codigo}\nEle expira em 5 minutos.`,
  });
}

// LOGIN (etapa 1): confere e-mail e senha e envia o código
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "E-mail e senha são obrigatórios",
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos",
      });
    }

    await gerarEEnviarCodigo(usuario);

    res.status(200).json({
      mensagem: "Código enviado para o e-mail",
      email: usuario.email,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao realizar login",
    });
  }
};

// REENVIAR CÓDIGO POR E-MAIL
exports.enviarCodigo = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        erro: "O e-mail é obrigatório",
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    await gerarEEnviarCodigo(usuario);

    res.status(200).json({
      mensagem: "Código enviado para o e-mail",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao enviar código",
    });
  }
};

// VERIFICAR CÓDIGO (etapa 2): confere o código e devolve o token
exports.verificarCodigo = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({
        erro: "E-mail e código são obrigatórios",
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    if (
      !usuario.codigo_verificacao ||
      usuario.codigo_verificacao !== codigo.toString()
    ) {
      return res.status(401).json({
        erro: "Código inválido",
      });
    }

    if (!usuario.codigo_expira || new Date() > usuario.codigo_expira) {
      return res.status(401).json({
        erro: "Código expirado",
      });
    }

    await usuario.update({
      codigo_verificacao: null,
      codigo_expira: null,
    });

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      },
    );

    res.status(200).json({
      mensagem: "Autenticação realizada com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao verificar código",
    });
  }
};
