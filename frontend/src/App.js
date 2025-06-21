import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ListaClientes from './pages/clientes/ListaClientes';
import CadastroCliente from './pages/clientes/CadastroCliente';
import EditarCliente from './pages/clientes/EditarCliente';
import VisualizarCliente from './pages/clientes/VisualizarCliente';

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
        theme="colored" // Recomendado para usar nossos backgrounds customizados diretamente
      />
      <Routes>
        <Route path="/" element={<Navigate to="/clientes" replace />} />
        <Route path="/clientes" element={<ListaClientes />} />
        <Route path="/clientes/novo" element={<CadastroCliente />} />
        <Route path="/clientes/editar/:id" element={<EditarCliente />} />
        <Route path="/clientes/visualizar/:id" element={<VisualizarCliente />} /> {/* Nova rota adicionada */}
      </Routes>
    </Router>
  );
}

export default App;
