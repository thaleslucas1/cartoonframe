import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile } from '../api/auth';

const AuthContext = createContext(null);

function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('jwtToken'));
  const [user, setUser] = useState(null);
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = generateUuid();
      localStorage.setItem('sessionId', id);
    }
    return id;
  });

  const loadUser = useCallback(async (t) => {
    try {
      const profile = await getProfile(t);
      setUser(profile);
    } catch {
      logout();
    }
  }, []);

  useEffect(() => {
    if (token) loadUser(token);
  }, [token, loadUser]);

  function loginSuccess(data) {
    localStorage.setItem('jwtToken', data.token);
    setToken(data.token);
  }

  function logout() {
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, setUser, sessionId, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
