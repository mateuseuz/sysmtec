const pool = require('./database');

const runMigrations = async () => {
  try {
    // 1. Verificar se a tabela 'permissoes' já existe
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'permissoes'
      );
    `;
    const res = await pool.query(checkTableQuery);
    const tableExists = res.rows[0].exists;

    // Se a tabela não existir, cria primeiro
    if (!tableExists) {
      console.log("Tabela 'permissoes' não encontrada. Criando tabela...");
      const createTableQuery = `
        CREATE TABLE permissoes (
          id_permissao SERIAL PRIMARY KEY,
          perfil_nome VARCHAR(50) NOT NULL,
          modulo_nome VARCHAR(50) NOT NULL,
          pode_ler BOOLEAN DEFAULT FALSE NOT NULL,
          pode_escrever BOOLEAN DEFAULT FALSE NOT NULL,
          pode_deletar BOOLEAN DEFAULT FALSE NOT NULL,
          UNIQUE (perfil_nome, modulo_nome)
        );
      `;
      await pool.query(createTableQuery);
      console.log("=> Tabela 'permissoes' criada com sucesso.");
    }

    // Em seguida, verifica se a tabela está vazia. Se estiver, popula.
    const countRes = await pool.query('SELECT COUNT(*) FROM permissoes;');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log("Tabela 'permissoes' está vazia. Populando com dados iniciais...");
      const insertDataQuery = `
        INSERT INTO permissoes (perfil_nome, modulo_nome, pode_ler, pode_escrever, pode_deletar) VALUES
        ('admin', 'clientes', TRUE, TRUE, TRUE),
        ('admin', 'orcamentos', TRUE, TRUE, TRUE),
        ('admin', 'ordensServico', TRUE, TRUE, TRUE),
        ('admin', 'visitas', TRUE, TRUE, TRUE),
        ('admin', 'usuarios', TRUE, TRUE, TRUE),
        ('admin', 'permissoes', TRUE, TRUE, TRUE),
        ('admin', 'chat', TRUE, TRUE, TRUE),
        ('admin', 'logs', TRUE, FALSE, FALSE),
        ('usuario', 'clientes', TRUE, FALSE, FALSE),
        ('usuario', 'orcamentos', TRUE, FALSE, FALSE),
        ('usuario', 'ordensServico', TRUE, FALSE, FALSE),
        ('usuario', 'visitas', TRUE, FALSE, FALSE),
        ('usuario', 'usuarios', FALSE, FALSE, FALSE),
        ('usuario', 'permissoes', FALSE, FALSE, FALSE),
        ('usuario', 'chat', TRUE, TRUE, FALSE);
      `;
      await pool.query(insertDataQuery);
      console.log("=> Tabela 'permissoes' populada com dados iniciais.");
      console.log("Migração do banco de dados concluída com sucesso.");
    } else {
      console.log("Tabela 'permissoes' já contém dados. Nenhuma migração necessária.");
    }
  } catch (error) {
    console.error('❌ Erro durante a migração do banco de dados:', error);
    // Em um ambiente de produção, você pode querer sair do processo
    // process.exit(1); 
  }
};

module.exports = { runMigrations };