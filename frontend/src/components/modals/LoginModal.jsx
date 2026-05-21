import { useState } from 'react';
import Modal from './Modal';
import { useModal, MODALS } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../api/auth';

export default function LoginModal() {
  const { openModal, closeModal } = useModal();
  const { loginSuccess } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await login(identifier, password);
      loginSuccess(data);
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email ou Nickname:</label>
        <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
        <label>Senha:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Entrar</button>
        {error && <p className="mensagem erro">{error}</p>}
      </form>
      <p>Não tem conta? <button className="link-button" onClick={() => openModal(MODALS.REGISTER)}>Cadastre-se</button></p>
      <p><button className="link-button" onClick={() => openModal(MODALS.FORGOT_PASSWORD)}>Esqueceu a senha?</button></p>
    </Modal>
  );
}
