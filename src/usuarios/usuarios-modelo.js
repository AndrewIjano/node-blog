const usuariosDao = require('./usuarios-dao');
const { InvalidArgumentError } = require('../../erros');
const bcrypt = require('bcrypt');

class Usuario {
  constructor(usuario) {
    this.id = usuario.id;
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.senhaHash = usuario.senhaHash;
    this.ultimoLogout = usuario.ultimoLogout;

    if (!this.ultimoLogout) {
      this.ultimoLogout = new Date().toJSON();
    }
    
    this.valida();
  }

  async adicionaSenha(senha) {
    this.campoStringNaoNulo(senha, 'senha');
    this.campoTamanhoMinimo(senha, 'senha', 8);
    this.campoTamanhoMaximo(senha, 'senha', 64);

    const custoHash = 12;
    this.senhaHash = await bcrypt.hash(senha, custoHash);
  }

  async adiciona() {
    if (await Usuario.buscaPorEmail(this.email)) {
      throw new InvalidArgumentError('O usuário já existe!');
    }

    return usuariosDao.adiciona(this);
  }

  valida() {
    this.campoStringNaoNulo(this.nome, 'nome');
    this.campoStringNaoNulo(this.email, 'email');
  }

  campoStringNaoNulo(valor, nome) {
    if (typeof valor !== 'string' || valor === 0)
      throw new InvalidArgumentError(`É necessário preencher o campo ${nome}!`);
  }

  campoTamanhoMinimo(valor, nome, minimo) {
    if (valor.length < minimo)
      throw new InvalidArgumentError(
        `O campo ${nome} precisa ser maior que ${minimo} caracteres!`
      );
  }

  campoTamanhoMaximo(valor, nome, maximo) {
    if (valor.length > maximo)
      throw new InvalidArgumentError(
        `O campo ${nome} precisa ser menor que ${maximo} caracteres!`
      );
  }

  atualizaLogout() {
    this.ultimoLogout = new Date().toJSON();

    return usuariosDao.atualizaLogout(this);
  }

  deleta() {
    return usuariosDao.deleta(this);
  }

  static async buscaPorId(id) {
    const usuario = await usuariosDao.buscaPorId(id);
    if (!usuario) {
      return null;
    }

    return new Usuario(usuario);
  }

  static async buscaPorEmail(email) {
    const usuario = await usuariosDao.buscaPorEmail(email);
    if (!usuario) {
      return null;
    }
    
    return new Usuario(usuario);

  }

  static async buscaUltimoLogout(id) {
    return usuariosDao.buscaUltimoLogout(id);
  }
}

module.exports = Usuario;
