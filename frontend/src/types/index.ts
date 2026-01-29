// User & Authentication Types
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'PATIENT' | 'PRESCRIBER' | 'OPS_AGENT' | 'BILLING_AGENT' | 'TECHNICIAN' | 'ADMIN';

export interface Patient extends User {
  dateOfBirth: string;
  nirHash?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  deliveryNotes?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// Case Types
export interface Case {
  id: string;
  caseNumber: string;
  patientId: string;
  status: CaseStatus;
  priority: CasePriority;
  prescriptionId?: string;
  quoteId?: string;
  claimId?: string;
  assignedToId?: string;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  slaDeadline?: string;
}

export type CaseStatus =
  | 'INTAKE_RECEIVED'
  | 'DOCUMENTS_PENDING'
  | 'UNDER_REVIEW'
  | 'QUOTE_READY'
  | 'QUOTE_APPROVED'
  | 'SUBMITTED_TO_CPAM'
  | 'CPAM_APPROVED'
  | 'CPAM_REJECTED'
  | 'DELIVERY_SCHEDULED'
  | 'DELIVERED'
  | 'CLOSED'
  | 'CANCELLED';

export type CasePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface ChecklistItem {
  key: string;
  label: string;
  required: boolean;
  completedAt?: string;
  completedBy?: string;
}

// Document Types
export interface Document {
  id: string;
  type: DocumentType;
  filename: string;
  mimeType: string;
  size: number;
  uploadedById: string;
  caseId?: string;
  scanStatus: ScanStatus;
  storageKey: string;
  createdAt: string;
}

export type DocumentType =
  | 'PRESCRIPTION'
  | 'ID_CARD'
  | 'CARTE_VITALE'
  | 'PROOF_OF_ADDRESS'
  | 'QUOTE'
  | 'QUOTE_SIGNED'
  | 'DELIVERY_PROOF'
  | 'CLINICAL_NOTES'
  | 'OTHER';

export type ScanStatus = 'PENDING' | 'CLEAN' | 'INFECTED' | 'ERROR';

// Quote Types
export interface Quote {
  id: string;
  caseId: string;
  version: number;
  status: QuoteStatus;
  items: QuoteLineItem[];
  totalLPPR: number;
  totalPatient: number;
  validUntil: string;
  approvedAt?: string;
  signatureData?: string;
  createdAt: string;
}

export type QuoteStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'SUPERSEDED' | 'EXPIRED';

export interface QuoteLineItem {
  id: string;
  productId: string;
  lpprCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lpprAmount: number;
  patientAmount: number;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  familyId: string;
  lpprCodes: string[];
  basePrice: number;
  specifications: Record<string, string>;
  imageUrl?: string;
  isActive: boolean;
}

export interface ProductFamily {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
}

// Device & Maintenance Types
export interface Device {
  id: string;
  patientId: string;
  productId: string;
  serialNumber: string;
  deliveredAt: string;
  warrantyExpiresAt: string;
  maintenanceContractId?: string;
  status: DeviceStatus;
}

export type DeviceStatus = 'ACTIVE' | 'IN_REPAIR' | 'REPLACED' | 'DISPOSED';

export interface ServiceTicket {
  id: string;
  deviceId: string;
  patientId: string;
  category: TicketCategory;
  severity: TicketSeverity;
  description: string;
  isSafetyIssue: boolean;
  status: TicketStatus;
  assignedToId?: string;
  scheduledVisit?: ScheduledVisit;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export type TicketCategory =
  | 'BATTERY'
  | 'WHEELS'
  | 'JOYSTICK'
  | 'BRAKE'
  | 'CUSHION'
  | 'FRAME'
  | 'ELECTRICAL'
  | 'OTHER';

export type TicketSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'PARTS_ORDERED'
  | 'RESOLVED'
  | 'CLOSED';

export interface ScheduledVisit {
  date: string;
  timeSlot: string;
  technicianId: string;
  technicianName: string;
}

// Claim Types
export interface Claim {
  id: string;
  caseId: string;
  claimNumber: string;
  status: ClaimStatus;
  submittedAt?: string;
  responseAt?: string;
  amountClaimed: number;
  amountApproved?: number;
  rejectionReason?: string;
}

export type ClaimStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_RESPONSE'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'
  | 'PAID';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  cursor?: string;
  hasMore: boolean;
  total?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  requestId: string;
  timestamp: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  acceptTerms: boolean;
  acceptHealthDataConsent: boolean;
  acceptMarketing?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface MFAChallenge {
  challengeId: string;
  type: 'TOTP';
}
