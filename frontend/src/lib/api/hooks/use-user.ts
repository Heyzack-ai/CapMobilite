import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// Types
interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  caseUpdates: boolean;
  quoteNotifications: boolean;
  deliveryAlerts: boolean;
  maintenanceReminders: boolean;
  marketingEmails: boolean;
}

interface UserDevice {
  id: string;
  createdAt: string;
  expiresAt: string;
}

interface ServiceTicket {
  id: string;
  ticketNumber: string;
  category: string;
  status: string;
  severity: string;
  description: string;
  createdAt: string;
  resolvedAt?: string;
  device?: {
    id: string;
    serialNumber: string;
  };
}

// Notification Preferences
export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['user', 'notifications'],
    queryFn: async () => {
      const response = await apiClient.get<NotificationPreferences>('/me/notifications/preferences');
      return response;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      const response = await apiClient.put<NotificationPreferences>('/me/notifications/preferences', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notifications'] });
    },
  });
}

// User Devices (active sessions)
export function useUserDevices() {
  return useQuery({
    queryKey: ['user', 'devices'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: UserDevice[]; total: number }>('/me/devices');
      return response;
    },
  });
}

export function useRevokeDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await apiClient.delete(`/me/devices/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'devices'] });
    },
  });
}

// User Tickets
export function useUserTickets() {
  return useQuery({
    queryKey: ['user', 'tickets'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ServiceTicket[]; total: number }>('/me/tickets');
      return response;
    },
  });
}

// Profile Update
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: {
        street?: string;
        city?: string;
        postalCode?: string;
        country?: string;
      };
      emergencyContact?: {
        name?: string;
        phone?: string;
        relationship?: string;
      };
    }) => {
      const response = await apiClient.patch('/me/profile', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// NIR Update
export function useUpdateNir() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nir, currentPassword }: { nir: string; currentPassword: string }) => {
      const response = await apiClient.patch('/me/nir', { nir, currentPassword });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
