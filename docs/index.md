# AX TECH Wheelchair Platform — Architecture Documentation

## Overview

AX TECH is building a patient + prescriber + operations platform to manage the end-to-end lifecycle of wheelchair provision in France under the VPH/LPP (LPPR) reimbursement framework. Since December 2025, wheelchairs are 100% covered by Assurance Maladie when prescribed, creating a significant market opportunity.

The platform handles: patient onboarding, prescription intake, dossier management, CPAM claim submission, delivery coordination, and ongoing maintenance.

**Key Constraint**: The platform is explicitly **not** a medical product — it does not prescribe, diagnose, or provide clinical decision support.

---

## Documents

### [Brief (Normalized)](./brief-normalized.md)
Structured version of the original product brief with goals, users, workflows, and constraints. Start here for business context.

### [Backend Specifications](./backend-specs.md)
**Start here for technical details.** Contains the canonical domain model (source of truth for all entities), database schema, services architecture, authentication/authorization model, background jobs, and observability.

### [API Documentation](./api-docs.md)
Complete endpoint catalog organized by domain (auth, cases, quotes, claims, maintenance, etc.). Includes request/response schemas, authentication requirements, and rate limits.

### [Frontend Specifications](./frontend-specs.md)
Screen-by-screen breakdown for public website, patient portal, prescriber portal, and admin back-office. Includes component specifications, form validation rules, state management approach, and accessibility requirements.

### [AI Services](./ai-services.md)
Chatbot architecture for support triage (strictly non-medical), OCR document processing, safety guardrails, and compliance constraints. Includes system prompts and escalation rules.

### [Decisions Log](./decisions.md)
Architectural decisions made during spec generation with rationale. Covers stack choices, authentication strategy, compliance approach, and trade-offs accepted.

### [Open Questions](./open-questions.md)
Uncertainties and items requiring clarification before implementation. Prioritized by impact with recommended actions.

---

## Navigation Tips

1. **For business context** → Start with [Brief](./brief-normalized.md)
2. **For domain model / entities** → [Backend Specs](./backend-specs.md) Section 1-2
3. **For API integration** → [API Documentation](./api-docs.md)
4. **For UI development** → [Frontend Specs](./frontend-specs.md)
5. **For chatbot development** → [AI Services](./ai-services.md)
6. **For architectural rationale** → [Decisions Log](./decisions.md)
7. **For blockers / unknowns** → [Open Questions](./open-questions.md)

---

## Consistency Notes

All specs maintain naming consistency:

| Entity | Backend | API | Frontend |
|--------|---------|-----|----------|
| Case | `Case` | `/cases` | `CaseCard`, `/dossiers` |
| Quote | `Quote` | `/quotes` | `QuoteBuilder`, `/devis` |
| Claim | `Claim` | `/claims` | `ClaimStatus`, `/facturation` |
| Service Ticket | `ServiceTicket` | `/tickets` | `TicketCard`, `/maintenance` |
| Device | `DeviceInstance` | `/devices` | `DeviceCard`, `/mes-equipements` |

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Backend | NestJS (TypeScript) |
| Frontend | Next.js 14 (TypeScript) |
| Database | PostgreSQL |
| Cache/Queue | Redis + BullMQ |
| Storage | S3-compatible (HDS) |
| Auth | JWT + TOTP MFA |
| Hosting | HDS-certified provider |

---

## Phase Overview

| Phase | Weeks | Focus |
|-------|-------|-------|
| 0 | 1-2 | Foundations (auth, docs, audit) |
| 1 | 3-6 | MVP dossier flow |
| 2 | 7-10 | Billing integration |
| 3 | 11-14 | Delivery & device lifecycle |
| 4 | 15-18 | Maintenance engine |
| 5 | 19-24 | Compliance hardening & scale |

---

## Key Compliance Requirements

| Requirement | Status |
|-------------|--------|
| HDS hosting for health data | 🔴 Required |
| No medical advice in chatbot | 🔴 Required |
| Content approval workflow | 🔴 Required |
| Audit logging | 🔴 Required |
| GDPR data rights | 🔴 Required |
| Advertising compliance | 🔴 Required |

---

## Quick Links

- **Create Case**: `POST /cases` → [API](./api-docs.md#8-case-endpoints)
- **Generate Quote**: `POST /cases/{id}/quote/generate` → [API](./api-docs.md#10-quote-endpoints)
- **Submit Claim**: `POST /claims/{id}/submit` → [API](./api-docs.md#11-claim-endpoints)
- **Create Ticket**: `POST /devices/{id}/tickets` → [API](./api-docs.md#14-service-ticket-endpoints)
- **Patient Dashboard**: `/dashboard` → [Frontend](./frontend-specs.md#61-dashboard)
- **Case Creation Wizard**: `/dossiers/nouveau` → [Frontend](./frontend-specs.md#64-new-case)
- **Chatbot System Prompt**: → [AI Services](./ai-services.md#4-system-prompt)

---

## Document Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| brief-normalized.md | 1.0 | 2025-01-29 |
| backend-specs.md | 1.0 | 2025-01-29 |
| api-docs.md | 1.0 | 2025-01-29 |
| frontend-specs.md | 1.0 | 2025-01-29 |
| ai-services.md | 1.0 | 2025-01-29 |
| decisions.md | 1.0 | 2025-01-29 |
| open-questions.md | 1.0 | 2025-01-29 |

---

## Next Steps

1. **Resolve HIGH priority open questions** (billing vendor, HDS provider, CPAM requirements)
2. **Review decisions** with technical and business stakeholders
3. **Create UX wireframes** based on frontend specs
4. **Set up development environment** with HDS-compatible local tooling
5. **Begin Phase 0** implementation (auth, document upload, audit logging)
