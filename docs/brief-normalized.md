# AX TECH Wheelchair Platform — Normalized Brief

## Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | AX TECH Wheelchair Platform |
| **Company** | AX TECH (France) |
| **Domain** | Medical device distribution & reimbursement (VPH/LPPR framework) |
| **Target Market** | France — patients, prescribers, healthcare ecosystem |

---

## 1. Purpose & Vision

AX TECH is building a patient + prescriber + operations platform to manage the **end-to-end lifecycle of wheelchair provision** in France under the VPH/LPP (LPPR) framework.

Since December 1, 2025, wheelchairs (manual and electric) are **100% reimbursed** by the French Assurance Maladie when prescribed by a physician. AX TECH aims to become the digital leader in this space — the "Doctolib of wheelchair reimbursement."

### Core Value Proposition
- **For Patients**: Zero upfront cost, clear process, predictable updates, no paperwork confusion
- **For Prescribers**: Easy submission flow with minimal time investment
- **For AX TECH Ops/Finance**: End-to-end traceability, payment monitoring, fewer resubmissions

---

## 2. Goals

### Business Goals
1. Reduce AX TECH admin time per dossier by **>60%** vs. email + spreadsheets
2. Reach high first-pass acceptance rate (low rejection) through structured, validated dossiers
3. Build recurring revenue via **maintenance and repair workflows**
4. Scale nationally with minimal operational overhead

### User Outcome Goals
- Patients: Clear process, predictable updates, no paperwork confusion
- Prescribers: Easy submission flow with minimal time
- Ops/Finance: End-to-end traceability, payments monitoring, fewer resubmissions

### Success Metrics (KPIs)
| Metric | Target |
|--------|--------|
| Time intake → ready to submit | Median < 24h |
| Acceptance rate | > 90% (after stabilization) |
| Payment cycle | Track median days submission → paid |
| Maintenance compliance | % devices with on-time annual check |
| Support SLA | First-response time, resolution time |

---

## 3. Non-Goals (Explicit Scope Exclusions)

1. **No clinical assessment or medical decision support** — Platform is explicitly NOT a medical product
2. **No automated prescription creation** — Prescriptions are upload-only from licensed physicians
3. **No Doctolib API integration** — Doctolib does not provide prescription APIs; manual upload only
4. **No e-commerce / online payment** — All transactions go through CPAM reimbursement
5. **No pharmacy requirements** — Wheelchairs are not medications; no pharmacist needed

---

## 4. User Roles & Personas

### 4.1 Patient
- Creates account, uploads documents, tracks dossier, requests maintenance
- May be elderly, have limited mobility, or varying digital literacy
- Zero financial outlay expected

### 4.2 Caregiver/Proxy
- Acts on behalf of patient with delegated consent
- Family member, social worker, or nursing home staff

### 4.3 Prescriber (Healthcare Professional)
- Physician (GP, specialist, MPR, hospital)
- Uploads prescription & optional clinical notes
- **Upload only** — no prescribing logic in platform

### 4.4 AX TECH Operations
- Builds dossier, validates documents, generates devis/quote
- Coordinates delivery logistics
- Primary workflow orchestrator

### 4.5 AX TECH Billing
- Submits claims via certified billing/teletransmission stack
- Tracks payments, handles rejections
- Reconciles with remittance files

### 4.6 Technician
- Field service for delivery and maintenance
- Views assigned interventions
- Records parts used, closure notes

### 4.7 Compliance Admin
- Audits access logs
- Reviews content approvals
- Manages retention controls

---

## 5. Key Workflows & User Journeys

### 5.1 Patient Journey
```
Create Account → Consent → Upload Docs → Track Status → Receive Delivery → Maintenance
```

1. Create account (email + SMS verification) or caregiver-assisted onboarding
2. Accept privacy + health-data consent
3. Upload: ID, Carte Vitale (or NIR details), prescription (PDF/photo), optional supporting docs
4. Choose contact preference (SMS/email/phone)
5. Track statuses: Received → Under review → Quote ready → Submitted → Approved/Rejected → Delivery scheduled → Delivered → Maintenance active
6. Request maintenance via portal or chatbot; track technician visit and resolution

### 5.2 Prescriber Journey
```
Open Secure Link → Identify Patient → Upload Prescription → Submit
```

1. Open secure link (one-time token)
2. Identify patient (name + DOB + optional NIR)
3. Upload prescription PDF + optional attachments
4. Submit; patient receives confirmation

### 5.3 AX TECH Operations Journey
```
Triage → Validate → Select Product → Generate Quote → Package Dossier → Coordinate Delivery → Activate Maintenance
```

1. Triage new intake
2. Validate completeness with checklist (document presence, required fields, dates)
3. Select appropriate product category and options **based on prescription**
4. Generate compliant quote/devis
5. Package dossier for submission
6. Coordinate delivery and collect proof
7. Activate maintenance contract; schedule annual checks

### 5.4 Billing & Payment Journey
```
Create Claim → Submit via Certified Stack → Import Returns → Reconcile
```

1. Create claim package from dossier
2. Submit via certified billing/teletransmission stack
3. Import return files/status updates
4. Reconcile payments, handle rejection codes, manage resubmissions

### 5.5 Maintenance Journey
```
Annual Reminder → Ticket Creation → Technician Dispatch → Resolution → Billing
```

1. System triggers annual maintenance reminder
2. Patient requests service (via portal/chatbot) or scheduled check
3. Ticket created with category, severity, safety flag
4. Technician dispatched
5. Parts used and time recorded
6. Ticket closed with forfait billing

---

## 6. Technical Constraints

### 6.1 Health Data Hosting (CRITICAL)
- **HDS certification required** (Hébergeur de Données de Santé)
- All prescription and health-related documents must be HDS-hosted
- Compliant providers: OVH Cloud HDS, AWS Health (HDS France), Microsoft Azure HDS
- Encryption at rest and in transit mandatory
- Full audit trails required

### 6.2 CPAM/Billing Integration
- **No direct public API exists for CPAM**
- Must integrate via certified billing software (Infimax, Vega, LGPI, Axisanté, HelloDoc)
- Or file-based export/import (claim packages, status returns)
- Uses SESAM-Vitale ecosystem: SCOR (documents), B2 (billing), ADRi (patient rights)

### 6.3 Data Protection (GDPR + French Health Law)
- Consent capture and versioning required
- Data minimization principles
- Patient rights portal: export, deletion requests
- Retention schedules per French health data law

### 6.4 Advertising Compliance
- Wheelchairs are Class I/IIa medical devices — advertising IS allowed
- Must include disclaimer: "Sous réserve de prescription médicale"
- Cannot claim to prescribe, diagnose, or guarantee reimbursement
- Content approval workflow required for public-facing pages

---

## 7. Required Integrations

### 7.1 Billing Gateway (Critical Path)
- **Primary**: API integration with certified billing software (Infimax/Vega/LGPI)
- **Fallback**: File-based export/import for claim packages and return files
- **Manual**: Assisted workflow where operator uses billing software UI

### 7.2 Notifications
- **SMS**: Twilio, SMSFactor, MessageBird
- **Email**: Brevo, SendGrid

### 7.3 Document Processing
- Pre-signed URL uploads to S3-compatible HDS storage
- Antivirus scanning on upload
- Optional OCR for indexing (machine-extracted, verify manually)

### 7.4 Identity (Optional Enhancement)
- France Connect for verified identity
- Keycloak for self-hosted IdP

---

## 8. Product Catalog (V1 Scope)

### Manual Wheelchairs
- 2 product families
- Sizes: S, M, L
- Features: Pliable, weight limits
- LPPR code mapping required

### Electric Wheelchairs
- 2 product families
- Types: Indoor, outdoor, mixed
- Features: Battery autonomy, accessories
- LPPR code mapping required

### Accessories
- Cushions (anti-escarres)
- Head rests
- Batteries
- Position aids (PAP)

### Maintenance Forfaits (Annual)
| Type | Forfait |
|------|---------|
| Manual wheelchair | ~€260/year |
| Electric wheelchair | ~€750/year |

---

## 9. Compliance Requirements Summary

| Requirement | Implementation |
|-------------|----------------|
| HDS Hosting | Mandatory for all health data |
| RGPD/GDPR | Consent capture, data rights portal |
| Advertising rules | Content approval workflow, phrase blacklist |
| Medical device regs | No Rx logic, upload only |
| Records retention | Per French business law + health data law |
| Accessibility | WCAG 2.1 AA minimum |

---

## 10. Risk Summary

| Risk | Mitigation |
|------|------------|
| Advertising compliance violation | Content CMS with approvals + linting |
| Billing integration variability | Gateway abstraction + vendor pilot |
| Non-HDS data storage | HDS-only deployments + infra scanning |
| Incomplete dossiers | Automated checklists + validation |
| Support volume | Chatbot triage + technician dispatch |

---

## 11. Timeline Reference

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 0 | Weeks 1-2 | Foundations (auth, roles, docs, audit) |
| Phase 1 | Weeks 3-6 | MVP dossier flow |
| Phase 2 | Weeks 7-10 | Billing integration |
| Phase 3 | Weeks 11-14 | Delivery & device lifecycle |
| Phase 4 | Weeks 15-18 | Maintenance engine |
| Phase 5 | Weeks 19-24 | Compliance hardening & scale |
