import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { useAuthStore } from '@/stores/auth.store';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth: string;
  nir?: string;
}

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  dateOfBirth?: string;
  nir?: string;
  address?: {
    street?: string;
    postalCode?: string;
    city?: string;
    deliveryNotes?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

interface UpdateProfileData {
  phone?: string;
  address?: {
    street?: string;
    postalCode?: string;
    city?: string;
    deliveryNotes?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

// Auth hooks
export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response;
    },
    onSuccess: (data) => {
      // Store token in sessionStorage for API client
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', data.accessToken);
      }
      // Convert API user to store user format
      const storeUser = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: '',
        role: data.user.role as 'PATIENT' | 'PRESCRIBER' | 'OPS_AGENT' | 'BILLING_AGENT' | 'TECHNICIAN' | 'ADMIN',
        emailVerified: true,
        phoneVerified: false,
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(storeUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiClient.post<{ message: string; userId: string }>('/auth/register', data);
      return response;
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      const response = await apiClient.post<AuthResponse>('/auth/verify-email', { email, code });
      return response;
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/users/me');
      return response;
    },
    enabled: isAuthenticated,
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      await apiClient.post('/auth/password-reset/request', { email });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      await apiClient.post('/auth/password-reset/confirm', { token, password });
    },
  });
}
