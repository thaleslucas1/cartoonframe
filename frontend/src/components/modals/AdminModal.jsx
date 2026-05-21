import { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080/api';

export default function AdminModal() {
  const { token } = useAuth();
  const [form, setForm] = useState({ imageUrls: '', correctAnswer: '', releaseDate: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(''); setError('');
    const imageUrls = form.imageUrls.split(',').map((u) => u.trim()).filter(Boolean);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageUrls, correctAnswer: form.correctAnswer, releaseDate: form.releaseDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao criar desafio');
      setMessage('Desafio criado com sucesso!');
      setForm({ imageUrls: '', correctAnswer: '', releaseDate: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal>
      <h2>Página do Administrador</h2>
      <h3>Criar Novo Desafio</h3>
      <form onSubmit={handleSubmit}>
        <label>URLs das Imagens (separadas por vírgula):</label>
        <input type="text" name="imageUrls" value={form.imageUrls} onChange={handleChange} placeholder="url1,url2,url3" required />
        <label>Resposta Correta:</label>
        <input type="text" name="correctAnswer" value={form.correctAnswer} onChange={handleChange} required />
        <label>Data de Lançamento:</label>
        <input type="date" name="releaseDate" value={form.releaseDate} onChange={handleChange} required />
        <button type="submit">Criar Desafio</button>
        {message && <p className="mensagem sucesso">{message}</p>}
        {error && <p className="mensagem erro">{error}</p>}
      </form>
    </Modal>
  );
}
