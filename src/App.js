import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Acompanhantes from './pages/Acompanhantes';
import Servicos from './pages/Servicos';
import Familias from './pages/Familias';
import Financeiro from './pages/Financeiro';
import './index.css';

function Sidebar() {
  const menus = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/acompanhantes', icon: '🧑‍⚕️', label: 'Acompanhantes' },
    { path: '/servicos', icon: '📋', label: 'Servicos' },
    { path: '/familias', icon: '👨‍👩‍👧', label: 'Familias' },
    { path: '/financeiro', icon: '💰', label: 'Financeiro' },
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
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/acompanhantes" element={<Acompanhantes />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/familias" element={<Familias />} />
          <Route path="/financeiro" element={<Financeiro />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
