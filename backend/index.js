const express = require('express');
const cors = require('cors');
const clienteRoutes = require('./routes/clienteRoutes');
const ordemServicoRoutes = require('./routes/ordemServicoRoutes');
const orcamentoRoutes = require('./routes/orcamentoRoutes');
require('dotenv').config();

const app = express();

// Configurações básicas
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/clientes', clienteRoutes);
app.use('/api/ordens-servico', ordemServicoRoutes);
app.use('/api/orcamentos', orcamentoRoutes);

// Rota simples de teste
app.get('/', (req, res) => {
  res.send('API de Clientes está funcionando!');
});

// Conexão com o banco (usando Pool do pg diretamente)
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Teste de conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err);
  } else {
    console.log('✅ Conexão com PostgreSQL OK - Hora atual:', res.rows[0].now);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});