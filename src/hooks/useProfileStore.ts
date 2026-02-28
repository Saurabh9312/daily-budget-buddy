import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

interface UserProfile {
    username: string;
    email: string;
    name: string;
    dob: string | null;
    profile_picture: string | null;
}

interface ProfileState {
    profile: UserProfile | null;
    loading: boolean;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: FormData) => Promise<void>;
}

const API_BASE = 'http://127.0.0.1:8000/api';

export const useProfileStore = create<ProfileState>((set) => ({
    profile: null,
    loading: false,

    fetchProfile: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        set({ loading: true });
        try {
            const res = await fetch(`${API_BASE}/profile/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                set({ profile: data });
            }
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            set({ loading: false });
        }
    },

    updateProfile: async (data: FormData) => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        set({ loading: true });
        try {
            const res = await fetch(`${API_BASE}/profile/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data,
            });

            if (!res.ok) throw new Error('Failed to update profile');
            const updated = await res.json();
            set({ profile: updated });
        } finally {
            set({ loading: false });
        }
    }
}));
