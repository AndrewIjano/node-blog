const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../../erros');

module.exports = {
  registra: async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({ nome, email });
      await usuario.adicionaSenha(senha);
      await usuario.adiciona();

      res.status(201).json(usuario);
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

  login: (req, res, next) => {
    const passport = req.passport;

    passport.authenticate('local', (erro, usuario, info) => {
      if (erro) {
        return next(erro);
      }

      req.login(usuario, erro => {
        if (erro) {
          return next(erro);
        }
        return res.send('Login OK!');
      });
    })(req, res, next);
  },

  logout: (req, res) => {
    req.logout();
    res.send('Logout OK!');
  },

  autentica: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/login');
    }
  },

  deleta: (req, res) => {
    if (!req.user || req.user.id != req.params.id) {
      return res
        .status(403)
        .send('Você precisa entrar como esse usuário para isso!');
    }

    const usuario = new Usuario(req.user);
    usuario
      .deleta()
      .then(() => {
        res.send('Usuário deletado com sucesso!');
      })
      .catch(erro => {
        res.status(500).json({ erro: erro });
      });
  }
};
