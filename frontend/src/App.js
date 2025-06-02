import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ListaClientes from './pages/clientes/ListaClientes';
import CadastroCliente from './pages/clientes/CadastroCliente';
import EditarCliente from './pages/clientes/EditarCliente';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/clientes" replace />} />
        <Route path="/clientes" element={<ListaClientes />} />
        <Route path="/clientes/novo" element={<CadastroCliente />} />
        <Route path="/clientes/editar/:id" element={<EditarCliente />} />
      </Routes>
    </Router>
  );
}

export default App;
