import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// Types
interface ProxyRelationship {
  id: string;
  patientId: string;
  proxyUserId: string;
  relationship: 'FAMILY' | 'SOCIAL_WORKER' | 'NURSING_HOME' | 'OTHER';
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  validUntil?: string;
  createdAt: string;
  patient?: {
    firstName: string;
    lastName: string;
  };
  proxy?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface ProxyInvitation {
  id: string;
  email: string;
  relationship: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface ManagedPatient {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
}

// Proxy hooks - For patients managing their proxies
export function useMyProxies() {
  return useQuery({
    queryKey: ['proxy', 'mine'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ProxyRelationship[] }>('/me/proxy');
      return response;
    },
  });
}

export function useInviteProxy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      email: string; 
      relationship: string;
      validUntil?: string;
      consentDocumentId?: string;
    }) => {
      const response = await apiClient.post<ProxyInvitation>('/me/proxy/invite', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxy'] });
    },
  });
}

export function useRevokeProxy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proxyId: string) => {
      await apiClient.delete(`/me/proxy/${proxyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proxy'] });
    },
  });
}

// Proxy hooks - For proxies/caregivers managing patients
export function useManagedPatients() {
  return useQuery({
    queryKey: ['proxy', 'patients'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ManagedPatient[] }>('/me/proxy/patients');
      return response;
    },
  });
}

export function useSwitchPatientContext() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: string) => {
      const response = await apiClient.post<{ message: string; patientId: string }>('/me/proxy/switch', { patientId });
      return response;
    },
    onSuccess: () => {
      // Invalidate all patient-related queries when switching context
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// Accept invitation (used with token)
export function useAcceptProxyInvitation() {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await apiClient.post<ProxyRelationship>('/proxy/accept', { token });
      return response;
    },
  });
}
