import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// Types
interface Case {
  id: string;
  caseNumber: string;
  status: string;
  priority: string;
  patientId: string;
  assignedToId?: string;
  currentStepDescription?: string;
  checklistState?: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

interface CaseDocument {
  id: string;
  documentId: string;
  caseId: string;
  addedBy: string;
  notes?: string;
  createdAt: string;
  document?: {
    id: string;
    filename: string;
    documentType: string;
    mimeType: string;
    size: number;
  };
}

interface CaseNote {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor?: string;
    hasMore: boolean;
    limit: number;
  };
}

// Cases hooks
export function useCases(params?: { status?: string; limit?: number; cursor?: string }) {
  return useQuery({
    queryKey: ['cases', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.limit) queryParams.limit = params.limit.toString();
      if (params?.cursor) queryParams.cursor = params.cursor;
      
      const response = await apiClient.get<PaginatedResponse<Case>>('/cases', queryParams);
      return response;
    },
  });
}

export function useCase(caseId: string) {
  return useQuery({
    queryKey: ['cases', caseId],
    queryFn: async () => {
      const response = await apiClient.get<Case>(`/cases/${caseId}`);
      return response;
    },
    enabled: !!caseId,
  });
}

export function useMyCases() {
  return useQuery({
    queryKey: ['cases', 'mine'],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Case>>('/me/cases');
      return response;
    },
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { prescriptionId: string }) => {
      const response = await apiClient.post<Case>('/cases', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

export function useUpdateCaseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, status, notes }: { caseId: string; status: string; notes?: string }) => {
      const response = await apiClient.patch<Case>(`/cases/${caseId}/status`, { status, notes });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

// Case Documents
export function useCaseDocuments(caseId: string) {
  return useQuery({
    queryKey: ['cases', caseId, 'documents'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: CaseDocument[] }>(`/cases/${caseId}/documents`);
      return response;
    },
    enabled: !!caseId,
  });
}

export function useAttachCaseDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, documentId, notes }: { caseId: string; documentId: string; notes?: string }) => {
      const response = await apiClient.post<CaseDocument>(`/cases/${caseId}/documents`, { documentId, notes });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases', variables.caseId, 'documents'] });
    },
  });
}

export function useRemoveCaseDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, documentId }: { caseId: string; documentId: string }) => {
      await apiClient.delete(`/cases/${caseId}/documents/${documentId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases', variables.caseId, 'documents'] });
    },
  });
}

// Case Notes
export function useCaseNotes(caseId: string) {
  return useQuery({
    queryKey: ['cases', caseId, 'notes'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: CaseNote[] }>(`/cases/${caseId}/notes`);
      return response;
    },
    enabled: !!caseId,
  });
}

export function useAddCaseNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, content }: { caseId: string; content: string }) => {
      const response = await apiClient.post<CaseNote>(`/cases/${caseId}/notes`, { content });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cases', variables.caseId, 'notes'] });
    },
  });
}
