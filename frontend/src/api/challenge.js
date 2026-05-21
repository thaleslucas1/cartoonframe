const API_BASE_URL = 'http://localhost:8080/api';

function buildHeaders(token, sessionId, isJson = false) {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (sessionId) {
    headers['X-Session-ID'] = sessionId;
  }
  return headers;
}

export async function getDailyChallenge(token, sessionId) {
  const res = await fetch(`${API_BASE_URL}/challenge/today`, {
    headers: buildHeaders(token, sessionId),
  });
  if (!res.ok) throw new Error('Erro ao buscar desafio diário');
  return res.json();
}

export async function getChallengeByDate(date, token, sessionId) {
  const res = await fetch(`${API_BASE_URL}/challenge/by-date/${date}`, {
    headers: buildHeaders(token, sessionId),
  });
  if (!res.ok) throw new Error('Erro ao buscar desafio por data');
  return res.json();
}

export async function submitGuess(guess, challengeId, token, sessionId) {
  const res = await fetch(`${API_BASE_URL}/challenge/try`, {
    method: 'POST',
    headers: buildHeaders(token, sessionId, true),
    body: JSON.stringify({ guess, challengeId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro ao enviar palpite');
  return data;
}

export async function getChallengeHistory(token) {
  const res = await fetch(`${API_BASE_URL}/challenge/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Erro ao buscar histórico');
  return res.json();
}
