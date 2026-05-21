const AUTH_BASE_URL = 'http://localhost:8080/auth';

export async function login(identifier, password) {
  const res = await fetch(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro ao fazer login');
  return data;
}

export async function register(name, nickname, email, password) {
  const res = await fetch(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, nickname, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro ao registrar');
  return data;
}

export async function getProfile(token) {
  const res = await fetch(`${AUTH_BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Token inválido ou expirado');
  return res.json();
}

export async function verifyEmail(uuid) {
  const res = await fetch(`${AUTH_BASE_URL}/verify?uuid=${uuid}`);
  if (!res.ok) throw new Error('Erro ao verificar email');
}
