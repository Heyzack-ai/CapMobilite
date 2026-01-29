# AX TECH Wheelchair Platform — Open Questions

This document captures uncertainties, trade-offs to discuss, and items requiring clarification before or during implementation.

---

## 1. Business & Product Questions

### Q001: Billing Vendor Selection [HIGH PRIORITY]
**Question**: Which certified billing software will be the primary integration target?

**Options**:
- Infimax (assumed primary)
- Vega
- LGPI
- Other

**Impact**: API design, timeline, testing requirements

**Recommended Action**: Confirm vendor choice and obtain API documentation.

---

### Q002: Geographic Scope
**Question**: Is the service available nationwide from launch, or regional rollout?

- Nationwide from day 1.

**Impact**: 
- Technician network requirements
- Delivery logistics
- Marketing scope
- Support staffing

---

### Q003: Proxy/Caregiver Legal Framework
**Question**: What legal documents are required for a caregiver to act on behalf of a patient?

**Considerations**:
- Power of attorney requirements
- EHPAD/nursing home staff authorization
- Family member default permissions
- Revocation process

**Recommended Action**: Legal review of delegation requirements.

---

### Q004: Product Sourcing
**Question**: What is the product acquisition model?
- AX TECH owns inventory (buy, stock, sell)


**Options**:
- AX TECH owns inventory (buy, stock, sell)
- Drop-ship from manufacturers
- Partner network (local providers)
- Hybrid model

**Impact**: Inventory management, delivery logistics, margin structure

---

### Q005: Maintenance Technician Model
**Question**: Who performs maintenance and repairs?
- P2 feature later on implementation
**Options**:
- AX TECH employed technicians
- Contractor network
- Partner providers (local medical equipment shops)
- Manufacturer service network

**Impact**: Service ticket assignment, training, quality control

---

## 2. Technical Questions

### Q006: HDS Provider Selection [HIGH PRIORITY]
**Question**: Which HDS-certified provider will host the platform?

- AWS Paris region with HDS certification

**Options**:
- OVH Cloud HDS
- AWS (Paris region with HDS certification)
- Microsoft Azure HDS
- Scaleway (if HDS available)

**Impact**: Infrastructure design, deployment tooling, cost

**Recommended Action**: Evaluate providers for Kubernetes support, managed PostgreSQL, S3-compatible storage.

---

### Q007: Billing Gateway API Availability
**Question**: Does Infimax (or chosen vendor) provide a REST API, or only file-based integration?

**If API**: 
- Design webhook-based status updates
- Real-time submission

**If File-based**:
- Design batch export/import
- Scheduled sync jobs
- Manual intervention workflow

**Impact**: Architecture of billing integration, ops workflow

---

### Q008: Real-time Requirements
**Question**: Which features require real-time updates vs. polling?

**Candidates for Real-time (WebSocket)**:
- Chat support (confirmed)
- Case status updates (TBD)
- Delivery tracking (TBD)
- Technician dispatch (TBD)

**Recommendation**: Start with polling for all except chat; add WebSocket if UX requires it. - Yes

---

### Q009: Mobile App Requirement
**Question**: Is a native mobile app required for V1, or is mobile web sufficient? - No

**Considerations**:
- Patient demographic (elderly, may prefer native)
- Technician field app needs
- Push notifications
- Offline capability for technicians

**Recommendation**: Mobile-responsive web for V1, evaluate native for V2.

---

### Q010: OCR Accuracy Requirements
**Question**: How accurate must OCR extraction be, and what is the fallback? 

- OCR as hint only (human always reviews)

**Options**:
- OCR as hint only (human always reviews)
- OCR with confidence thresholds (auto-accept if high)
- OCR required for automation

**Recommendation**: OCR as hint only for V1; human verification mandatory.

---

## 3. Compliance Questions

### Q011: CPAM Audit Requirements [HIGH PRIORITY]
**Question**: What audit trail and documentation does CPAM require for claims?

- All documents must be kept for 10 years

**Unknowns**:
- Document retention period
- Required claim attachments
- Signature requirements on quotes
- Digital signature validity

**Recommended Action**: Review CPAM PSDM documentation or consult with compliance expert.

---

### Q012: Marketing Content Pre-Approval
**Question**: Does any content require pre-approval from regulatory bodies before publication?

- Yes

**Considerations**:
- ANSM (medical device advertising)
- CPAM references
- Health claims

**Recommendation**: Legal review of advertising guidelines.

---

### Q013: Data Subject Rights Implementation
**Question**: How do we handle GDPR data deletion requests given retention requirements?

- Anonymization instead of deletion for retained records
- Clear explanation to patient of what can/cannot be deleted for audit trail

**Considerations**:
- Financial records must be retained (10 years)
- Health data has retention requirements
- Patient can request deletion

**Resolution Approach**: 
- Anonymization instead of deletion for retained records
- Clear explanation to patient of what can/cannot be deleted

---

### Q014: Break-Glass Access Logging
**Question**: What is the approval and documentation process for emergency access to patient data?
 - Admin can access with logging

**Considerations**:
- When is break-glass access justified?
- Real-time notification to patient?
- Post-access review requirement?

---

## 4. Operational Questions

### Q015: Support Hours & SLA
**Question**: What are the support hours and response time commitments?

- business hours only (9h-18h)

**Options**:
- Business hours only (9h-18h)
- Extended hours (8h-20h)
- 24/7 (with chatbot + on-call)

**Impact**: Staffing, chatbot reliance, escalation procedures

---

### Q016: Delivery Logistics
**Question**: How is delivery handled operationally?

- Chronopost for delivery

**Options**:
- AX TECH delivery team
- Third-party logistics (Chronopost, DHL)
- Technician delivery (combines delivery + setup)

**Impact**: Proof of delivery process, signature capture, setup training

---

### Q017: Returns & Exchanges
**Question**: What is the process if a delivered wheelchair is unsuitable?

**Considerations**:
- Who decides suitability (patient, prescriber, AX TECH)?
- Exchange process with CPAM
- Inventory handling

---

### Q018: Payment Failure Handling
**Question**: What happens if CPAM payment is delayed or partial?

- Escalation to CPAM for resolution
- Resubmission of claims if needed
- Decide what is best for patient (e.g., delay delivery until payment confirmed)

**Considerations**:
- Cash flow impact
- Patient communication
- Resubmission workflow
- Escalation to CPAM

---

## 5. Integration Questions

### Q019: Prescriber Authentication
**Question**: Should prescribers have full accounts, or link-based upload only?

**Options**:
- **Link-only (current design)**: Simple, no account management
- **Full accounts**: Better tracking, relationship building, repeat uploads

**Consideration**: Volume of prescriptions per prescriber

---

### Q020: France Connect Integration
**Question**: Should we integrate France Connect for patient identity verification?

- Lets do it in v1 itself right now if its not too complex

**Benefits**:
- Verified identity (NIR, name)
- Higher trust
- Potentially faster onboarding

**Challenges**:
- Integration complexity
- Not all patients have France Connect
- Fallback flow required

**Recommendation**: Evaluate for V2 based on fraud rates.

---

### Q021: Mutuelle Integration
**Question**: Is integration with supplementary insurance (mutuelles) required?

- No

**Considerations**:
- Since Dec 2025, 100% CPAM coverage expected
- Mutuelle may still cover accessories not in LPPR
- ROC (Remboursement des Organismes Complémentaires) integration

**Recommendation**: V1 assumes CPAM-only; evaluate mutuelle for V2.

---

## 6. Data Questions

### Q022: Historical Data Migration
**Question**: Is there existing data to migrate from current AX TECH systems?

- No

**Unknowns**:
- Current system (spreadsheets, other software?)
- Data quality
- Patient consent for migration

---

### Q023: Analytics & Reporting Requirements
**Question**: What business intelligence/reporting is required beyond ops dashboards?

**Possible Requirements**:
- Executive dashboards
- Financial reporting
- Operational KPIs
- Compliance reports

---

### Q024: Data Export Requirements
**Question**: What data export capabilities are required?

- v2 feature

**Considerations**:
- Patient data export (GDPR)
- Financial exports (accounting)
- Audit exports (compliance)
- Custom reporting

---

## 7. Prioritization Questions

### Q025: MVP Feature Set
**Question**: Can the roadmap be compressed by deferring features?

**Candidates for Deferral**:
- Chatbot (use human-only support initially)
- Proxy/caregiver flows (handle manually)
- Prescriber portal (accept email uploads)
- Advanced analytics

---

### Q026: Maintenance Module Timing
**Question**: Is maintenance functionality required at launch, or can it wait?

**Consideration**: First maintenance needs arise ~1 year after delivery.

**Recommendation**: Basic ticket creation at launch; full maintenance module can follow. - yes 

---

## 8. Risk Questions

### Q027: Billing Integration Failure Mode
**Question**: What is the fallback if billing integration fails in production?

- Queue for retry and alert ops team

**Options**:
- Manual submission via vendor UI
- Queue for retry
- Alert and pause

**Recommendation**: Design for manual fallback from day 1.

---

### Q028: Vendor Lock-in Risk
**Question**: How critical is billing vendor portability?

- not a big deal

**If Critical**: Invest more in gateway abstraction
**If Not**: Accept vendor-specific integration

---

## Summary: Priority Actions

| Priority | Question | Owner | Due |
|----------|----------|-------|-----|
| 🔴 HIGH | Q001: Billing vendor selection | Business | Before dev start |
| 🔴 HIGH | Q006: HDS provider selection | Tech | Before dev start |
| 🔴 HIGH | Q011: CPAM audit requirements | Compliance | Before billing module |
| 🟡 MEDIUM | Q007: Billing API availability | Tech | Week 1 |
| 🟡 MEDIUM | Q004: Product sourcing model | Business | Week 2 |
| 🟡 MEDIUM | Q005: Technician model | Operations | Week 3 |
| 🟢 LOW | Q020: France Connect | Tech | V2 planning |
| 🟢 LOW | Q021: Mutuelle integration | Business | V2 planning |
