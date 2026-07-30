import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Acompanhantes from './pages/Acompanhantes';
import Servicos from './pages/Servicos';
import Familias from './pages/Familias';
import Pricing from './pages/Pricing';
import Mensagens from './pages/Mensagens';
import Login from './Login';
import { estaAutenticado, limparToken } from './auth';
import './index.css';

function Sidebar({ onLogout }) {
  const menus = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/acompanhantes', icon: '🧑‍⚕️', label: 'Acompanhantes' },
    { path: '/servicos', icon: '📋', label: 'Servicos' },
    { path: '/familias', icon: '👨‍👩‍👧', label: 'Familias' },
    { path: '/pricing', icon: '💰', label: 'Pricing' },
    { path: '/mensagens', icon: '💬', label: 'Mensagens' },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">Sr. <span>Care</span> Admin</div>
      <nav className="sidebar-menu">
        {menus.map(m => (
          <NavLink key={m.path} to={m.path} end={m.path === '/'} className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}>
            <span className="icon">{m.icon}</span>
            {m.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={onLogout} style={{ margin: 16, padding: 10, cursor: 'pointer' }}>Sair</button>
    </div>
  );
}

export default function App() {
  const [logado, setLogado] = useState(estaAutenticado());

  if (!logado) {
    return <Login onLoginSucesso={() => setLogado(true)} />;
  }

  function handleLogout() {
    limparToken();
    setLogado(false);
  }

  return (
    <BrowserRouter>
      <Sidebar onLogout={handleLogout} />
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


