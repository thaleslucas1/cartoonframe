import { useState } from 'react';
import Modal from './Modal';
import { useModal, MODALS } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import { register } from '../../api/auth';

export default function RegisterModal() {
  const { openModal, closeModal } = useModal();
  const { loginSuccess } = useAuth();
  const [form, setForm] = useState({ name: '', nickname: '', email: '', password: '' });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await register(form.name, form.nickname, form.email, form.password);
      loginSuccess(data);
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal>
      <h2>Cadastro</h2>
      <form onSubmit={handleSubmit}>
        <label>Nome Completo:</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} required />
        <label>Nickname:</label>
        <input type="text" name="nickname" value={form.nickname} onChange={handleChange} required />
        <label>Email:</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Senha:</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />
        <button type="submit">Registrar</button>
        {error && <p className="mensagem erro">{error}</p>}
      </form>
      <p>Já tem conta? <button className="link-button" onClick={() => openModal(MODALS.LOGIN)}>Login</button></p>
    </Modal>
  );
}
