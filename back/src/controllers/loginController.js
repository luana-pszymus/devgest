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

    // VALIDAR CAMPOS
    if (!email || !senha) {
      return res.status(400).json({
        erro: "E-mail e senha são obrigatórios",
      });
    }

    // BUSCAR USUÁRIO PELO E-MAIL
    const usuario = await Usuario.findOne({
      where: {
        email: email,
      },
    });

    // VERIFICAR SE USUÁRIO EXISTE
    if (!usuario) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos",
      });
    }

    // VERIFICAR SENHA
    if (usuario.senha !== senha) {
      return res.status(401).json({
        erro: "E-mail ou senha inválidos",
      });
    }

    // LOGIN REALIZADO
    res.status(200).json({
      mensagem: "Login realizado com sucesso",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
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
      where: {
        email,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    if (usuario.codigo_verificacao !== codigo.toString()) {
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

    res.status(200).json({
      mensagem: "Autenticação realizada com sucesso",
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
      detalhes: error.message,
    });
  }
};
