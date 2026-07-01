import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';

export default function Familias() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL + '/admin/familias')
      .then(r => setLista(r.data.familias || []))
      .catch(e => console.log(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Carregando familias...</div>;

  return (
    <div>
      <h1 className="page-title">Familias ({lista.length})</h1>
      <div className="section">
        <table>
          <thead>
            <tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Cidade</th><th>Servicos</th><th>Cadastro</th></tr>
          </thead>
          <tbody>
            {lista.map(f => (
              <tr key={f.id}>
                <td><strong>{f.nome}</strong></td>
                <td style={{color:'#888', fontSize:13}}>{f.email}</td>
                <td>{f.telefone || '-'}</td>
                <td>{f.cidade ? f.cidade + '/' + f.estado : '-'}</td>
                <td><span style={{background:'#e8f0fe', color:'#4A90E2', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:'bold'}}>{f.total_servicos || 0}</span></td>
                <td style={{fontSize:12, color:'#888'}}>{new Date(f.criado_em).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && <p style={{textAlign:'center', color:'#888', padding:24}}>Nenhuma familia encontrada</p>}
      </div>
    </div>
  );
}
