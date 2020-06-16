const usuariosControlador = require('./usuarios-controlador');
const middlewaresAutenticacao = require('./middlewares-autenticacao');

module.exports = (app) => {
  app
    .route('/usuario/verifica_email/:token')
    .get(
      middlewaresAutenticacao.verificacaoEmail,
      usuariosControlador.verificaEmail
    );

  app
    .route('/usuario/atualiza_token')
    .post(middlewaresAutenticacao.refresh, usuariosControlador.login);

  app.route('/usuario/recupera_conta').post(usuariosControlador.recuperaConta);

  app
    .route('/usuario/senha/:token')
    .put(
      middlewaresAutenticacao.atualizacaoSenha,
      usuariosControlador.atualizaSenha
    );

  app
    .route('/usuario/login')
    .post(middlewaresAutenticacao.local, usuariosControlador.login);

  app
    .route('/usuario/logout')
    .get(
      [middlewaresAutenticacao.bearer, middlewaresAutenticacao.refresh],
      usuariosControlador.logout
    );

  app
    .route('/usuario')
    .post(usuariosControlador.adiciona)
    .get(usuariosControlador.lista);

  app
    .route('/usuario/:id')
    .delete(middlewaresAutenticacao.bearer, usuariosControlador.deleta);
};
