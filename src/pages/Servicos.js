import React, { useState, useEffect } from 'react';
import api from '../auth';
import API_URL from '../config';

export default function Servicos() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    api.get(API_URL + '/admin/servicos')
      .then(r => setLista(r.data.servicos || []))
      .catch(e => console.log(e))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = lista.filter(s => filtro === 'todos' || s.status === filtro);

  if (loading) return <div className="loading">Carregando servicos...</div>;

  return (
    <div>
      <h1 className="page-title">Servicos</h1>

      <div style={{display:'flex', gap:8, marginBottom:24, flexWrap:'wrap'}}>
        {['todos', 'pendente', 'confirmado', 'em_andamento', 'concluido', 'cancelado'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            style={{padding:'8px 16px', borderRadius:20, border:'1px solid #ddd', cursor:'pointer', background: filtro === f ? '#4A90E2' : '#fff', color: filtro === f ? '#fff' : '#333', fontSize:13, fontWeight:'bold'}}>
            {f === 'todos' ? 'Todos' : f} ({lista.filter(s => f === 'todos' || s.status === f).length})
          </button>
        ))}
      </div>

      <div className="section">
        <table>
          <thead>
            <tr><th>Descricao</th><th>Familia</th><th>Idoso</th><th>Acompanhante</th><th>Data</th><th>Horas</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtrados.map(s => (
              <tr key={s.id}>
                <td style={{maxWidth:250, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.descricao || '-'}</td>
                <td>{s.familia_nome || '-'}</td>
                <td>{s.idoso_nome || '-'}</td>
                <td>{s.acompanhante_nome || <span style={{color:'#aaa'}}>Nenhum</span>}</td>
                <td>{new Date(s.inicio).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})}</td>
                <td>{s.horas_contratadas}h</td>
                <td><span className={'badge badge-' + s.status}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && <p style={{textAlign:'center', color:'#888', padding:24}}>Nenhum servico encontrado</p>}
      </div>
    </div>
  );
}
