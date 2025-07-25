import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ListaClientes from './pages/clientes/ListaClientes';
import CadastroCliente from './pages/clientes/CadastroCliente';
import EditarCliente from './pages/clientes/EditarCliente';
import VisualizarCliente from './pages/clientes/VisualizarCliente';
import ListaOrdensServico from './pages/ordensServico/ListaOrdensServico';
import CadastroOrdemServico from './pages/ordensServico/CadastroOrdemServico';
import EditarOrdemServico from './pages/ordensServico/EditarOrdemServico';
import VisualizarOrdemServico from './pages/ordensServico/VisualizarOrdemServico';
import ListaOrcamentos from './pages/orcamentos/ListaOrcamentos';
import CadastroOrcamento from './pages/orcamentos/CadastroOrcamento';
import EditarOrcamento from './pages/orcamentos/EditarOrcamento';
import VisualizarOrcamento from './pages/orcamentos/VisualizarOrcamento';

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000} // Fecha automaticamente após 5 segundos
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
        <Route path="/" element={<Navigate to="/clientes" replace />} />
        <Route path="/clientes" element={<ListaClientes />} />
        <Route path="/clientes/novo" element={<CadastroCliente />} />
        <Route path="/clientes/editar/:id" element={<EditarCliente />} />
        <Route path="/clientes/visualizar/:id" element={<VisualizarCliente />} />

        <Route path="/ordens-servico" element={<ListaOrdensServico />} />
        <Route path="/ordens-servico/novo" element={<CadastroOrdemServico />} />
        <Route path="/ordens-servico/editar/:id" element={<EditarOrdemServico />} />
        <Route path="/ordens-servico/visualizar/:id" element={<VisualizarOrdemServico />} />

        <Route path="/orcamentos" element={<ListaOrcamentos />} />
        <Route path="/orcamentos/novo" element={<CadastroOrcamento />} />
        <Route path="/orcamentos/editar/:id" element={<EditarOrcamento />} />
        <Route path="/orcamentos/visualizar/:id" element={<VisualizarOrcamento />} />
      </Routes>
    </Router>
  );
}

export default App;