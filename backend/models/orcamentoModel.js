const pool = require('../config/database');

const Orcamento = {
  async create(orcamento) {
    const { nome, id_cliente, observacoes, itens } = orcamento;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orcamentoQuery = `
        INSERT INTO orcamentos (nome, id_cliente, observacoes)
        VALUES ($1, $2, $3)
        RETURNING id_orcamento`;
      const orcamentoValues = [nome, id_cliente, observacoes];
      const res = await client.query(orcamentoQuery, orcamentoValues);
      const id_orcamento = res.rows[0].id_orcamento;

      if (itens && itens.length > 0) {
        for (const item of itens) {
          const itemQuery = `
            INSERT INTO itens_orcamento (id_orcamento, nome, quantidade, valor)
            VALUES ($1, $2, $3, $4)`;
          const itemValues = [id_orcamento, item.nome, item.quantidade, item.valor];
          await client.query(itemQuery, itemValues);
        }
      }

      await client.query('COMMIT');
      return { id_orcamento, ...orcamento };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getAll() {
    const query = `
      SELECT
        o.id_orcamento,
        o.nome,
        c.nome AS nome_cliente,
        COALESCE(SUM(io.quantidade * io.valor), 0) AS valor_total
      FROM
        orcamentos o
      LEFT JOIN
        clientes c ON o.id_cliente = c.id_cliente
      LEFT JOIN
        itens_orcamento io ON o.id_orcamento = io.id_orcamento
      GROUP BY
        o.id_orcamento, c.nome
      ORDER BY
        o.id_orcamento DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getById(id_orcamento) {
    const orcamentoRes = await pool.query('SELECT * FROM orcamentos WHERE id_orcamento = $1', [id_orcamento]);
    if (orcamentoRes.rows.length === 0) {
      return null;
    }
    const orcamento = orcamentoRes.rows[0];

    const itensRes = await pool.query('SELECT * FROM itens_orcamento WHERE id_orcamento = $1', [id_orcamento]);
    orcamento.itens = itensRes.rows;

    return orcamento;
  },

  async update(id_orcamento, orcamento) {
    const { nome, id_cliente, observacoes, itens } = orcamento;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Atualizar o orçamento principal
      const orcamentoQuery = `
        UPDATE orcamentos
        SET nome = $1, id_cliente = $2, observacoes = $3
        WHERE id_orcamento = $4
      `;
      await client.query(orcamentoQuery, [nome, id_cliente, observacoes, id_orcamento]);

      // 2. Deletar os itens antigos
      await client.query('DELETE FROM itens_orcamento WHERE id_orcamento = $1', [id_orcamento]);

      // 3. Inserir os novos itens
      if (itens && itens.length > 0) {
        for (const item of itens) {
          const itemQuery = `
            INSERT INTO itens_orcamento (id_orcamento, nome, quantidade, valor)
            VALUES ($1, $2, $3, $4)`;
          const itemValues = [id_orcamento, item.nome, item.quantidade, item.valor];
          await client.query(itemQuery, itemValues);
        }
      }

      await client.query('COMMIT');
      return { id_orcamento, ...orcamento };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async delete(id_orcamento) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM itens_orcamento WHERE id_orcamento = $1', [id_orcamento]);
      const res = await client.query('DELETE FROM orcamentos WHERE id_orcamento = $1', [id_orcamento]);
      await client.query('COMMIT');

      if (res.rowCount === 0) {
        throw new Error('Orçamento não encontrado');
      }
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = Orcamento;
