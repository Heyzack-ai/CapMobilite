import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// Types
interface Device {
  id: string;
  serialNumber: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    category: string;
    brand: string;
    model: string;
    imageUrl?: string;
  };
  patientId: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
  deliveredAt?: string;
  warrantyExpiresAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceRecord {
  id: string;
  deviceId: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';
  description: string;
  performedBy: string;
  performedAt: string;
  nextDueAt?: string;
  notes?: string;
  createdAt: string;
}

interface ServiceTicket {
  id: string;
  deviceId: string;
  type: 'REPAIR' | 'MAINTENANCE' | 'REPLACEMENT' | 'INQUIRY';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_PARTS' | 'RESOLVED' | 'CLOSED';
  subject: string;
  description: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

// Device hooks
export function useDevices(params?: {
  patientId?: string;
  status?: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['devices', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.patientId) queryParams.patientId = params.patientId;
      if (params?.status) queryParams.status = params.status;
      if (params?.limit) queryParams.limit = params.limit.toString();
      if (params?.offset) queryParams.offset = params.offset.toString();
      
      const response = await apiClient.get<{ data: Device[]; total: number }>('/devices', queryParams);
      return response;
    },
  });
}

export function useDevice(deviceId: string) {
  return useQuery({
    queryKey: ['devices', deviceId],
    queryFn: async () => {
      const response = await apiClient.get<Device>(`/devices/${deviceId}`);
      return response;
    },
    enabled: !!deviceId,
  });
}

export function useMyDevices() {
  return useQuery({
    queryKey: ['devices', 'mine'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Device[] }>('/me/devices');
      return response;
    },
  });
}

export function useMyServiceTickets() {
  return useQuery({
    queryKey: ['service-tickets', 'mine'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ServiceTicket[] }>('/me/service-tickets');
      return response;
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deviceId, data }: { 
      deviceId: string; 
      data: Partial<{
        status: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
        metadata: Record<string, unknown>;
      }>;
    }) => {
      const response = await apiClient.patch<Device>(`/devices/${deviceId}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices', variables.deviceId] });
    },
  });
}

// Maintenance hooks
export function useDeviceMaintenanceHistory(deviceId: string) {
  return useQuery({
    queryKey: ['devices', deviceId, 'maintenance'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: MaintenanceRecord[] }>(
        `/devices/${deviceId}/maintenance`
      );
      return response;
    },
    enabled: !!deviceId,
  });
}

export function useAddMaintenanceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deviceId, data }: {
      deviceId: string;
      data: {
        type: 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';
        description: string;
        performedBy: string;
        performedAt: string;
        nextDueAt?: string;
        notes?: string;
      };
    }) => {
      const response = await apiClient.post<MaintenanceRecord>(
        `/devices/${deviceId}/maintenance`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices', variables.deviceId, 'maintenance'] });
    },
  });
}

// Service ticket hooks
export function useDeviceServiceTickets(deviceId: string) {
  return useQuery({
    queryKey: ['devices', deviceId, 'tickets'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ServiceTicket[] }>(
        `/devices/${deviceId}/service-tickets`
      );
      return response;
    },
    enabled: !!deviceId,
  });
}

export function useCreateServiceTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      deviceId: string;
      type: 'REPAIR' | 'MAINTENANCE' | 'REPLACEMENT' | 'INQUIRY';
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      subject: string;
      description: string;
    }) => {
      const response = await apiClient.post<ServiceTicket>('/service-tickets', data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices', variables.deviceId, 'tickets'] });
      queryClient.invalidateQueries({ queryKey: ['service-tickets'] });
    },
  });
}

export function useUpdateServiceTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, data }: {
      ticketId: string;
      data: Partial<{
        status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_PARTS' | 'RESOLVED' | 'CLOSED';
        resolution: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      }>;
    }) => {
      const response = await apiClient.patch<ServiceTicket>(
        `/service-tickets/${ticketId}`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['service-tickets'] });
    },
  });
}

// Products catalog
export function useProducts(params?: {
  category?: string;
  search?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.category) queryParams.category = params.category;
      if (params?.search) queryParams.search = params.search;
      if (params?.limit) queryParams.limit = params.limit.toString();
      
      const response = await apiClient.get<{ data: Device['product'][] }>('/products', queryParams);
      return response;
    },
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['products', productId],
    queryFn: async () => {
      const response = await apiClient.get<Device['product']>(`/products/${productId}`);
      return response;
    },
    enabled: !!productId,
  });
}
