const pool = require('../config/database');

const Mensagem = {
  /**
   * Cria uma nova mensagem no banco de dados.
   * @param {number} id_usuario - O ID do usuário que enviou a mensagem.
   * @param {string} texto - O conteúdo da mensagem.
   * @returns {Promise<object>} A mensagem criada.
   */
  async create(id_usuario, texto) {
    const query = `
      INSERT INTO mensagens (id_usuario, texto)
      VALUES ($1, $2)
      RETURNING id_mensagem, id_usuario, texto, timestamp;
    `;
    const values = [id_usuario, texto];
    
    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Erro ao salvar mensagem:", error);
      throw new Error('Falha ao salvar a mensagem no banco de dados.');
    }
  },

  /**
   * Busca todas as mensagens do chat, juntando com os nomes dos usuários.
   * @returns {Promise<Array<object>>} Uma lista de todas as mensagens.
   */
  async findAll() {
    const query = `
      SELECT 
        m.id_mensagem, 
        m.texto, 
        m.timestamp, 
        u.id_usuario,
        u.nome_completo AS nome_usuario
      FROM mensagens m
      JOIN usuarios u ON m.id_usuario = u.id_usuario
      ORDER BY m.timestamp ASC
      LIMIT 100; -- Limita a um número razoável de mensagens recentes
    `;
    
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      throw new Error('Falha ao buscar o histórico de mensagens.');
    }
  },

  /**
   * Apaga uma mensagem do banco de dados pelo ID.
   * @param {number} id_mensagem - O ID da mensagem a ser apagada.
   * @returns {Promise<object>} A mensagem que foi apagada.
   */
  async delete(id_mensagem) {
    const query = 'DELETE FROM mensagens WHERE id_mensagem = $1 RETURNING id_mensagem';
    const values = [id_mensagem];
    
    try {
      const { rows } = await pool.query(query, values);
      return rows[0]; // Retorna o objeto da mensagem apagada ou undefined se não encontrou
    } catch (error) {
      console.error("Erro ao apagar mensagem:", error);
      throw new Error('Falha ao apagar a mensagem do banco de dados.');
    }
  }
};

module.exports = Mensagem;