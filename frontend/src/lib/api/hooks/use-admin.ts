import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// Types
interface DashboardStats {
  cases: {
    total: number;
    byStatus: Record<string, number>;
    averageProcessingDays: number;
  };
  claims: {
    total: number;
    totalAmount: number;
    pendingAmount: number;
    acceptedAmount: number;
  };
  tickets: {
    total: number;
    open: number;
    critical: number;
  };
  devices: {
    total: number;
    delivered: number;
  };
}

interface AdminUser {
  id: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface SystemMetrics {
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  cpu: number;
  activeConnections: number;
  queuedJobs: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Admin Dashboard
export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardStats>('/admin/dashboard/stats');
      return response;
    },
  });
}

// Admin Users
export function useAdminUsers(params?: { 
  page?: number; 
  limit?: number; 
  role?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.page) queryParams.page = params.page.toString();
      if (params?.limit) queryParams.limit = params.limit.toString();
      if (params?.role) queryParams.role = params.role;
      if (params?.status) queryParams.status = params.status;
      if (params?.search) queryParams.search = params.search;
      
      const response = await apiClient.get<PaginatedResponse<AdminUser>>('/admin/users', queryParams);
      return response;
    },
  });
}

// Admin Audit Logs
export function useAdminAuditLogs(params?: {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['admin', 'audit', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.page) queryParams.page = params.page.toString();
      if (params?.limit) queryParams.limit = params.limit.toString();
      if (params?.userId) queryParams.userId = params.userId;
      if (params?.action) queryParams.action = params.action;
      if (params?.entityType) queryParams.entityType = params.entityType;
      if (params?.entityId) queryParams.entityId = params.entityId;
      if (params?.startDate) queryParams.startDate = params.startDate;
      if (params?.endDate) queryParams.endDate = params.endDate;
      
      const response = await apiClient.get<PaginatedResponse<AuditLog>>('/admin/audit', queryParams);
      return response;
    },
  });
}

// System Metrics
export function useAdminSystemMetrics() {
  return useQuery({
    queryKey: ['admin', 'system', 'metrics'],
    queryFn: async () => {
      const response = await apiClient.get<SystemMetrics>('/admin/system/metrics');
      return response;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
