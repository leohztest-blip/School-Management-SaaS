import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, School } from '@/types';

interface AuthState {
  user: AuthUser | null;
  school: School | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setSchool: (school: School | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      school: null,
      isLoading: true,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSchool: (school) => set({ school }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, school: null, isAuthenticated: false }),
    }),
    {
      name: 'shiksha-auth',
      partialize: (state) => ({
        user: state.user,
        school: state.school,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
