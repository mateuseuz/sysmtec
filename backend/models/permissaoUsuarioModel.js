const pool = require('../config/database');

const PermissaoUsuario = {
  /**
   * Procura a permissão de um usuário em um módulo.
   * Exemplo: ver se o usuário 5 tem acesso ao módulo "clientes".
   */
  async findByUserIdAndModule(id_usuario, modulo_nome) {
    const query = `
      SELECT * FROM permissoes_usuario 
      WHERE id_usuario = $1 AND modulo_nome = $2;
    `;
    const values = [id_usuario, modulo_nome];
    try {
      const { rows } = await pool.query(query, values);
      return rows[0]; // Retorna a permissão, se existir
    } catch (error) {
      console.error('Erro ao buscar permissão de usuário:', error);
      throw new Error('Falha ao buscar permissão de usuário.');
    }
  },

  /**
   * Cria uma nova permissão para um usuário em um módulo.
   * Exemplo: dar permissão "false" por padrão ao criar um novo usuário.
   */
  async create(id_usuario, modulo_nome, { ativo = false }) {
    const query = `
      INSERT INTO permissoes_usuario (id_usuario, modulo_nome, ativo)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [id_usuario, modulo_nome, ativo];
    try {
      const { rows } = await pool.query(query, values);
      return rows[0]; // Retorna a nova permissão criada
    } catch (error) {
      console.error('Erro ao criar permissão de usuário:', error);
      throw new Error('Falha ao criar permissão de usuário.');
    }
  },

  /**
   * Atualiza a permissão de um usuário em um módulo.
   * Exemplo: mudar "ativo" de false para true.
   */
  async update(id_usuario, modulo_nome, { ativo }) {
    const query = `
      UPDATE permissoes_usuario
      SET ativo = $3
      WHERE id_usuario = $1 AND modulo_nome = $2
      RETURNING *;
    `;
    const values = [id_usuario, modulo_nome, ativo];
    try {
      const { rows } = await pool.query(query, values);
      return rows[0]; // Retorna a permissão atualizada
    } catch (error) {
      console.error('Erro ao atualizar permissão de usuário:', error);
      throw new Error('Falha ao atualizar permissão de usuário.');
    }
  },
  
  /**
   * Mostra todas as permissões de um usuário.
   * Exemplo: listar o que o usuário pode ou não acessar.
   */
  async findByUserId(id_usuario) {
    const query = 'SELECT * FROM permissoes_usuario WHERE id_usuario = $1;';
    const values = [id_usuario];
    try {
      const { rows } = await pool.query(query, values);
      return rows; // Retorna todas as permissões desse usuário
    } catch (error) {
      console.error('Erro ao buscar todas as permissões do usuário:', error);
      throw new Error('Falha ao buscar permissões do usuário.');
    }
  },

  /**
   * Cria permissões padrão (todas falsas) quando um novo usuário é cadastrado.
   * Assim, ele começa sem acesso até alguém liberar.
   */
  async createDefaultPermissions(id_usuario) {
    const modulos = [
      'clientes', 'orcamentos', 'ordensServico', 'visitas', 
      'usuarios', 'permissoes', 'chat', 'logs'
    ];

    const queries = modulos.map(modulo => {
      return {
        text: `INSERT INTO permissoes_usuario (id_usuario, modulo_nome, ativo)
               VALUES ($1, $2, false)
               ON CONFLICT (id_usuario, modulo_nome) DO NOTHING;`,
        values: [id_usuario, modulo]
      };
    });

    try {
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
