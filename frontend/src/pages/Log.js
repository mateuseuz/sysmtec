import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Clientes.css';

function LogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.listarLogs();
        setLogs(data);
      } catch (error) {
        console.error('Erro ao buscar logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="sysmtec-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sysmtec-container">
      <header className="sysmtec-header">
        <h1>SYSMTEC</h1>
      </header>

      <div className="sysmtec-sidebar">
        <nav>
          <ul>
            <li><Link to="/agenda"><span>🗓️</span>Agenda</Link></li>
            <li><Link to="/clientes"><span>👥</span>Clientes</Link></li>
            <li><Link to="/ordens-servico"><span>🛠️</span>Ordens de Serviço</Link></li>
            <li><Link to="/orcamentos"><span>📄</span>Orçamentos</Link></li>
            <li className="active"><Link to="/logs"><span>📋</span>Log de alterações</Link></li>
          </ul>
        </nav>
      </div>
      <main className="sysmtec-main">
        <h2>Log de Alterações</h2>
        <div className="clientes-table-container">
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Autor</th>
                <th>Ação</th>
                <th>Data e Hora</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id_log}>
                  <td>{log.autor}</td>
                  <td>{log.acao}</td>
                  <td>{new Date(log.data).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default LogPage;
