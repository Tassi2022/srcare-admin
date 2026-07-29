// src/Login.jsx
import { useState } from 'react';
import { salvarToken } from './auth';

const API_BASE = 'https://qxoe8xxub9.execute-api.us-east-1.amazonaws.com/prod';

export default function Login({ onLoginSucesso }) {
    const [username, setUsername] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState(null);
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setErro(null);
        setCarregando(true);
        try {
            const resp = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, senha }),
            });

            if (!resp.ok) {
                setErro('Usuário ou senha inválidos.');
                return;
            }

            const dados = await resp.json();
            salvarToken(dados.token);
            onLoginSucesso();
        } catch (e2) {
            setErro('Não foi possível conectar. Tente novamente.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0b1220' }}>
            <form
                onSubmit={handleSubmit}
                style={{ background: '#fff', padding: 40, borderRadius: 12, width: 320, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
            >
                <h2 style={{ marginTop: 0, marginBottom: 24 }}>
                    Sr. <span style={{ color: '#3f7ca8' }}>Care</span> Admin
                </h2>

                <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Usuário</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 6, border: '1px solid #ddd' }}
                    autoFocus
                />

                <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Senha</label>
                <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 6, border: '1px solid #ddd' }}
                />

                {erro && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 16 }}>{erro}</div>}

                <button
                    type="submit"
                    disabled={carregando}
                    style={{ width: '100%', padding: 12, borderRadius: 6, border: 'none', background: '#3f7ca8', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                    {carregando ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
}
