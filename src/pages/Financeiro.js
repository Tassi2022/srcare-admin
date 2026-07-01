import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';

export default function Financeiro() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL + '/admin/financeiro')
      .then(r => setDados(r.data))
      .catch(e => console.log(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Carregando financeiro...</div>;
  if (!dados) return (
    <div>
      <h1 className="page-title">Financeiro</h1>
      <div className="section" style={{textAlign:'center', padding:48}}>
        <div style={{fontSize:64, marginBottom:16}}>??</div>
        <h2 style={{color:'#333', marginBottom:8}}>Modulo de Pagamentos</h2>
        <p style={{color:'#888', marginBottom:24}}>A integracao com Mercado Pago sera implementada em breve.</p>
        <p style={{color:'#aaa', fontSize:13}}>Assim que os pagamentos forem configurados, os dados aparecerao aqui automaticamente.</p>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="page-title">Financeiro</h1>

      <div className="cards-grid">
        <div className="card card-green">
          <div className="card-icon">??</div>
          <div className="card-value">R$ {parseFloat(dados.resumo.receita_total || 0).toFixed(2)}</div>
          <div className="card-label">Receita Total</div>
        </div>
        <div className="card card-blue">
          <div className="card-icon">??</div>
          <div className="card-value">{dados.resumo.total_pagamentos || 0}</div>
          <div className="card-label">Total de Pagamentos</div>
        </div>
        <div className="card card-orange">
          <div className="card-icon">?</div>
          <div className="card-value">R$ {parseFloat(dados.resumo.pendente || 0).toFixed(2)}</div>
          <div className="card-label">Pendente</div>
        </div>
        <div className="card card-red">
          <div className="card-icon">?</div>
          <div className="card-value">R$ {parseFloat(dados.resumo.pago || 0).toFixed(2)}</div>
          <div className="card-label">Pago</div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Pagamentos por Acompanhante</h2>
        <table>
          <thead>
            <tr><th>Acompanhante</th><th>Servicos</th><th>Total Bruto</th><th>Comissao (20%)</th><th>Repasse (80%)</th></tr>
          </thead>
          <tbody>
            {(dados.por_acompanhante || []).map((a, i) => (
              <tr key={i}>
                <td><strong>{a.acompanhante_nome || 'Sem acompanhante'}</strong></td>
                <td>{a.total_servicos}</td>
                <td>R$ {parseFloat(a.total_bruto || 0).toFixed(2)}</td>
                <td style={{color:'#E74C3C'}}>R$ {(parseFloat(a.total_bruto || 0) * 0.20).toFixed(2)}</td>
                <td style={{color:'#27AE60'}}>R$ {(parseFloat(a.total_bruto || 0) * 0.80).toFixed(2)}</td>
              </tr>
            ))}
            {(!dados.por_acompanhante || dados.por_acompanhante.length === 0) && (
              <tr><td colSpan={5} style={{textAlign:'center', color:'#888', padding:24}}>Nenhum pagamento encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2 className="section-title">Ultimos Pagamentos</h2>
        <table>
          <thead>
            <tr><th>Servico</th><th>Familia</th><th>Valor</th><th>Status</th><th>Data</th></tr>
          </thead>
          <tbody>
            {(dados.ultimos_pagamentos || []).map((p, i) => (
              <tr key={i}>
                <td style={{maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.descricao || '-'}</td>
                <td>{p.familia_nome || '-'}</td>
                <td>R$ {parseFloat(p.valor_total || 0).toFixed(2)}</td>
                <td><span className={'badge badge-' + (p.status_pagamento || 'pendente')}>{p.status_pagamento || 'pendente'}</span></td>
                <td>{p.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR') : '-'}</td>
              </tr>
            ))}
            {(!dados.ultimos_pagamentos || dados.ultimos_pagamentos.length === 0) && (
              <tr><td colSpan={5} style={{textAlign:'center', color:'#888', padding:24}}>Nenhum pagamento encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

