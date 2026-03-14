import { create } from 'zustand';
import { User } from '@/types';
import api from '@/lib/axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  fetchProfile: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  bio?: string;
  homeCity?: string;
  interests?: string[];
  travelStyle?: string;
}

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('ts_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem('ts_token'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('ts_token'),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('ts_token', data.token);
      localStorage.setItem('ts_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (registerData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', registerData);
      localStorage.setItem('ts_token', data.token);
      localStorage.setItem('ts_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('ts_token');
    localStorage.removeItem('ts_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    localStorage.setItem('ts_user', JSON.stringify(user));
    set({ user });
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get('/auth/profile');
      localStorage.setItem('ts_user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch {
      get().logout();
    }
  },
}));
