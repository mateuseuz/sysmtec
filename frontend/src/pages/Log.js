import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/Clientes.css';
import '../styles/Orcamentos.css'; // Para o estilo do botão

function LogPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleClearLogs = async () => {
    try {
      await api.limparLogs();
      toast.success('Histórico de logs limpo com sucesso!');
      setLogs([]);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(`Erro ao limpar logs: ${error.message}`);
    }
  };

  return (
    <>
      <div className="form-actions">
        <button onClick={() => navigate('/painel-controle')} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> VOLTAR
        </button>
        <button onClick={() => setIsModalOpen(true)} className="export-pdf-button">
          <FontAwesomeIcon icon={faTrash} /> LIMPAR LOGS
        </button>
      </div>

      <div className="clientes-table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Autor</th>
              <th>Ação</th>
              <th>Alvo</th>
              <th>Data e Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id_log}>
                  <td>{log.autor}</td>
                  <td>{log.acao}</td>
                  <td>{log.alvo}</td>
                  <td>{new Date(log.data).toLocaleString('pt-BR')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum log encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleClearLogs}
        title="Confirmar Limpeza de Logs"
        message="Você tem certeza que deseja apagar permanentemente todo o histórico de logs? Esta ação não pode ser desfeita."
      />
    </>
  );
}

export default LogPage;
