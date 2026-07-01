import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API_URL from '../config';

const CORES = ['#4A90E2', '#27AE60', '#F39C12', '#E74C3C', '#9B59B6'];

export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL + '/admin/dashboard')
      .then(r => setDados(r.data))
      .catch(e => console.log(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Carregando dashboard...</div>;
  if (!dados) return <div className="loading">Erro ao carregar dados</div>;

  const { resumo, servicos_por_status, ultimos_servicos, acompanhantes_pendentes } = dados;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div className="cards-grid">
        <div className="card card-blue">
          <div className="card-icon">👥</div>
          <div className="card-value">{resumo.total_usuarios}</div>
          <div className="card-label">Total de Usuarios</div>
        </div>
        <div className="card card-green">
          <div className="card-icon">📋</div>
          <div className="card-value">{resumo.total_servicos}</div>
          <div className="card-label">Total de Servicos</div>
        </div>
        <div className="card card-orange">
          <div className="card-icon">🧑‍⚕️</div>
          <div className="card-value">{resumo.total_acompanhantes}</div>
          <div className="card-label">Acompanhantes</div>
        </div>
        <div className="card card-red">
          <div className="card-icon">📅</div>
          <div className="card-value">{resumo.servicos_hoje}</div>
          <div className="card-label">Servicos Hoje</div>
        </div>
        <div className="card card-green">
          <div className="card-icon">💰</div>
          <div className="card-value">R$ {parseFloat(resumo.receita_total).toFixed(2)}</div>
          <div className="card-label">Receita Total</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="section">
          <h2 className="section-title">Servicos por Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={servicos_por_status} dataKey="total" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({status, total}) => status + ': ' + total}>
                {servicos_por_status.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="section">
          <h2 className="section-title">Acompanhantes Pendentes ({acompanhantes_pendentes.length})</h2>
          {acompanhantes_pendentes.length === 0 ? (
            <p style={{color: '#888'}}>Nenhum pendente</p>
          ) : (
            <table>
              <thead><tr><th>Nome</th><th>Profissao</th><th>Acao</th></tr></thead>
              <tbody>
                {acompanhantes_pendentes.map(a => (
                  <tr key={a.id}>
                    <td>{a.nome}</td>
                    <td>{a.profissao}</td>
                    <td><a href="/acompanhantes" style={{color: '#4A90E2', fontSize: 13}}>Ver</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Ultimos Servicos</h2>
        <table>
          <thead>
            <tr><th>Descricao</th><th>Familia</th><th>Idoso</th><th>Acompanhante</th><th>Data</th><th>Status</th></tr>
          </thead>
          <tbody>
            {ultimos_servicos.map(s => (
              <tr key={s.id}>
                <td style={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{s.descricao}</td>
                <td>{s.familia_nome || '-'}</td>
                <td>{s.idoso_nome || '-'}</td>
                <td>{s.acompanhante_nome || <span style={{color:'#aaa'}}>Sem acomp.</span>}</td>
                <td>{new Date(s.inicio).toLocaleDateString('pt-BR')}</td>
                <td><span className={'badge badge-' + s.status}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
