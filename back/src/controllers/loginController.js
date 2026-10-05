const jwt = require("jsonwebtoken");
const Usuario = require("../models/loginModel");

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

    // GERAR TOKEN JWT
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

    // LOGIN REALIZADO
    res.status(200).json({
      mensagem: "Login realizado com sucesso",

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
      erro: "Erro ao realizar login",
      detalhes: error.message,
    });
  }
};
