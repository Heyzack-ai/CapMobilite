import type { Case, CaseStatus } from "@/types";

export const mockCases: Case[] = [
  {
    id: "case-1",
    caseNumber: "CAP-2024-0001",
    patientId: "user-1",
    status: "QUOTE_READY",
    priority: "NORMAL",
    prescriptionId: "doc-1",
    quoteId: "quote-1",
    assignedToId: "user-3",
    checklist: [
      { key: "prescription", label: "Ordonnance médicale", required: true, completedAt: "2024-01-16T10:00:00Z", completedBy: "user-1" },
      { key: "id_card", label: "Carte d'identité", required: true, completedAt: "2024-01-16T10:05:00Z", completedBy: "user-1" },
      { key: "carte_vitale", label: "Carte Vitale", required: true, completedAt: "2024-01-16T10:10:00Z", completedBy: "user-1" },
      { key: "quote_approved", label: "Devis approuvé", required: true },
    ],
    createdAt: "2024-01-16T09:00:00Z",
    updatedAt: "2024-01-20T14:00:00Z",
    slaDeadline: "2024-01-23T09:00:00Z",
  },
  {
    id: "case-2",
    caseNumber: "CAP-2024-0002",
    patientId: "user-1",
    status: "DELIVERED",
    priority: "NORMAL",
    prescriptionId: "doc-2",
    quoteId: "quote-2",
    claimId: "claim-1",
    assignedToId: "user-3",
    checklist: [
      { key: "prescription", label: "Ordonnance médicale", required: true, completedAt: "2023-11-01T10:00:00Z", completedBy: "user-1" },
      { key: "id_card", label: "Carte d'identité", required: true, completedAt: "2023-11-01T10:05:00Z", completedBy: "user-1" },
      { key: "carte_vitale", label: "Carte Vitale", required: true, completedAt: "2023-11-01T10:10:00Z", completedBy: "user-1" },
      { key: "quote_approved", label: "Devis approuvé", required: true, completedAt: "2023-11-05T14:00:00Z", completedBy: "user-1" },
    ],
    createdAt: "2023-11-01T09:00:00Z",
    updatedAt: "2023-12-15T16:00:00Z",
  },
  {
    id: "case-3",
    caseNumber: "CAP-2024-0003",
    patientId: "patient-2",
    status: "DOCUMENTS_PENDING",
    priority: "HIGH",
    assignedToId: "user-3",
    checklist: [
      { key: "prescription", label: "Ordonnance médicale", required: true, completedAt: "2024-02-02T10:00:00Z", completedBy: "patient-2" },
      { key: "id_card", label: "Carte d'identité", required: true },
      { key: "carte_vitale", label: "Carte Vitale", required: true },
      { key: "quote_approved", label: "Devis approuvé", required: true },
    ],
    createdAt: "2024-02-02T09:00:00Z",
    updatedAt: "2024-02-02T10:00:00Z",
    slaDeadline: "2024-02-05T09:00:00Z",
  },
  {
    id: "case-4",
    caseNumber: "CAP-2024-0004",
    patientId: "patient-2",
    status: "INTAKE_RECEIVED",
    priority: "URGENT",
    checklist: [
      { key: "prescription", label: "Ordonnance médicale", required: true },
      { key: "id_card", label: "Carte d'identité", required: true },
      { key: "carte_vitale", label: "Carte Vitale", required: true },
      { key: "quote_approved", label: "Devis approuvé", required: true },
    ],
    createdAt: "2024-02-10T08:00:00Z",
    updatedAt: "2024-02-10T08:00:00Z",
    slaDeadline: "2024-02-11T08:00:00Z",
  },
];

export const caseStatusLabels: Record<CaseStatus, string> = {
  INTAKE_RECEIVED: "Reçu",
  DOCUMENTS_PENDING: "Documents en attente",
  UNDER_REVIEW: "En cours d'examen",
  QUOTE_READY: "Devis prêt",
  QUOTE_APPROVED: "Devis approuvé",
  SUBMITTED_TO_CPAM: "Soumis à la CPAM",
  CPAM_APPROVED: "Approuvé par la CPAM",
  CPAM_REJECTED: "Rejeté par la CPAM",
  DELIVERY_SCHEDULED: "Livraison planifiée",
  DELIVERED: "Livré",
  CLOSED: "Clôturé",
  CANCELLED: "Annulé",
};

export const caseStatusColors: Record<CaseStatus, string> = {
  INTAKE_RECEIVED: "info",
  DOCUMENTS_PENDING: "warning",
  UNDER_REVIEW: "info",
  QUOTE_READY: "success",
  QUOTE_APPROVED: "success",
  SUBMITTED_TO_CPAM: "info",
  CPAM_APPROVED: "success",
  CPAM_REJECTED: "error",
  DELIVERY_SCHEDULED: "info",
  DELIVERED: "success",
  CLOSED: "secondary",
  CANCELLED: "error",
};

export function getCasesByPatientId(patientId: string): Case[] {
  return mockCases.filter((c) => c.patientId === patientId);
}

export function getCaseById(id: string): Case | undefined {
  return mockCases.find((c) => c.id === id);
}

export function getAllCases(): Case[] {
  return mockCases;
}
