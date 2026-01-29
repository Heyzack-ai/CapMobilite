import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// Types
interface Consent {
  id: string;
  userId: string;
  consentType: 'HEALTH_DATA' | 'MARKETING' | 'TERMS_OF_SERVICE';
  version: string;
  grantedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// Consent hooks
export function useConsents() {
  return useQuery({
    queryKey: ['consents'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Consent[] }>('/me/consents');
      return response;
    },
  });
}

export function useConsent(consentType: string) {
  return useQuery({
    queryKey: ['consents', consentType],
    queryFn: async () => {
      const response = await apiClient.get<Consent>(`/me/consents/${consentType}`);
      return response;
    },
    enabled: !!consentType,
  });
}

export function useGrantConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { consentType: string; version?: string }) => {
      const response = await apiClient.post<Consent>('/me/consents', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
  });
}

export function useRevokeConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (consentType: string) => {
      await apiClient.delete(`/me/consents/${consentType}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
  });
}
