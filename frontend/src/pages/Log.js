import React, { useState, useEffect } from 'react';
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
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando logs...</p>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}

export default LogPage;
