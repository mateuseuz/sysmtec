import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Filtra dados nulos ou indefinidos do corpo da requisição
    if (config.data) {
      config.data = Object.fromEntries(
        Object.entries(config.data).filter(([_, v]) => v !== null && v !== undefined)
      );
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data, // Retorna apenas os dados da resposta
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
      return Promise.reject(new Error('Sua sessão expirou. Por favor, faça login novamente.'));
    }
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
  buscarClientesPorNome: (nome) => api.get(`/clientes/search?nome=${encodeURIComponent(nome)}`),

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

  // Visitas (Agenda)
  listarVisitas: () => api.get('/agenda'),
  criarVisita: (visita) => api.post('/agenda', visita),
  buscarVisita: (id) => api.get(`/agenda/${id}`),
  atualizarVisita: (id, visita) => api.put(`/agenda/${id}`, visita),
  deletarVisita: (id) => api.delete(`/agenda/${id}`),

  // Autenticação
  login: (credentials) => api.post('/auth/login', credentials),

  // Usuários
  listarUsuarios: () => api.get('/usuarios'),
  criarUsuario: (userData) => api.post('/usuarios', userData),
  atualizarUsuario: (id, userData) => api.put(`/usuarios/${id}`, userData),
  deletarUsuario: (id) => api.delete(`/usuarios/${id}`),
  esqueciSenha: (email) => api.post('/usuarios/esqueci-senha', { email }),
  redefinirSenha: (token, senha) => api.post(`/usuarios/redefinir-senha/${token}`, { senha }),

  // Logs
  listarLogs: () => api.get('/logs'),

  // Mensagens (Chat)
  listarMensagens: () => api.get('/mensagens'),

  // Permissões de Perfil (Legado)
  listarPermissoes: () => api.get('/permissoes'),
  atualizarPermissao: (perfil, modulo, permissoes) => api.put(`/permissoes/${perfil}/${modulo}`, permissoes),
  
  // Permissões por Usuário (Novo)
  getMinhasPermissoes: () => api.get('/permissoes/me'), // Este endpoint ainda pode ser útil
  getPermissoesPorUsuario: (id_usuario) => api.get(`/permissoes-usuario/${id_usuario}`),
  updatePermissaoUsuario: (id_usuario, modulo_nome, permissoes) => api.put(`/permissoes-usuario/${id_usuario}/${modulo_nome}`, permissoes),
};

export default apiClientes;