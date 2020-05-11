const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError } = require('../erros');
const tokens = require('./tokens-autenticacao');
const { EmailVerificacao } = require('./emails');
const jwt = require('jsonwebtoken');

module.exports = {
  async adiciona(req, res) {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email,
        emailVerificado: false
      });
      await usuario.adicionaSenha(senha);
      await usuario.adiciona();

      const emailVerificacao = new EmailVerificacao(usuario);
      emailVerificacao.enviaEmail().catch(console.error);

      res.status(201).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        return res.status(422).json({ erro: erro.message });
      }
      res.status(500).json({ erro: erro.message });
    }
  },

  async verificaEmail(req, res) {
    try {
      const payload = jwt.verify(req.params.token, process.env.CHAVE_JWT);
      const usuario = await Usuario.buscaPorId(payload.id);
      await usuario.verificaEmail();
      res.status(200).json();
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async login(req, res) {
    try {
      const { accessToken, refreshToken } = await tokens.criaTokens(
        req.user.id
      );
      res.set('Authorization', accessToken);
      res.status(200).json({ refreshToken });
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async logout(req, res) {
    try {
      await tokens.invalidaAccessToken(req.token);
      // TODO invalidar também o refresh token
      res.status(204).json();
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async lista(req, res) {
    try {
      const usuarios = await Usuario.lista();
      res.json(usuarios);
    } catch (erro) {
      res.status(500).json({ erro: erro.message });
    }
  },

  async deleta(req, res) {
    try {
      const usuario = await Usuario.buscaPorId(req.params.id);
      await usuario.deleta();
      res.status(200).json();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  }
};
