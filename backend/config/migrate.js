const pool = require('./database');

const runMigrations = async () => {
  try {
    // Migração da tabela de permissões por perfil (legado, se necessário)
    await migrateProfilePermissions();
    
    // Migração da nova tabela de permissões por usuário
    await migrateUserPermissions();

  } catch (error) {
    console.error('❌ Erro durante a migração do banco de dados:', error);
  }
};

const migrateUserPermissions = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'permissoes_usuario'
    );
  `;
  const res = await pool.query(checkTableQuery);
  const tableExists = res.rows[0].exists;

  if (!tableExists) {
    console.log("Tabela 'permissoes_usuario' não encontrada. Criando tabela...");
    const createTableQuery = `
      CREATE TABLE permissoes_usuario (
        id_permissao_usuario SERIAL PRIMARY KEY,
        id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
        modulo_nome VARCHAR(50) NOT NULL,
        ativo BOOLEAN DEFAULT FALSE NOT NULL,
        UNIQUE (id_usuario, modulo_nome)
      );
    `;
    await pool.query(createTableQuery);
    console.log("=> Tabela 'permissoes_usuario' criada com sucesso.");
  } else {
    console.log("Tabela 'permissoes_usuario' já existe.");
  }
};

const migrateProfilePermissions = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'permissoes'
    );
  `;
  const res = await pool.query(checkTableQuery);
  const tableExists = res.rows[0].exists;

  if (!tableExists) {
    return; // A tabela legada não existe, então não há nada a fazer.
  }
  
  const countRes = await pool.query('SELECT COUNT(*) FROM permissoes;');
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    console.log("Tabela 'permissoes' (legada) está vazia. Populando com dados iniciais...");
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
  } else {
    console.log("Tabela 'permissoes' (legada) já contém dados.");
  }
};

module.exports = { runMigrations };