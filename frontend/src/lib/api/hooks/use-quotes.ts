import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

// Types
interface Quote {
  id: string;
  caseId: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  totalAmount: number;
  cpamCoverage: number;
  mutualCoverage: number;
  patientRemainder: number;
  validUntil: string;
  items: QuoteItem[];
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface QuoteItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    lppCode?: string;
    brand: string;
    model: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  cpamRate: number;
  description?: string;
}

interface Claim {
  id: string;
  caseId: string;
  quoteId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'PAID';
  claimType: 'CPAM' | 'MUTUAL' | 'BOTH';
  cpamAmount: number;
  mutualAmount: number;
  submittedAt?: string;
  processedAt?: string;
  paidAt?: string;
  rejectionReason?: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

// Quote hooks
export function useQuotes(params?: {
  caseId?: string;
  status?: Quote['status'];
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['quotes', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.caseId) queryParams.caseId = params.caseId;
      if (params?.status) queryParams.status = params.status;
      if (params?.limit) queryParams.limit = params.limit.toString();
      if (params?.offset) queryParams.offset = params.offset.toString();
      
      const response = await apiClient.get<{ data: Quote[]; total: number }>('/quotes', queryParams);
      return response;
    },
  });
}

export function useQuote(quoteId: string) {
  return useQuery({
    queryKey: ['quotes', quoteId],
    queryFn: async () => {
      const response = await apiClient.get<Quote>(`/quotes/${quoteId}`);
      return response;
    },
    enabled: !!quoteId,
  });
}

export function useCaseQuote(caseId: string) {
  return useQuery({
    queryKey: ['cases', caseId, 'quote'],
    queryFn: async () => {
      const response = await apiClient.get<Quote>(`/cases/${caseId}/quote`);
      return response;
    },
    enabled: !!caseId,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      caseId: string;
      items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        cpamRate: number;
        description?: string;
      }[];
      validUntil: string;
    }) => {
      const response = await apiClient.post<Quote>('/quotes', data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['cases', variables.caseId, 'quote'] });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteId, data }: {
      quoteId: string;
      data: Partial<{
        items: QuoteItem[];
        validUntil: string;
      }>;
    }) => {
      const response = await apiClient.patch<Quote>(`/quotes/${quoteId}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quotes', variables.quoteId] });
    },
  });
}

export function useApproveQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      const response = await apiClient.post<Quote>(`/quotes/${quoteId}/approve`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useRejectQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteId, reason }: { quoteId: string; reason: string }) => {
      const response = await apiClient.post<Quote>(`/quotes/${quoteId}/reject`, { reason });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

// Claim hooks
export function useClaims(params?: {
  caseId?: string;
  status?: Claim['status'];
  claimType?: Claim['claimType'];
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['claims', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.caseId) queryParams.caseId = params.caseId;
      if (params?.status) queryParams.status = params.status;
      if (params?.claimType) queryParams.claimType = params.claimType;
      if (params?.limit) queryParams.limit = params.limit.toString();
      if (params?.offset) queryParams.offset = params.offset.toString();
      
      const response = await apiClient.get<{ data: Claim[]; total: number }>('/claims', queryParams);
      return response;
    },
  });
}

export function useClaim(claimId: string) {
  return useQuery({
    queryKey: ['claims', claimId],
    queryFn: async () => {
      const response = await apiClient.get<Claim>(`/claims/${claimId}`);
      return response;
    },
    enabled: !!claimId,
  });
}

export function useCreateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      caseId: string;
      quoteId: string;
      claimType: 'CPAM' | 'MUTUAL' | 'BOTH';
      documents?: string[];
    }) => {
      const response = await apiClient.post<Claim>('/claims', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

export function useSubmitClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: string) => {
      const response = await apiClient.post<Claim>(`/claims/${claimId}/submit`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

export function useUpdateClaimStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ claimId, data }: {
      claimId: string;
      data: {
        status: Claim['status'];
        rejectionReason?: string;
      };
    }) => {
      const response = await apiClient.patch<Claim>(`/claims/${claimId}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

// Patient quotes hook
export function useMyQuotes() {
  return useQuery({
    queryKey: ['quotes', 'mine'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Quote[] }>('/me/quotes');
      return response;
    },
  });
}
