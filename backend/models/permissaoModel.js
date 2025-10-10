const pool = require('../config/database');

const Permissao = {
  /**
   * Busca todas as permissões cadastradas.
   * @returns {Promise<Array<object>>} Uma lista de todas as permissões.
   */
  async findAll() {
    const query = 'SELECT * FROM permissoes ORDER BY perfil_nome, modulo_nome;';
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      throw new Error('Falha ao buscar permissões.');
    }
  },

  /**
   * Atualiza um conjunto de permissões para um perfil e módulo.
   * @param {string} perfil_nome - O nome do perfil.
   * @param {string} modulo_nome - O nome do módulo.
   * @param {object} permissions - Um objeto com as permissões (pode_ler, pode_escrever, pode_deletar).
   * @returns {Promise<object>} A permissão atualizada.
   */
  async update(perfil_nome, modulo_nome, { pode_ler, pode_escrever, pode_deletar }) {
    const query = `
      UPDATE permissoes
      SET pode_ler = $3, pode_escrever = $4, pode_deletar = $5
      WHERE perfil_nome = $1 AND modulo_nome = $2
      RETURNING *;
    `;
    const values = [perfil_nome, modulo_nome, pode_ler, pode_escrever, pode_deletar];
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      throw new Error('Falha ao atualizar permissão.');
    }
  },

  /**
   * Busca uma permissão específica para um perfil e módulo.
   * @param {string} perfil_nome - O nome do perfil do usuário.
   * @param {string} modulo_nome - O nome do módulo a ser acessado.
   * @returns {Promise<object|null>} O objeto de permissão ou nulo se não for encontrado.
   */
  async findByProfileAndModule(perfil_nome, modulo_nome) {
    const query = 'SELECT * FROM permissoes WHERE perfil_nome = $1 AND modulo_nome = $2;';
    const values = [perfil_nome, modulo_nome];
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      throw new Error('Falha ao verificar permissão.');
    }
  }
};

module.exports = Permissao;