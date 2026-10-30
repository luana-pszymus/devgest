const jwt = require("jsonwebtoken");
const Usuario = require("../models/loginModel");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// LOGIN

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "E-mail e senha são obrigatórios",
      });
    }

    // Normalizar e-mail
    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await Usuario.findOne({
      where: {
        email: emailNormalizado,
      },
    });

    // Diagnóstico: usuário não encontrado
    if (!usuario) {
      console.log("LOGIN: usuário não encontrado:", emailNormalizado);

      return res.status(401).json({
        erro: "E-mail ou senha inválidos",
      });
    }

    // Diagnóstico: senha incorreta
    if (usuario.senha !== senha) {
      console.log("LOGIN: senha não corresponde.");
      console.log("Tamanho da senha recebida:", senha.length);
      console.log("Tamanho da senha cadastrada:", usuario.senha?.length);

      return res.status(401).json({
        erro: "E-mail ou senha inválidos",
      });
    }

    // Gerar JWT
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

    return res.status(200).json({
      mensagem: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      erro: "Erro ao realizar login",
      detalhes: error.message,
    });
  }
};

// ENVIAR CÓDIGO POR E-MAIL
exports.enviarCodigo = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        erro: "O e-mail é obrigatório",
      });
    }

    const usuario = await Usuario.findOne({
      where: {
        email,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000);

    const codigoExpira = new Date(Date.now() + 5 * 60 * 1000);

    await usuario.update({
      codigo_verificacao: codigo.toString(),
      codigo_expira: codigoExpira,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: usuario.email,
      subject: "Código de autenticação",
      text: `Seu código de autenticação é: ${codigo}`,
    });

    res.status(200).json({
      mensagem: "Código enviado para o e-mail",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Erro ao enviar código",
      detalhes: error.message,
    });
  }
};

// VERIFICAR CÓDIGO

exports.verificarCodigo = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({
        erro: "E-mail e código são obrigatórios",
      });
    }

    const usuario = await Usuario.findOne({
      where: { email },
    });

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

    if (
      !usuario.codigo_expira ||
      new Date() > new Date(usuario.codigo_expira)
    ) {
      return res.status(401).json({
        erro: "Código expirado",
      });
    }

    // Limpar o código após a validação
    await usuario.update({
      codigo_verificacao: null,
      codigo_expira: null,
    });

    // Gerar token JWT
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

    // Retornar token e dados do usuário
    return res.status(200).json({
      mensagem: "Autenticação realizada com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("Erro ao verificar código:", error);

    return res.status(500).json({
      erro: "Erro ao verificar código",
      detalhes: error.message,
    });
  }
};
