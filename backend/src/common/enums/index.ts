// User enums
export enum UserRole {
  PATIENT = 'PATIENT',
  PRESCRIBER = 'PRESCRIBER',
  OPS = 'OPS',
  BILLING = 'BILLING',
  TECHNICIAN = 'TECHNICIAN',
  COMPLIANCE_ADMIN = 'COMPLIANCE_ADMIN',
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum ContactPreference {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PHONE = 'PHONE',
}

export enum Department {
  OPS = 'OPS',
  BILLING = 'BILLING',
  TECH = 'TECH',
  COMPLIANCE = 'COMPLIANCE',
}

// Proxy/Consent enums
export enum ProxyRelationshipType {
  FAMILY = 'FAMILY',
  SOCIAL_WORKER = 'SOCIAL_WORKER',
  NURSING_HOME = 'NURSING_HOME',
  OTHER = 'OTHER',
}

export enum ProxyStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export enum ConsentType {
  HEALTH_DATA = 'HEALTH_DATA',
  MARKETING = 'MARKETING',
  TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
}

// Document enums
export enum DocumentType {
  PRESCRIPTION = 'PRESCRIPTION',
  ID_CARD = 'ID_CARD',
  CARTE_VITALE = 'CARTE_VITALE',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
  QUOTE_PDF = 'QUOTE_PDF',
  DELIVERY_PROOF = 'DELIVERY_PROOF',
  OTHER = 'OTHER',
}

export enum ScanStatus {
  PENDING = 'PENDING',
  CLEAN = 'CLEAN',
  INFECTED = 'INFECTED',
}

export enum OwnerType {
  PATIENT = 'PATIENT',
  PRESCRIBER = 'PRESCRIBER',
  STAFF = 'STAFF',
}

// Prescription enums
export enum ProductCategory {
  MANUAL_WHEELCHAIR = 'MANUAL_WHEELCHAIR',
  ELECTRIC_WHEELCHAIR = 'ELECTRIC_WHEELCHAIR',
  ACCESSORIES = 'ACCESSORIES',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum PrescriptionStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

// Case enums
export enum CaseStatus {
  INTAKE_RECEIVED = 'INTAKE_RECEIVED',
  DOCUMENTS_PENDING = 'DOCUMENTS_PENDING',
  DOCUMENTS_COMPLETE = 'DOCUMENTS_COMPLETE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  QUOTE_PENDING = 'QUOTE_PENDING',
  QUOTE_READY = 'QUOTE_READY',
  PATIENT_APPROVAL_PENDING = 'PATIENT_APPROVAL_PENDING',
  READY_TO_SUBMIT = 'READY_TO_SUBMIT',
  SUBMITTED_TO_CPAM = 'SUBMITTED_TO_CPAM',
  CPAM_PENDING = 'CPAM_PENDING',
  CPAM_APPROVED = 'CPAM_APPROVED',
  CPAM_REJECTED = 'CPAM_REJECTED',
  DELIVERY_SCHEDULED = 'DELIVERY_SCHEDULED',
  DELIVERED = 'DELIVERED',
  MAINTENANCE_ACTIVE = 'MAINTENANCE_ACTIVE',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum CasePriority {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
}

export enum TaskType {
  DOCUMENT_REQUEST = 'DOCUMENT_REQUEST',
  VERIFICATION = 'VERIFICATION',
  FOLLOW_UP = 'FOLLOW_UP',
  DELIVERY_SCHEDULE = 'DELIVERY_SCHEDULE',
  OTHER = 'OTHER',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Product enums
export enum ProductSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

// Quote enums
export enum QuoteStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUPERSEDED = 'SUPERSEDED',
}

// Claim enums
export enum ClaimStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PARTIAL_PAYMENT = 'PARTIAL_PAYMENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  RESUBMITTED = 'RESUBMITTED',
}

export enum GatewayType {
  INFIMAX = 'INFIMAX',
  VEGA = 'VEGA',
  LGPI = 'LGPI',
  MANUAL = 'MANUAL',
}

export enum ClaimDocumentRole {
  PRESCRIPTION = 'PRESCRIPTION',
  ID = 'ID',
  CARTE_VITALE = 'CARTE_VITALE',
  QUOTE = 'QUOTE',
  OTHER = 'OTHER',
}

export enum ReturnFileType {
  NOEMIE = 'NOEMIE',
  ARO = 'ARO',
  ARL = 'ARL',
  AUTRE = 'AUTRE',
}

export enum PaymentMethod {
  CPAM_DIRECT = 'CPAM_DIRECT',
  MUTUELLE = 'MUTUELLE',
  OTHER = 'OTHER',
}

// Device enums
export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  IN_REPAIR = 'IN_REPAIR',
  REPLACED = 'REPLACED',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

// Device instance status for inventory management
export enum DeviceInstanceStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  RETIRED = 'RETIRED',
}

export enum ContractType {
  MANUAL = 'MANUAL',
  ELECTRIC = 'ELECTRIC',
}

export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// Service ticket enums
export enum TicketCategory {
  BATTERY = 'BATTERY',
  WHEELS = 'WHEELS',
  JOYSTICK = 'JOYSTICK',
  BRAKE = 'BRAKE',
  CUSHION = 'CUSHION',
  FRAME = 'FRAME',
  ELECTRICAL = 'ELECTRICAL',
  OTHER = 'OTHER',
}

export enum TicketSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_PARTS = 'PENDING_PARTS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum VisitOutcome {
  COMPLETED = 'COMPLETED',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW',
  PARTS_NEEDED = 'PARTS_NEEDED',
}

// Audit enums
export enum ActorType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  INTEGRATION = 'INTEGRATION',
}

// Notification enums
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}
