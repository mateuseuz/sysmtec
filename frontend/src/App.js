import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ListagemClientes from './pages/clientes/ListagemClientes';
import CadastroCliente from './pages/clientes/CadastroCliente';
import EdicaoCliente from './pages/clientes/EdicaoCliente';
import VisualizacaoCliente from './pages/clientes/VisualizacaoCliente';
import ListagemOrdensServico from './pages/ordensServico/ListagemOrdensServico';
import CadastroOrdemServico from './pages/ordensServico/CadastroOrdemServico';
import EdicaoOrdemServico from './pages/ordensServico/EdicaoOrdemServico';
import VisualizacaoOrdemServico from './pages/ordensServico/VisualizacaoOrdemServico';
import ListagemOrcamentos from './pages/orcamentos/ListagemOrcamentos';
import CadastroOrcamento from './pages/orcamentos/CadastroOrcamento';
import EdicaoOrcamento from './pages/orcamentos/EdicaoOrcamento';
import VisualizacaoOrcamento from './pages/orcamentos/VisualizacaoOrcamento';
import ListagemVisitas from './pages/visitas/ListagemVisitas';
import CadastroVisita from './pages/visitas/CadastroVisita';
import EdicaoVisita from './pages/visitas/EdicaoVisita';
import VisualizacaoVisita from './pages/visitas/VisualizacaoVisita';
import LoginPage from './pages/Login'; // Importar a página de login
import LogPage from './pages/Log';
import PainelControlePage from './pages/PainelControle';
import ProtectedRoute from './components/ProtectedRoute'; // Importar a rota protegida

const RedirectTo = () => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/agenda" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RedirectTo />} />
        
        {/* Rotas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/agenda" element={<ListagemVisitas />} />
          <Route path="/agenda/novo" element={<CadastroVisita />} />
          <Route path="/agenda/editar/:id" element={<EdicaoVisita />} />
          <Route path="/agenda/visualizar/:id" element={<VisualizacaoVisita />} />

          <Route path="/clientes" element={<ListagemClientes />} />
          <Route path="/clientes/novo" element={<CadastroCliente />} />
          <Route path="/clientes/editar/:id" element={<EdicaoCliente />} />
          <Route path="/clientes/visualizar/:id" element={<VisualizacaoCliente />} />

          <Route path="/ordens-servico" element={<ListagemOrdensServico />} />
          <Route path="/ordens-servico/novo" element={<CadastroOrdemServico />} />
          <Route path="/ordens-servico/editar/:id" element={<EdicaoOrdemServico />} />
          <Route path="/ordens-servico/visualizar/:id" element={<VisualizacaoOrdemServico />} />

          <Route path="/orcamentos" element={<ListagemOrcamentos />} />
          <Route path="/orcamentos/novo" element={<CadastroOrcamento />} />
          <Route path="/orcamentos/editar/:id" element={<EdicaoOrcamento />} />
          <Route path="/orcamentos/visualizar/:id" element={<VisualizacaoOrcamento />} />

          <Route path="/logs" element={<LogPage />} />
          <Route path="/painel-controle" element={<PainelControlePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;