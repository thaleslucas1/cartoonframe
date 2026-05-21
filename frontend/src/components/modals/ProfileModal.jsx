import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { getChallengeHistory, getChallengeByDate } from '../../api/challenge';
import { useModal } from '../../context/ModalContext';

function formatDate(dateString) {
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

export default function ProfileModal({ onViewChallenge }) {
  const { user, token, logout } = useAuth();
  const { closeModal } = useModal();
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  async function handleShowHistory() {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      const data = await getChallengeHistory(token);
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleViewChallenge(date) {
    const challenge = await getChallengeByDate(date, token, null);
    onViewChallenge(challenge);
    closeModal();
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  return (
    <Modal>
      <h2>Perfil do Usuário</h2>
      {user && (
        <>
          <p><strong>Nome:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Nickname:</strong> {user.nickname}</p>
          <p><strong>Score:</strong> {user.score}</p>
        </>
      )}
      <button onClick={handleShowHistory}>Jogos Anteriores</button>
      {showHistory && (
        <div>
          <h3>Desafios Anteriores (Últimos 7 dias)</h3>
          {loadingHistory ? (
            <p>Carregando...</p>
          ) : (
            <ul>
              {last7Days.map((date) => {
                const challenge = history.find((c) => c.date === date);
                return (
                  <li key={date}>
                    <span>{formatDate(date)}</span>
                    {challenge ? (
                      <>
                        <span style={{ color: challenge.completed ? 'lightgreen' : challenge.remainingGuesses === 0 ? 'salmon' : 'orange' }}>
                          {challenge.completed ? 'Acertou!' : challenge.remainingGuesses === 0 ? 'Errou' : 'Não concluído'}
                        </span>
                        <button onClick={() => handleViewChallenge(date)}>Ver Desafio</button>
                      </>
                    ) : (
                      <span style={{ color: 'gray' }}>N/A</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
      <button onClick={logout}>Sair da Conta</button>
    </Modal>
  );
}
