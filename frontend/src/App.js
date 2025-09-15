import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { setToken } from './api/apiClient';

function App() {
  const [token, setTokenState] = useState(null);
  const [tenantId, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false); // NEW: toggle between login/register

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedTenant = localStorage.getItem('tenantId');
    if (savedToken) setTokenState(savedToken);
    if (savedTenant) setTenant(savedTenant);
    setLoading(false);
  }, []);

  const onLogin = (t, tid) => {
    setToken(t);
    setTokenState(t);
    setTenant(tid);
    localStorage.setItem('token', t);
    localStorage.setItem('tenantId', tid);
  };

  const onLogout = () => {
    setToken(null);
    setTokenState(null);
    setTenant(null);
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
  };

  if (loading) return <p>Loading...</p>;
  if (!token) {
    return showRegister ? (
      <Register onRegister={onLogin} goToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={onLogin} goToRegister={() => setShowRegister(true)} />
    );
  }

  return <Dashboard tenantId={tenantId} onLogout={onLogout} />;
}

export default App;
