const pool = require('../config/database');

const PermissaoUsuario = {
  /**
   * Busca a permissão de um usuário para um módulo específico.
   * @param {number} id_usuario - O ID do usuário.
   * @param {string} modulo_nome - O nome do módulo.
   * @returns {Promise<object|null>} O objeto de permissão ou nulo.
   */
  async findByUserIdAndModule(id_usuario, modulo_nome) {
    const query = `
      SELECT * FROM permissoes_usuario 
      WHERE id_usuario = $1 AND modulo_nome = $2;
    `;
    const values = [id_usuario, modulo_nome];
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar permissão de usuário:', error);
      throw new Error('Falha ao buscar permissão de usuário.');
    }
  },

  /**
   * Cria um novo registro de permissão para um usuário e módulo.
   * @param {number} id_usuario - O ID do usuário.
   * @param {string} modulo_nome - O nome do módulo.
   * @param {object} permissions - { pode_ler, pode_escrever, pode_deletar }.
   * @returns {Promise<object>} O novo registro de permissão.
   */
  async create(id_usuario, modulo_nome, { pode_ler = false, pode_escrever = false, pode_deletar = false }) {
    const query = `
      INSERT INTO permissoes_usuario (id_usuario, modulo_nome, pode_ler, pode_escrever, pode_deletar)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [id_usuario, modulo_nome, pode_ler, pode_escrever, pode_deletar];
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Erro ao criar permissão de usuário:', error);
      throw new Error('Falha ao criar permissão de usuário.');
    }
  },

  /**
   * Atualiza as permissões de um usuário para um módulo.
   * @param {number} id_usuario - O ID do usuário.
   * @param {string} modulo_nome - O nome do módulo.
   * @param {object} permissions - { pode_ler, pode_escrever, pode_deletar }.
   * @returns {Promise<object>} A permissão atualizada.
   */
  async update(id_usuario, modulo_nome, { pode_ler, pode_escrever, pode_deletar }) {
    const query = `
      UPDATE permissoes_usuario
      SET pode_ler = $3, pode_escrever = $4, pode_deletar = $5
      WHERE id_usuario = $1 AND modulo_nome = $2
      RETURNING *;
    `;
    const values = [id_usuario, modulo_nome, pode_ler, pode_escrever, pode_deletar];
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Erro ao atualizar permissão de usuário:', error);
      throw new Error('Falha ao atualizar permissão de usuário.');
    }
  },
  
  /**
   * Busca todas as permissões de um usuário específico.
   * @param {number} id_usuario - O ID do usuário.
   * @returns {Promise<Array<object>>} Uma lista de todas as permissões do usuário.
   */
  async findByUserId(id_usuario) {
    const query = 'SELECT * FROM permissoes_usuario WHERE id_usuario = $1;';
    const values = [id_usuario];
    try {
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar todas as permissões do usuário:', error);
      throw new Error('Falha ao buscar permissões do usuário.');
    }
  },

  /**
   * Cria um conjunto padrão de permissões para um novo usuário.
   * @param {number} id_usuario - O ID do novo usuário.
   */
  async createDefaultPermissions(id_usuario) {
    const modulos = [
      'clientes', 'orcamentos', 'ordensServico', 'visitas', 
      'usuarios', 'permissoes', 'chat', 'logs'
    ];

    const queries = modulos.map(modulo => {
      return {
        text: `INSERT INTO permissoes_usuario (id_usuario, modulo_nome, pode_ler, pode_escrever, pode_deletar)
               VALUES ($1, $2, false, false, false)
               ON CONFLICT (id_usuario, modulo_nome) DO NOTHING;`, // Evita erros se a permissão já existir
        values: [id_usuario, modulo]
      };
    });

    try {
      // Executa todas as inserções
      for (const query of queries) {
        await pool.query(query.text, query.values);
      }
      console.log(`Permissões padrão criadas para o usuário ${id_usuario}.`);
    } catch (error) {
      console.error('Erro ao criar permissões padrão para o usuário:', error);
      throw new Error('Falha ao criar permissões padrão.');
    }
  }
};

module.exports = PermissaoUsuario;
