import React, { useState, useEffect } from 'react';
import api from '../auth';
import API_URL from '../config';

const PROFISSOES = {
  estudante_enfermagem: 'Estudante de Enfermagem',
  tecnico_enfermagem: 'Tecnico em Enfermagem',
  enfermeiro: 'Enfermeiro(a)',
  bombeiro_civil: 'Bombeiro Civil',
  cuidador_idosos: 'Cuidador de Idosos',
  auxiliar_enfermagem: 'Auxiliar de Enfermagem',
  fisioterapeuta: 'Fisioterapeuta',
  massoterapeuta: 'Massoterapeuta',
  personal_trainer: 'Personal Trainer',
  outro: 'Outro',
};

export default function Acompanhantes() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [selecionado, setSelecionado] = useState(null);
  const [processando, setProcessando] = useState(null);

  const carregar = async () => {
    try {
      const res = await api.get(API_URL + '/admin/acompanhantes');
      setLista(res.data.acompanhantes || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const verificar = async (id, status) => {
    setProcessando(id);
    try {
      await api.put(API_URL + '/admin/acompanhantes/' + id + '/verificar', { status });
      alert('Status atualizado para: ' + status);
      carregar();
      setSelecionado(null);
    } catch (e) {
      alert('Erro ao atualizar status');
    } finally {
      setProcessando(null);
    }
  };

  const filtrados = lista.filter(a => filtro === 'todos' || a.status_verificacao === filtro);

  if (loading) return <div className="loading">Carregando acompanhantes...</div>;

  return (
    <div>
      <h1 className="page-title">Acompanhantes</h1>

      <div style={{display: 'flex', gap: 8, marginBottom: 24}}>
        {['todos', 'pendente', 'aprovado', 'reprovado'].map(f => (
          <button key={f} className={'btn ' + (filtro === f ? 'btn-blue' : '')} onClick={() => setFiltro(f)}
            style={{background: filtro === f ? '#4A90E2' : '#fff', color: filtro === f ? '#fff' : '#333', border: '1px solid #ddd'}}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({lista.filter(a => f === 'todos' || a.status_verificacao === f).length})
          </button>
        ))}
      </div>

      <div className="section">
        <table>
          <thead>
            <tr><th>Foto</th><th>Nome</th><th>Email</th><th>Profissao</th><th>CPF</th><th>Status</th><th>Acao</th></tr>
          </thead>
          <tbody>
            {filtrados.map(a => (
              <tr key={a.id}>
                <td>
                  {a.foto_perfil_url ? <img src={a.foto_perfil_url} alt="perfil" className="foto-perfil" onError={e => e.target.style.display='none'} /> : <div className="foto-perfil" style={{background:'#ddd', display:'flex', alignItems:'center', justifyContent:'center'}}>??</div>}
                </td>
                <td><strong>{a.nome}</strong></td>
                <td style={{color:'#888', fontSize:13}}>{a.email}</td>
                <td>{PROFISSOES[a.profissao] || a.profissao || '-'}</td>
                <td style={{fontFamily:'monospace'}}>{a.cpf || '-'}</td>
                <td><span className={'badge badge-' + (a.status_verificacao || 'pendente')}>{a.status_verificacao || 'pendente'}</span></td>
                <td>
                  <button className="btn btn-blue" onClick={() => setSelecionado(a)} style={{fontSize:12}}>Ver docs</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selecionado && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <div style={{background:'#fff', borderRadius:16, padding:32, maxWidth:600, width:'90%', maxHeight:'80vh', overflowY:'auto'}}>
            <h2 style={{marginBottom:16}}>{selecionado.nome}</h2>
            <p style={{color:'#888', marginBottom:8}}>{selecionado.email} | {selecionado.telefone}</p>
            <p style={{marginBottom:16}}><strong>Profissao:</strong> {PROFISSOES[selecionado.profissao] || selecionado.profissao}</p>
            <p style={{marginBottom:16}}><strong>Bio:</strong> {selecionado.bio || '-'}</p>
            <p style={{marginBottom:8}}><strong>CPF:</strong> {selecionado.cpf || '-'} | <strong>{selecionado.tipo_documento || 'RG'}:</strong> {selecionado.rg_cnh || '-'}</p>
            {selecionado.data_nascimento && <p style={{marginBottom:16}}><strong>Nascimento:</strong> {new Date(selecionado.data_nascimento).toLocaleDateString('pt-BR')}</p>}

            <div style={{background:'#f7f9fc', border:'1px solid #e3e8ee', borderRadius:10, padding:16, marginBottom:16}}>
              <p style={{fontSize:13, color:'#888', marginBottom:8, fontWeight:600}}>Dados Bancarios / PIX</p>
              <p style={{marginBottom:4}}><strong>Chave PIX:</strong> {selecionado.chave_pix || '-'}</p>
              <p style={{marginBottom:4}}><strong>Banco:</strong> {selecionado.banco || '-'}</p>
              <p style={{marginBottom:0}}><strong>Agencia:</strong> {selecionado.agencia || '-'} | <strong>Conta:</strong> {selecionado.conta_corrente || '-'}</p>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24}}>
              {selecionado.foto_documento_url && (
                <div>
                  <p style={{fontSize:13, color:'#888', marginBottom:8}}>Documento ({selecionado.tipo_documento || 'RG'})</p>
                  <img src={selecionado.foto_documento_url} alt="documento" style={{width:'100%', borderRadius:8, border:'1px solid #ddd'}} onError={e => e.target.src='https://via.placeholder.com/200x150?text=Erro'} />
                </div>
              )}
              {selecionado.foto_certificado_url && (
                <div>
                  <p style={{fontSize:13, color:'#888', marginBottom:8}}>Certificado</p>
                  <img src={selecionado.foto_certificado_url} alt="certificado" style={{width:'100%', borderRadius:8, border:'1px solid #ddd'}} onError={e => e.target.src='https://via.placeholder.com/200x150?text=Erro'} />
                </div>
              )}
            </div>

            <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
              <button className="btn" onClick={() => setSelecionado(null)} style={{background:'#eee', color:'#333'}}>Fechar</button>
              {selecionado.status_verificacao !== 'aprovado' && (
                <button className="btn btn-green" onClick={() => verificar(selecionado.id, 'aprovado')} disabled={processando === selecionado.id}>
                  {processando === selecionado.id ? '...' : 'Aprovar'}
                </button>
              )}
              {selecionado.status_verificacao !== 'reprovado' && (
                <button className="btn btn-red" onClick={() => verificar(selecionado.id, 'reprovado')} disabled={processando === selecionado.id}>
                  {processando === selecionado.id ? '...' : 'Reprovar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


