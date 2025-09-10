import { create } from 'zustand';
import { User, LoginData, RegisterData } from '../types';
import { authAPI } from '../utils/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (data: LoginData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(data);
          const user = await authAPI.getMe();
          set({ 
            user, 
            token: response.access_token, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(data);
          const user = await authAPI.getMe();
          set({ 
            user, 
            token: response.access_token, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('blogsphere_current_user');
        set({ user: null, token: null });
      },

      initAuth: async () => {
        const currentUser = localStorage.getItem('blogsphere_current_user');
        if (currentUser) {
          try {
            const user = await authAPI.getMe();
            set({ user, token: 'mock-token' });
          } catch {
            localStorage.removeItem('blogsphere_current_user');
            set({ user: null, token: null });
          }
        }
      },
    })
);