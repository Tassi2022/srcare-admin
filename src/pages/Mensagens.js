import React, { useState, useEffect } from 'react';
import api from '../auth';
import API_URL from '../config';

export default function Mensagens() {
  const [conversas, setConversas] = useState([]);
  const [selecionado, setSelecionado] = useState(null); // { id, tipo }
  const [selecionadoNome, setSelecionadoNome] = useState('');
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [carregandoConversas, setCarregandoConversas] = useState(true);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [busca, setBusca] = useState('');
  const [acompanhantes, setAcompanhantes] = useState([]);
  const [familias, setFamilias] = useState([]);

  useEffect(() => {
    carregarConversas();
    carregarAcompanhantes();
    carregarFamilias();
  }, []);

  function carregarConversas() {
    setCarregandoConversas(true);
    api.get(API_URL + '/mensagens/conversas')
      .then(r => setConversas(r.data.conversas))
      .catch(e => console.log(e))
      .finally(() => setCarregandoConversas(false));
  }

  function carregarAcompanhantes() {
    api.get(API_URL + '/admin/acompanhantes')
      .then(r => setAcompanhantes(r.data.acompanhantes || []))
      .catch(e => console.log(e));
  }

  function carregarFamilias() {
    api.get(API_URL + '/admin/familias')
      .then(r => setFamilias(r.data.familias || []))
      .catch(e => console.log(e));
  }

  function abrirConversa(id, tipo, nome) {
    setSelecionado({ id, tipo });
    setSelecionadoNome(nome);
    setBusca('');
    setCarregandoMensagens(true);
    const params = tipo === 'acompanhante'
      ? { acompanhante_id: id, marcar_lido_por: 'admin' }
      : { familia_id: id, marcar_lido_por: 'admin' };
    api.get(API_URL + '/mensagens', { params })
      .then(r => setMensagens(r.data.mensagens))
      .catch(e => console.log(e))
      .finally(() => {
        setCarregandoMensagens(false);
        setConversas(prev => prev.map(c => c.participante_id === id ? { ...c, nao_lidas: 0 } : c));
      });
  }

  async function enviarMensagem(e) {
    e.preventDefault();
    if (!texto.trim() || !selecionado) return;

    setEnviando(true);
    try {
      const body = selecionado.tipo === 'acompanhante'
        ? { acompanhante_id: selecionado.id, remetente: 'admin', texto: texto.trim() }
        : { familia_id: selecionado.id, remetente: 'admin', texto: texto.trim() };
      const resp = await api.post(API_URL + '/mensagens', body);
      setMensagens(prev => [...prev, resp.data.mensagem]);
      setTexto('');
      carregarConversas();
    } catch (e2) {
      alert('Não foi possível enviar a mensagem.');
    } finally {
      setEnviando(false);
    }
  }

  const idsComConversa = new Set(conversas.map(c => c.participante_id));

  const resultadosBuscaAcomp = busca.trim()
    ? acompanhantes.filter(a => (a.nome || '').toLowerCase().includes(busca.trim().toLowerCase()))
    : [];
  const resultadosBuscaFamilia = busca.trim()
    ? familias.filter(f => (f.nome || '').toLowerCase().includes(busca.trim().toLowerCase()))
    : [];

  return (
    <div>
      <h1 className="page-title">Chat de Suporte</h1>

      <div style={{ display: 'flex', height: '75vh', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>

        {/* Lista de conversas + busca */}
        <div style={{ width: 320, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 12, borderBottom: '1px solid #eee' }}>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar acompanhante ou familia..."
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {busca.trim() ? (
              (resultadosBuscaAcomp.length === 0 && resultadosBuscaFamilia.length === 0) ? (
                <div style={{ padding: 16, color: '#888', fontSize: 13 }}>Nenhum resultado encontrado</div>
              ) : (
                <>
                  {resultadosBuscaAcomp.map(a => (
                    <div
                      key={'acomp-' + a.id}
                      onClick={() => abrirConversa(a.id, 'acompanhante', a.nome)}
                      style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', background: selecionado && selecionado.id === a.id ? '#eef4fa' : '#fff' }}
                    >
                      <strong style={{ fontSize: 14 }}>{a.nome}</strong>
                      <span style={{ fontSize: 10, marginLeft: 6, padding: '2px 6px', borderRadius: 8, background: '#e8f0fe', color: '#4A90E2' }}>Acompanhante</span>
                      <div style={{ fontSize: 12, color: '#888' }}>{idsComConversa.has(a.id) ? 'Já tem conversa' : 'Iniciar nova conversa'}</div>
                    </div>
                  ))}
                  {resultadosBuscaFamilia.map(f => (
                    <div
                      key={'fam-' + f.id}
                      onClick={() => abrirConversa(f.id, 'familia', f.nome)}
                      style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', background: selecionado && selecionado.id === f.id ? '#eef4fa' : '#fff' }}
                    >
                      <strong style={{ fontSize: 14 }}>{f.nome}</strong>
                      <span style={{ fontSize: 10, marginLeft: 6, padding: '2px 6px', borderRadius: 8, background: '#eafaf0', color: '#27AE60' }}>Familia</span>
                      <div style={{ fontSize: 12, color: '#888' }}>{idsComConversa.has(f.id) ? 'Já tem conversa' : 'Iniciar nova conversa'}</div>
                    </div>
                  ))}
                </>
              )
            ) : carregandoConversas ? (
              <div style={{ padding: 16, color: '#888' }}>Carregando...</div>
            ) : conversas.length === 0 ? (
              <div style={{ padding: 16, color: '#888' }}>Nenhuma conversa ainda</div>
            ) : (
              conversas.map(c => (
                <div
                  key={c.tipo + '-' + c.participante_id}
                  onClick={() => abrirConversa(c.participante_id, c.tipo, c.participante_nome)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    background: selecionado && selecionado.id === c.participante_id ? '#eef4fa' : '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <strong style={{ fontSize: 14 }}>{c.participante_nome || 'Sem nome'}</strong>
                      <span style={{ fontSize: 10, marginLeft: 6, padding: '2px 6px', borderRadius: 8, background: c.tipo === 'acompanhante' ? '#e8f0fe' : '#eafaf0', color: c.tipo === 'acompanhante' ? '#4A90E2' : '#27AE60' }}>
                        {c.tipo === 'acompanhante' ? 'Acompanhante' : 'Familia'}
                      </span>
                    </span>
                    {c.nao_lidas > 0 && (
                      <span style={{ background: '#e74c3c', color: '#fff', borderRadius: 10, fontSize: 11, padding: '2px 7px' }}>
                        {c.nao_lidas}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.ultima_remetente === 'admin' ? 'Você: ' : ''}{c.ultima_mensagem}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Janela do chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selecionado ? (
            <div style={{ margin: 'auto', color: '#888' }}>Selecione uma conversa ou busque um contato</div>
          ) : (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                {selecionadoNome} <span style={{ fontSize: 12, color: '#888', fontWeight: 'normal' }}>({selecionado.tipo === 'acompanhante' ? 'Acompanhante' : 'Familia'})</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {carregandoMensagens ? (
                  <div style={{ color: '#888' }}>Carregando mensagens...</div>
                ) : mensagens.length === 0 ? (
                  <div style={{ color: '#888' }}>Nenhuma mensagem ainda. Envie a primeira!</div>
                ) : (
                  mensagens.map(m => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        justifyContent: m.remetente === 'admin' ? 'flex-end' : 'flex-start',
                        marginBottom: 8,
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        padding: '8px 12px',
                        borderRadius: 12,
                        background: m.remetente === 'admin' ? '#3f7ca8' : '#f0f0f0',
                        color: m.remetente === 'admin' ? '#fff' : '#333',
                        fontSize: 14,
                      }}>
                        {m.texto}
                        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
                          {new Date(m.criado_em).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={enviarMensagem} style={{ display: 'flex', padding: 12, borderTop: '1px solid #eee', gap: 8 }}>
                <input
                  type="text"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
                />
                <button type="submit" disabled={enviando} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#3f7ca8', color: '#fff', cursor: 'pointer' }}>
                  {enviando ? 'Enviando...' : 'Enviar'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
