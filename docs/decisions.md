# AX TECH Wheelchair Platform — Decisions Log

This document captures architectural decisions made during spec generation and the rationale behind them.

---

## 1. Stack Decisions

### D001: Backend Framework — NestJS (TypeScript)

**Decision**: Use NestJS with TypeScript for the backend API.

**Rationale**:
- Strong typing reduces runtime errors (critical for health data)
- Decorator-based architecture matches domain complexity
- Built-in support for validation, guards, interceptors
- Large ecosystem and active maintenance
- Same language as frontend (developer efficiency)

**Alternatives Considered**:
- FastAPI (Python): Excellent, but team expertise assumed in TypeScript
- Express: Too minimal for this complexity level

---

### D002: Frontend Framework — Next.js 14 (App Router)

**Decision**: Use Next.js 14 with App Router for all frontend applications.

**Rationale**:
- Server components for improved performance
- Built-in routing and code splitting
- Excellent SEO for public pages
- React ecosystem compatibility
- Vercel deployment simplicity (if not HDS-constrained)

**Alternatives Considered**:
- Remix: Good, but smaller ecosystem
- Vue/Nuxt: Team expertise assumed in React

---

### D003: Database — PostgreSQL

**Decision**: Use PostgreSQL as the primary database.

**Rationale**:
- JSONB support for flexible metadata storage
- Strong ACID compliance (financial/health data)
- Excellent indexing options
- HDS-certified hosting available
- Mature encryption-at-rest support

**Alternatives Considered**:
- MySQL: Less JSONB capability
- MongoDB: ACID compliance concerns for financial data

---

### D004: Queue System — Redis + BullMQ

**Decision**: Use Redis with BullMQ for job queues.

**Rationale**:
- Reliable job processing with retries
- Dashboard for monitoring
- Rate limiting support
- Cron-like scheduling
- Well-documented patterns

**Alternatives Considered**:
- RabbitMQ: More complex, overkill for this scale
- AWS SQS: Ties to specific cloud provider

---

## 2. Authentication & Authorization Decisions

### D005: JWT with Refresh Tokens

**Decision**: Use JWT access tokens (15 min) + refresh tokens (7 days).

**Rationale**:
- Stateless authentication scales well
- Short access token TTL limits exposure window
- Refresh token rotation for security
- Standard approach with library support

**Alternatives Considered**:
- Session-based: More server state, complex in distributed setup
- Opaque tokens: Less debugging visibility

---

### D006: RBAC with Object-Level Access Control

**Decision**: Implement RBAC for role permissions + ABAC for object-level access.

**Rationale**:
- Roles provide clear permission boundaries
- Object-level rules handle "patient can only see their own data"
- Proxy/caregiver relationships need relationship-based access
- Audit requirements need explicit permission checks

**Alternatives Considered**:
- Pure ABAC: More flexible but harder to reason about
- Pure RBAC: Can't handle object ownership well

---

### D007: MFA Required for Staff

**Decision**: Require TOTP-based MFA for all staff roles.

**Rationale**:
- Staff access sensitive health and financial data
- TOTP doesn't require SMS infrastructure
- Standard security practice for healthcare

**Alternatives Considered**:
- WebAuthn/FIDO2: Better UX but device dependency
- SMS OTP: Less secure, higher cost

---

## 3. Data & Storage Decisions

### D008: HDS Hosting Mandatory

**Decision**: All health data must be hosted with HDS-certified providers.

**Rationale**:
- French law requires HDS for health data (Article L.1111-8)
- CPAM will not accept non-compliant providers
- Data protection is foundational to business

**Implementation**:
- OVH Cloud HDS for infrastructure
- S3-compatible object storage in HDS zone
- No exceptions for any health-related data

---

### D009: Column-Level Encryption for Sensitive Fields

**Decision**: Encrypt NIR, clinical notes, and other sensitive PII at application level.

**Rationale**:
- Defense in depth beyond disk encryption
- Limits exposure from database breaches
- Meets data minimization principles
- KMS-managed keys enable key rotation

**Fields Encrypted**:
- `PatientProfile.nir`
- `Prescription.clinicalNotes`
- `PrescriberProfile.rppsNumber` (considered sensitive)

---

### D010: Document Storage with Pre-Signed URLs

**Decision**: Use S3 pre-signed URLs for direct upload/download.

**Rationale**:
- Reduces API server load
- Large files don't transit through app
- Standard pattern with security controls
- Short TTL limits exposure

**Controls**:
- Upload URLs: 15 min TTL
- Download URLs: 5 min TTL
- Content-type validation
- Size limits enforced

---

## 4. Integration Decisions

### D011: Billing Gateway Abstraction

**Decision**: Create an abstraction layer over billing software (Infimax, Vega, LGPI).

**Rationale**:
- No direct CPAM API exists
- Multiple billing vendors may be needed
- Abstraction enables vendor switching
- Manual fallback for edge cases

**Interface Design**:
```typescript
interface BillingGateway {
  submitClaim(claim: ClaimPackage): Promise<SubmissionResult>;
  attachDocuments(claimRef: string, docs: Document[]): Promise<void>;
  getClaimStatus(claimRef: string): Promise<ClaimStatus>;
  ingestReturnFile(file: Buffer, type: ReturnFileType): Promise<ParsedReturn>;
}
```

---

### D012: No Doctolib API Integration

**Decision**: Prescription upload via manual document upload only, no Doctolib API.

**Rationale**:
- Doctolib does not provide prescription APIs
- Privacy/consent concerns with appointment platform data
- Manual upload is compliant and proven
- Prescriber portal provides good UX alternative

**Mitigation**:
- Secure one-time links for prescribers
- Easy upload flow (drag-drop)
- OCR for text extraction assistance

---

### D013: SMS via Twilio/SMSFactor

**Decision**: Use Twilio (primary) or SMSFactor (backup) for SMS notifications.

**Rationale**:
- Reliable delivery to French numbers
- Good deliverability reporting
- API-first approach
- Reasonable pricing

**Considerations**:
- French-based provider (SMSFactor) may have regulatory preference
- Implement provider abstraction for switching

---

## 5. Compliance Decisions

### D014: Content Approval Workflow for Public Pages

**Decision**: Implement CMS-style approval workflow for all public-facing content mentioning reimbursement.

**Rationale**:
- Advertising compliance for medical devices
- Prevents accidental prohibited claims
- Audit trail for content changes
- Multi-eye review before publication

**Workflow**:
1. Author creates/edits content
2. Content flagged if contains sensitive terms
3. Compliance review required
4. Approval before publication
5. All versions archived

---

### D015: Phrase Blacklist for High-Risk Claims

**Decision**: Implement automated checking for prohibited phrases in content.

**Blacklisted Phrases**:
- "gratuit" (without context)
- "garanti"
- "100% remboursé" (without prescription caveat)
- "nous prescrivons"
- "pas besoin d'ordonnance"
- "on décide pour vous"

**Implementation**:
- Pre-publish content lint
- Warning on edit
- Block if critical violations

---

### D016: Audit Log Immutability

**Decision**: Audit logs are append-only and immutable.

**Rationale**:
- Compliance requirement for health data
- Non-repudiation for financial transactions
- Investigation support
- Regulatory audit readiness

**Implementation**:
- Separate audit table with no UPDATE/DELETE permissions
- Partitioned by month for retention management
- 5-year retention policy

---

## 6. UX Decisions

### D017: Multi-Step Wizard for Case Creation

**Decision**: Use multi-step wizard pattern for new case creation.

**Rationale**:
- Reduces cognitive load for elderly users
- Clear progress indication
- Easier error recovery (per-step validation)
- Save progress between steps

**Steps**:
1. Prescription upload
2. Identity documents
3. Address confirmation
4. Review & submit

---

### D018: Chatbot as First-Line Support

**Decision**: Implement chatbot for initial support triage.

**Rationale**:
- 24/7 availability for simple queries
- Reduces human support load
- Faster response for common questions
- Clear escalation path to humans

**Critical Constraint**:
- No medical advice under any circumstances
- Immediate escalation for safety issues

---

### D019: Status Timeline Visualization

**Decision**: Show case progress as visual timeline, not just status badge.

**Rationale**:
- Patients want to know "where am I in the process"
- Timeline shows progress and remaining steps
- Reduces support queries about status
- Builds trust through transparency

---

## 7. Operational Decisions

### D020: SLA Tracking per Case

**Decision**: Track and alert on case SLA violations.

**SLA Targets**:
- Intake to quote: 24 hours
- Quote to patient approval: 72 hours
- Approval to CPAM submission: 24 hours
- Delivery after CPAM approval: 7 days

**Implementation**:
- Computed SLA deadline stored on case
- Background job checks overdue cases
- Alerts to ops team
- Dashboard visibility

---

### D021: Maintenance Contract Auto-Activation

**Decision**: Automatically create maintenance contract on device delivery.

**Rationale**:
- Every device should have maintenance coverage
- Manual creation is error-prone
- Ensures forfait billing eligibility
- Reminder scheduling depends on contract

**Implementation**:
- Triggered by delivery proof submission
- Contract type based on device category
- Annual renewal date calculated

---

## 8. Assumptions Made

### A001: French Market Only (V1)
- Single language (French)
- French regulatory framework only
- French phone numbers (+33)
- EUR currency only

### A002: Team TypeScript Expertise
- Full-stack TypeScript is acceptable
- No Python/Go preference constraints

### A003: HDS Provider Available
- Can deploy to HDS environment
- Provider supports required services (K8s, S3, PostgreSQL)

### A004: Billing Vendor Selected
- Infimax as primary (assumed API availability)
- Vega as secondary
- Manual fallback acceptable

### A005: Device Catalog is Small
- <50 SKUs in V1
- No complex configurator needed
- Catalog managed by ops, not self-service

### A006: Patient Digital Literacy Varies
- Design for elderly/low-tech users
- Simple flows, large touch targets
- Phone support always available

---

## 9. Trade-offs Accepted

### T001: Build vs. Buy for Billing
**Decision**: Build gateway abstraction, use vendor software for submission.

**Trade-off**: Less control over submission process, but faster time-to-market and proven CPAM compliance.

### T002: Simple Chatbot vs. Advanced AI
**Decision**: Rule-based intent detection + LLM for responses.

**Trade-off**: Less sophisticated conversation, but lower risk of inappropriate responses and easier compliance review.

### T003: Monolith vs. Microservices
**Decision**: Modular monolith for V1.

**Trade-off**: Scaling limits, but faster development and simpler operations. Extract services later if needed.

### T004: Real-time vs. Polling for Status
**Decision**: Polling with React Query for case status updates.

**Trade-off**: Not instant updates, but simpler infrastructure. WebSocket for chat only.
