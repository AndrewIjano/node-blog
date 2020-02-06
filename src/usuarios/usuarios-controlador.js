const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../../erros');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

function criaTokenJWT(usuario) {
  const payload = {
    id: usuario.id
  };

  return jwt.sign(payload, process.env.JWT_KEY + usuario.ultimoLogout, {
    expiresIn: '5d'
  });
}

module.exports = {
  registra: async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({ nome, email });
      await usuario.adicionaSenha(senha);
      await usuario.adiciona();

      const codigo = speakeasy.generateSecret().base32;

      res.status(201).json({codigo: codigo});
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        res.status(422).json({ erro: erro.message });
      } else if (erro instanceof InternalServerError) {
        res.status(500).json({ erro: erro.message });
      } else {
        res.status(500).json({ erro: erro.message });
      }
    }
  },

  login: (req, res) => {
    const token = criaTokenJWT(req.user);
    res.set('Authorization', token);
    return res.status(204).send();
  },

  logout: (req, res) => {
    const usuario = req.user;
    usuario.logout();

    res.status(205).send();
  },

  deleta: async (req, res) => {
    if (req.user.id != req.params.id) {
      return res
        .status(403)
        .send('Você precisa entrar como esse usuário para isso!');
    }

    const usuario = req.user;
    try {
      await usuario.deleta();
      res.status(200).send();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  }
};
