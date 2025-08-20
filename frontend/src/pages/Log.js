import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/Log.css';

function LogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/logs');
        setLogs(response.data);
      } catch (error) {
        console.error('Erro ao buscar logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <div className="loading-container">Carregando...</div>;
  }

  return (
    <div className="log-container">
      <h2>Log de Alterações</h2>
      <table className="log-table">
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
  );
}

export default LogPage;
