import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';

// Types
interface PrescriberLinkValidation {
  valid: boolean;
  reason?: string;
  patientFirstName?: string;
  patientLastInitial?: string;
  expiresAt?: string;
  alreadyUsed?: boolean;
}

interface PrescriberLinkCreate {
  linkUrl: string;
  linkId: string;
  expiresAt: string;
  patientReference: string;
}

interface PrescriberLink {
  id: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
  prescriptionId?: string;
}

interface SubmitPrescriptionResult {
  message: string;
  prescriptionId: string;
  referenceNumber: string;
}

// Prescriber Portal hooks (public endpoints)
export function useValidatePrescriberLink(token: string) {
  return useQuery({
    queryKey: ['prescriber', 'validate', token],
    queryFn: async () => {
      const response = await apiClient.get<PrescriberLinkValidation>(`/prescriber/links/${token}/validate`);
      return response;
    },
    enabled: !!token,
    retry: false,
  });
}

export function useSubmitPrescription() {
  return useMutation({
    mutationFn: async ({ 
      token, 
      prescriptionDocumentId,
      productCategory,
      notes 
    }: { 
      token: string;
      prescriptionDocumentId: string;
      productCategory: string;
      notes?: string;
    }) => {
      const response = await apiClient.post<SubmitPrescriptionResult>(
        `/prescriber/links/${token}/submit`,
        { prescriptionDocumentId, productCategory, notes }
      );
      return response;
    },
  });
}

// For staff/patients - generate links
export function useGeneratePrescriberLink() {
  return useMutation({
    mutationFn: async (data: { 
      patientId: string;
      prescriberEmail?: string;
      expiresInHours?: number;
    }) => {
      const response = await apiClient.post<PrescriberLinkCreate>('/prescriber/links', data);
      return response;
    },
  });
}

// For staff/patients - list links for a patient
export function usePatientPrescriberLinks(patientId: string) {
  return useQuery({
    queryKey: ['prescriber', 'links', patientId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: PrescriberLink[]; total: number }>(
        `/prescriber/links/patient/${patientId}`
      );
      return response;
    },
    enabled: !!patientId,
  });
}

// Revoke a prescriber link
export function useRevokePrescriberLink() {
  return useMutation({
    mutationFn: async (linkId: string) => {
      await apiClient.delete(`/prescriber/links/${linkId}`);
    },
  });
}
