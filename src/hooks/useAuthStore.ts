import { create } from 'zustand';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    login: (username: string, password: string, remember: boolean) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    initialize: () => void;
}

const API_BASE = 'http://127.0.0.1:8000/api';

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    isAuthenticated: false,

    initialize: () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            set({ token, isAuthenticated: true });
        }
    },

    login: async (username, password, remember) => {
        const res = await fetch(`${API_BASE}/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.detail || 'Invalid credentials');
        }

        const data = await res.json();
        const token = data.access;

        if (remember) {
            localStorage.setItem('token', token);
            localStorage.setItem('refresh', data.refresh);
        } else {
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('refresh', data.refresh);
        }

        set({ token, isAuthenticated: true });
    },

    register: async (username, email, password) => {
        const res = await fetch(`${API_BASE}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            const msg = data.username ? data.username[0] : (data.detail || 'Registration failed');
            throw new Error(msg);
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refresh');
        set({ token: null, isAuthenticated: false });
    },
}));
