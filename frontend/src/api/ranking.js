const API_BASE_URL = 'http://localhost:8080/api';
const PASSWORD_RESET_BASE_URL = 'http://localhost:8080/password-reset';

export async function getWeeklyRanking() {
  const res = await fetch(`${API_BASE_URL}/ranking/weekly`);
  if (!res.ok) throw new Error('Erro ao buscar ranking');
  return res.json();
}

export async function requestPasswordResetCode(email) {
  const res = await fetch(`${PASSWORD_RESET_BASE_URL}/request-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Erro ao solicitar código');
  }
}

export async function confirmPasswordResetCode(email, code) {
  const res = await fetch(`${PASSWORD_RESET_BASE_URL}/confirm-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Código inválido ou expirado');
  }
}

export async function resetPassword(email, newPassword) {
  const res = await fetch(`${PASSWORD_RESET_BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Erro ao redefinir senha');
  }
}
