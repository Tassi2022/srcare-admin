import { useEffect, useState } from 'react';
import api from '../auth';
import API_URL from '../config';

const NOMES_BLOCO = { '3h': '3 horas', '5h': '5 horas', '7h': '7 horas', 'dia_todo': 'Dia todo', 'km': 'Por km' };
const NOMES_TIPO = { consulta_exames: 'Consulta Médica / Exames', passeio: 'Passeio', mercado: 'Mercado', transporte: 'Transporte (carro)' };

export default function Pricing() {
    const [precos, setPrecos] = useState([]);
    const [editando, setEditando] = useState({});
    const [salvando, setSalvando] = useState({});
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        carregarPrecos();
    }, []);

    async function carregarPrecos() {
        setCarregando(true);
        setErro(null);
        try {
            const resp = await api.get(API_URL + '/admin/precos');
            setPrecos(resp.data.precos);
        } catch (e) {
            setErro('Não foi possível carregar a tabela de preços.');
        } finally {
            setCarregando(false);
        }
    }

    function iniciarEdicao(item) {
        setEditando((prev) => ({ ...prev, [item.id]: item.valor }));
    }

    function cancelarEdicao(id) {
        setEditando((prev) => {
            const copia = { ...prev };
            delete copia[id];
            return copia;
        });
    }

    async function salvar(id) {
        const novoValor = editando[id];
        if (novoValor === undefined || novoValor === '') return;

        setSalvando((prev) => ({ ...prev, [id]: true }));
        try {
            const resp = await api.put(API_URL + '/admin/precos/' + id, { valor: parseFloat(novoValor) });
            const atualizado = resp.data.preco;
            setPrecos((prev) => prev.map((p) => (p.id === id ? atualizado : p)));
            cancelarEdicao(id);
        } catch (e) {
            alert('Não foi possível salvar esse preço. Tente novamente.');
        } finally {
            setSalvando((prev) => ({ ...prev, [id]: false }));
        }
    }

    if (carregando) return <div style={{ padding: 24 }}>Carregando tabela de preços...</div>;
    if (erro) return <div style={{ padding: 24, color: '#c0392b' }}>{erro}</div>;

    const grupos = precos.reduce((acc, item) => {
        (acc[item.tipo_servico] = acc[item.tipo_servico] || []).push(item);
        return acc;
    }, {});

    return (
        <div style={{ padding: 24 }}>
            <h1>Financeiro — Tabela de Preços</h1>

            {Object.entries(grupos).map(([tipo, itens]) => (
                <div key={tipo} style={{ marginBottom: 32 }}>
                    <h3 style={{ marginBottom: 12 }}>{NOMES_TIPO[tipo] || tipo}</h3>
                    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
                                    <th style={{ padding: '10px 16px' }}>Bloco</th>
                                    <th style={{ padding: '10px 16px' }}>Valor</th>
                                    <th style={{ padding: '10px 16px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {itens.map((item) => {
                                    const emEdicao = editando[item.id] !== undefined;
                                    return (
                                        <tr key={item.id} style={{ borderTop: '1px solid #eee' }}>
                                            <td style={{ padding: '10px 16px' }}>{NOMES_BLOCO[item.bloco_horas] || item.bloco_horas}</td>
                                            <td style={{ padding: '10px 16px' }}>
                                                {emEdicao ? (
                                                    <span>
                                                        R${' '}
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={editando[item.id]}
                                                            onChange={(e) => setEditando((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                                            style={{ width: 90, padding: 4 }}
                                                        />
                                                    </span>
                                                ) : (
                                                    <span>R$ {Number(item.valor).toFixed(2)}</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '10px 16px' }}>
                                                {emEdicao ? (
                                                    <>
                                                        <button onClick={() => salvar(item.id)} disabled={salvando[item.id]} style={{ marginRight: 8 }}>
                                                            {salvando[item.id] ? 'Salvando...' : 'Salvar'}
                                                        </button>
                                                        <button onClick={() => cancelarEdicao(item.id)}>Cancelar</button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => iniciarEdicao(item)}>Editar</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}
