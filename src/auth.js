import axios from 'axios';

const TOKEN_KEY = 'srcare_admin_token';

export function salvarToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function obterToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function limparToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function estaAutenticado() {
    return !!obterToken();
}

const api = axios.create();

api.interceptors.request.use((config) => {
    const token = obterToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            limparToken();
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;
