import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// Types
interface Notification {
  id: string;
  userId: string;
  type: 'CASE_UPDATE' | 'DOCUMENT_READY' | 'QUOTE_READY' | 'APPOINTMENT' | 'MAINTENANCE_DUE' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

// Notification hooks
export function useNotifications(params?: {
  read?: boolean;
  type?: Notification['type'];
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.read !== undefined) queryParams.read = params.read.toString();
      if (params?.type) queryParams.type = params.type;
      if (params?.limit) queryParams.limit = params.limit.toString();
      if (params?.offset) queryParams.offset = params.offset.toString();
      
      const response = await apiClient.get<{ data: Notification[]; total: number }>(
        '/notifications',
        queryParams
      );
      return response;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<NotificationStats>('/notifications/stats');
      return response;
    },
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiClient.patch<Notification>(
        `/notifications/${notificationId}/read`
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.delete(`/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/notifications');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
