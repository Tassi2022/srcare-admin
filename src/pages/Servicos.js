import React, { useState, useEffect } from 'react';
import api from '../auth';
import API_URL from '../config';

export default function Servicos() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [modalVisivel, setModalVisivel] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [horasExtras, setHorasExtras] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [cobrar, setCobrar] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const carregar = () => {
    api.get(API_URL + '/admin/servicos')
      .then(r => setLista(r.data.servicos || []))
      .catch(e => console.log(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const filtrados = lista.filter(s => filtro === 'todos' || s.status === filtro);

  const abrirModal = (servico) => {
    setServicoSelecionado(servico);
    setHorasExtras('');
    setJustificativa('');
    setCobrar(true);
    setModalVisivel(true);
  };

  const enviarHoraAvulsa = async () => {
    const horasNum = parseFloat(horasExtras.replace(',', '.'));
    if (!horasNum || horasNum <= 0) {
      alert('Informe um número de horas válido.');
      return;
    }
    setEnviando(true);
    try {
      const resp = await api.post(API_URL + '/admin/horas-avulsas', {
        servico_id: servicoSelecionado.id,
        horas_extras: horasNum,
        justificativa: justificativa.trim() || null,
        cobrar,
      });
      if (cobrar) {
        alert('Cobrança criada! Valor: R$ ' + Number(resp.data.valor).toFixed(2) + '. A família foi avisada por email e pode pagar pelo app.');
      } else {
        alert('Horas adicionadas diretamente ao serviço, sem cobrança.');
      }
      setModalVisivel(false);
      carregar();
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.erro ? err.response.data.erro : 'Não foi possível adicionar a hora avulsa.';
      alert(msg);
    } finally {
      setEnviando(false);
    }
  };

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
            <tr><th>Descricao</th><th>Familia</th><th>Idoso</th><th>Acompanhante</th><th>Data</th><th>Horas</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {filtrados.map(s => (
              <tr key={s.id}>
                <td style={{maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.descricao || '-'}</td>
                <td>{s.familia_nome || '-'}</td>
                <td>{s.idoso_nome || '-'}</td>
                <td>{s.acompanhante_nome || <span style={{color:'#aaa'}}>Nenhum</span>}</td>
                <td>{new Date(s.inicio).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})}</td>
                <td>{s.horas_contratadas}h</td>
                <td><span className={'badge badge-' + s.status}>{s.status}</span></td>
                <td>
                  {s.acompanhante_nome && (
                    <button
                      onClick={() => abrirModal(s)}
                      style={{ fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1px solid #f0ad4e', background: '#fff3cd', color: '#8a6d3b', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      + Hora Avulsa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && <p style={{textAlign:'center', color:'#888', padding:24}}>Nenhum servico encontrado</p>}
      </div>

      {modalVisivel && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 420, width: '90%' }}>
            <h2 style={{ marginTop: 0, marginBottom: 4 }}>Adicionar Hora Avulsa</h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
              {servicoSelecionado.idoso_nome} — {servicoSelecionado.acompanhante_nome}
            </p>

            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Horas extras</label>
            <input
              type="text"
              value={horasExtras}
              onChange={(e) => setHorasExtras(e.target.value.replace(/[^0-9.,]/g, ''))}
              placeholder="Ex: 1 ou 1.5"
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 16, boxSizing: 'border-box' }}
            />

            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Justificativa</label>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Ex: Ajuste manual por atraso no atendimento anterior"
              rows={3}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 16, boxSizing: 'border-box', fontFamily: 'inherit' }}
            />

            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Cobrar da família?</label>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button
                onClick={() => setCobrar(true)}
                style={{ flex: 1, padding: 10, borderRadius: 8, border: cobrar ? '2px solid #27AE60' : '1px solid #ddd', background: cobrar ? '#eafaf0' : '#fff', color: cobrar ? '#27AE60' : '#666', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Sim, cobrar
              </button>
              <button
                onClick={() => setCobrar(false)}
                style={{ flex: 1, padding: 10, borderRadius: 8, border: !cobrar ? '2px solid #e67e22' : '1px solid #ddd', background: !cobrar ? '#fdf2e3' : '#fff', color: !cobrar ? '#e67e22' : '#666', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Não, ajuste manual
              </button>
            </div>

            {!cobrar && (
              <p style={{ fontSize: 12, color: '#e67e22', background: '#fdf2e3', padding: 10, borderRadius: 8, marginBottom: 16 }}>
                As horas serão somadas direto ao serviço, sem gerar cobrança pra família.
              </p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setModalVisivel(false)}
                disabled={enviando}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={enviarHoraAvulsa}
                disabled={enviando}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#4A90E2', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {enviando ? 'Enviando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
