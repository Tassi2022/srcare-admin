import React, { useState, useEffect } from 'react';
import api from '../auth';
import API_URL from '../config';

export default function Mensagens() {
  const [conversas, setConversas] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [carregandoConversas, setCarregandoConversas] = useState(true);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarConversas();
  }, []);

  function carregarConversas() {
    setCarregandoConversas(true);
    api.get(API_URL + '/mensagens/conversas')
      .then(r => setConversas(r.data.conversas))
      .catch(e => console.log(e))
      .finally(() => setCarregandoConversas(false));
  }

  function abrirConversa(acompanhanteId) {
    setSelecionado(acompanhanteId);
    setCarregandoMensagens(true);
    api.get(API_URL + '/mensagens', { params: { acompanhante_id: acompanhanteId, marcar_lido_por: 'admin' } })
      .then(r => setMensagens(r.data.mensagens))
      .catch(e => console.log(e))
      .finally(() => {
        setCarregandoMensagens(false);
        // Zera o contador de não lidas na lista, já que acabamos de marcar como lida
        setConversas(prev => prev.map(c => c.acompanhante_id === acompanhanteId ? { ...c, nao_lidas: 0 } : c));
      });
  }

  async function enviarMensagem(e) {
    e.preventDefault();
    if (!texto.trim() || !selecionado) return;

    setEnviando(true);
    try {
      const resp = await api.post(API_URL + '/mensagens', {
        acompanhante_id: selecionado,
        remetente: 'admin',
        texto: texto.trim(),
      });
      setMensagens(prev => [...prev, resp.data.mensagem]);
      setTexto('');
      carregarConversas(); // atualiza a prévia/última mensagem na lista
    } catch (e2) {
      alert('Não foi possível enviar a mensagem.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Chat de Suporte</h1>

      <div style={{ display: 'flex', height: '75vh', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>

        {/* Lista de conversas */}
        <div style={{ width: 300, borderRight: '1px solid #eee', overflowY: 'auto' }}>
          {carregandoConversas ? (
            <div style={{ padding: 16, color: '#888' }}>Carregando...</div>
          ) : conversas.length === 0 ? (
            <div style={{ padding: 16, color: '#888' }}>Nenhuma conversa ainda</div>
          ) : (
            conversas.map(c => (
              <div
                key={c.acompanhante_id}
                onClick={() => abrirConversa(c.acompanhante_id)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  background: selecionado === c.acompanhante_id ? '#eef4fa' : '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: 14 }}>{c.acompanhante_nome || 'Acompanhante #' + c.acompanhante_id}</strong>
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

        {/* Janela do chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selecionado ? (
            <div style={{ margin: 'auto', color: '#888' }}>Selecione uma conversa</div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {carregandoMensagens ? (
                  <div style={{ color: '#888' }}>Carregando mensagens...</div>
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
