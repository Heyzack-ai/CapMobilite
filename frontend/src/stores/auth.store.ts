import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Patient, LoginCredentials, RegisterData } from '@/types';
import { validateCredentials, findPatientById } from '@/lib/mocks/data/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  actingAs: Patient | null; // For proxy/caregiver mode
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setActingAs: (patient: Patient | null) => void;
  logout: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      actingAs: null,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setActingAs: (patient) => set({ actingAs: patient }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          actingAs: null,
        }),

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Use mock data directly for login
          const user = validateCredentials(credentials.email, credentials.password);

          if (!user) {
            throw new Error('Email ou mot de passe incorrect');
          }

          // If patient, get full patient data
          const patient = findPatientById(user.id);
          set({ user: patient || user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Create new user from registration data
          const newUser: User = {
            id: `user-${Date.now()}`,
            email: data.email,
            phone: data.phone,
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'PATIENT',
            emailVerified: false,
            phoneVerified: false,
            mfaEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set({ user: newUser, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      refreshUser: async () => {
        const { user } = get();
        if (user) {
          // In mock mode, just keep the current user
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
