import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// Types
interface ChatSession {
  id: string;
  userId: string;
  patientId?: string;
  status: 'ACTIVE' | 'ESCALATED' | 'CLOSED';
  escalatedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
  };
  messageCount?: number;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  senderId?: string;
  senderType: 'USER' | 'BOT' | 'STAFF' | 'SYSTEM';
  content: string;
  metadata?: Record<string, unknown>;
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

// Chat Session hooks
export function useChatSessions(params?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: ['chat', 'sessions', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.limit) queryParams.limit = params.limit.toString();
      
      const response = await apiClient.get<PaginatedResponse<ChatSession>>('/chat/sessions', queryParams);
      return response;
    },
  });
}

export function useChatSession(sessionId: string) {
  return useQuery({
    queryKey: ['chat', 'sessions', sessionId],
    queryFn: async () => {
      const response = await apiClient.get<ChatSession>(`/chat/sessions/${sessionId}`);
      return response;
    },
    enabled: !!sessionId,
  });
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { caseId?: string; initialMessage?: string }) => {
      const response = await apiClient.post<ChatSession>('/chat/sessions', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] });
    },
  });
}

// Chat Messages
export function useChatMessages(sessionId: string, params?: { limit?: number; cursor?: string }) {
  return useQuery({
    queryKey: ['chat', 'sessions', sessionId, 'messages', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.limit) queryParams.limit = params.limit.toString();
      if (params?.cursor) queryParams.cursor = params.cursor;
      
      const response = await apiClient.get<PaginatedResponse<ChatMessage>>(
        `/chat/sessions/${sessionId}/messages`,
        queryParams
      );
      return response;
    },
    enabled: !!sessionId,
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, content, attachmentIds }: { 
      sessionId: string; 
      content: string;
      attachmentIds?: string[];
    }) => {
      const response = await apiClient.post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, {
        content,
        attachmentIds,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions', variables.sessionId, 'messages'] });
    },
  });
}

export function useEscalateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, reason }: { sessionId: string; reason: string }) => {
      const response = await apiClient.post<ChatSession>(`/chat/sessions/${sessionId}/escalate`, { reason });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] });
    },
  });
}

export function useResolveChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, resolutionNotes }: { sessionId: string; resolutionNotes?: string }) => {
      const response = await apiClient.post<ChatSession>(`/chat/sessions/${sessionId}/resolve`, { resolutionNotes });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] });
    },
  });
}

export function useCloseChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiClient.post<ChatSession>(`/chat/sessions/${sessionId}/close`);
      return response;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] });
    },
  });
}
