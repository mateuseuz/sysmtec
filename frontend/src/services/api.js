import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(config => {
  if (config.data) {
    config.data = Object.fromEntries(
      Object.entries(config.data).filter(([_, v]) => v !== null && v !== undefined)
  );
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data, // Retorna apenas os dados da resposta
  (error) => {
    const errorMessage = error.response?.data?.error || error.message;
    return Promise.reject(new Error(errorMessage)); // Padroniza erros
  }
);

// Objeto com todos os métodos da API
const apiClientes = {
  criarCliente: (cliente) => api.post('/clientes', cliente),
  listarClientes: () => api.get('/clientes'),
  buscarCliente: (id) => api.get(`/clientes/${id}`),
  atualizarCliente: (id, cliente) => api.put(`/clientes/${id}`, cliente),
  deletarCliente: (id) => api.delete(`/clientes/${id}`),
  buscarClientesPorNome: (nome) => api.get(`/clientes/?nome=${encodeURIComponent(nome)}`),

  // Ordens de Serviço
  criarOrdemServico: (ordemServico) => api.post('/ordens-servico', ordemServico),
  listarOrdensServico: () => api.get('/ordens-servico'),
  buscarOrdemServico: (id) => api.get(`/ordens-servico/${id}`),
  atualizarOrdemServico: (id, ordemServico) => api.put(`/ordens-servico/${id}`, ordemServico),
  deletarOrdemServico: (id) => api.delete(`/ordens-servico/${id}`),

  // Orçamentos
  listarOrcamentos: () => api.get('/orcamentos'),
  criarOrcamento: (orcamento) => api.post('/orcamentos', orcamento),
  buscarOrcamento: (id) => api.get(`/orcamentos/${id}`),
  atualizarOrcamento: (id, orcamento) => api.put(`/orcamentos/${id}`, orcamento),
  deletarOrcamento: (id) => api.delete(`/orcamentos/${id}`),
};

export default apiClientes;