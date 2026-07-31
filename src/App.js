import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Acompanhantes from './pages/Acompanhantes';
import Servicos from './pages/Servicos';
import Familias from './pages/Familias';
import Pricing from './pages/Pricing';
import Mensagens from './pages/Mensagens';
import Login from './Login';
import api, { estaAutenticado, limparToken } from './auth';
import API_URL from './config';
import './index.css';

function tocarBeep() {
  try {
    const AudioContextClasse = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClasse();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.log('Erro ao tocar som:', e.message);
  }
}

function Sidebar({ onLogout, naoLidas }) {
  const menus = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/acompanhantes', icon: '🧑‍⚕️', label: 'Acompanhantes' },
    { path: '/servicos', icon: '📋', label: 'Servicos' },
    { path: '/familias', icon: '👨‍👩‍👧', label: 'Familias' },
    { path: '/pricing', icon: '💰', label: 'Pricing' },
    { path: '/mensagens', icon: '💬', label: 'Mensagens', badge: naoLidas },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">Sr. <span>Care</span> Admin</div>
      <nav className="sidebar-menu">
        {menus.map(m => (
          <NavLink key={m.path} to={m.path} end={m.path === '/'} className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')} style={{ position: 'relative' }}>
            <span className="icon">{m.icon}</span>
            {m.label}
            {m.badge > 0 && (
              <span style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                background: '#e74c3c', color: '#fff', borderRadius: 10, fontSize: 11,
                fontWeight: 'bold', padding: '2px 7px', minWidth: 18, textAlign: 'center',
              }}>
                {m.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <button onClick={onLogout} style={{ margin: 16, padding: 10, cursor: 'pointer' }}>Sair</button>
    </div>
  );
}

export default function App() {
  const [logado, setLogado] = useState(estaAutenticado());
  const [naoLidas, setNaoLidas] = useState(0);
  const naoLidasAnteriorRef = useRef(0);

  useEffect(() => {
    if (!logado) return;

    const buscarNaoLidas = () => {
      api.get(API_URL + '/mensagens/conversas')
        .then(r => {
          const total = (r.data.conversas || []).reduce((soma, c) => soma + (parseInt(c.nao_lidas) || 0), 0);
          if (total > naoLidasAnteriorRef.current) {
            tocarBeep();
          }
          naoLidasAnteriorRef.current = total;
          setNaoLidas(total);
        })
        .catch(e => console.log(e));
    };

    buscarNaoLidas();
    const interval = setInterval(buscarNaoLidas, 15000);
    return () => clearInterval(interval);
  }, [logado]);

  if (!logado) {
    return <Login onLoginSucesso={() => setLogado(true)} />;
  }

  function handleLogout() {
    limparToken();
    setLogado(false);
  }

  return (
    <BrowserRouter>
      <Sidebar onLogout={handleLogout} naoLidas={naoLidas} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/acompanhantes" element={<Acompanhantes />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/familias" element={<Familias />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/mensagens" element={<Mensagens />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
