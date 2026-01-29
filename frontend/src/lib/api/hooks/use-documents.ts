import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// Types
interface Document {
  id: string;
  filename: string;
  documentType: string;
  mimeType: string;
  size: number;
  scanStatus: 'PENDING' | 'CLEAN' | 'INFECTED';
  ownerId: string;
  ownerType: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

interface UploadUrlResponse {
  uploadUrl: string;
  documentId: string;
  fields: Record<string, string>;
}

// Document hooks
export function useDocuments(params?: { 
  ownerId?: string; 
  documentType?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.ownerId) queryParams.ownerId = params.ownerId;
      if (params?.documentType) queryParams.documentType = params.documentType;
      if (params?.limit) queryParams.limit = params.limit.toString();
      
      const response = await apiClient.get<{ data: Document[] }>('/documents', queryParams);
      return response;
    },
  });
}

export function useDocument(documentId: string) {
  return useQuery({
    queryKey: ['documents', documentId],
    queryFn: async () => {
      const response = await apiClient.get<Document>(`/documents/${documentId}`);
      return response;
    },
    enabled: !!documentId,
  });
}

export function useMyDocuments() {
  return useQuery({
    queryKey: ['documents', 'mine'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Document[] }>('/me/documents');
      return response;
    },
  });
}

export function useGetUploadUrl() {
  return useMutation({
    mutationFn: async (data: {
      filename: string;
      mimeType: string;
      documentType: string;
      ownerId?: string;
    }) => {
      const response = await apiClient.post<UploadUrlResponse>('/documents/upload-url', data);
      return response;
    },
  });
}

export function useConfirmUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await apiClient.post<Document>(`/documents/${documentId}/confirm`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      await apiClient.delete(`/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// Get download URL
export function useDocumentDownloadUrl(documentId: string) {
  return useQuery({
    queryKey: ['documents', documentId, 'download'],
    queryFn: async () => {
      const response = await apiClient.get<{ url: string }>(`/documents/${documentId}/download-url`);
      return response;
    },
    enabled: !!documentId,
    staleTime: 1000 * 60 * 5, // URLs valid for 5 minutes
  });
}
