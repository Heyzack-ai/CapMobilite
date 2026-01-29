# CapMobilité - Project Status & TODO

> Last Updated: 29 January 2026

---

## ✅ COMPLETED FEATURES

### Backend (NestJS)
- [x] **Core Infrastructure**
  - PostgreSQL with Prisma ORM
  - Redis for caching/sessions
  - BullMQ for job queues
  - S3 integration for document storage
  - Docker Compose setup with LocalStack

- [x] **Authentication Module**
  - User registration with patient profile creation
  - Email verification with 6-digit codes
  - Login with JWT tokens (access + refresh)
  - MFA setup and verification (TOTP)
  - Password reset flow
  - Logout and token revocation
  - Rate limiting on auth endpoints

- [x] **User Management**
  - Patient, Prescriber, Staff profiles
  - Role-based access control (PATIENT, PRESCRIBER, OPS, BILLING, TECHNICIAN, COMPLIANCE_ADMIN)
  - Profile CRUD operations
  - NIR (social security number) handling
  - **Notification preferences endpoints** ✨ NEW
  - **User devices/sessions management** ✨ NEW
  - **User tickets endpoint** ✨ NEW

- [x] **Case Management**
  - Case creation from prescription
  - Status workflow (17 states from INTAKE_RECEIVED to CLOSED)
  - Case assignment to staff
  - Checklist state management
  - Case notes and tasks
  - Priority management
  - **Case documents attachment/listing** ✨ NEW

- [x] **Document Module**
  - Pre-signed S3 uploads
  - Document metadata management
  - Multiple document types (PRESCRIPTION, ID_CARD, CARTE_VITALE, etc.)
  - Scan status tracking

- [x] **Prescription Module**
  - Prescription creation and verification
  - Link to documents and patients
  - Product category assignment

- [x] **Product Catalog**
  - Product families (Manual/Electric/Accessories)
  - Products with specifications
  - LPPR item mapping for reimbursement codes
  - Product-LPPR many-to-many relationship

- [x] **Quote Module**
  - Quote generation from cases
  - Line items with products and LPPR codes
  - Quote approval workflow
  - PDF document linking

- [x] **Claim Module**
  - Claim creation from approved quotes
  - Claim status workflow
  - Claim returns and payments tracking
  - Gateway type support (INFIMAX, VEGA, LGPI, MANUAL)

- [x] **Device Module**
  - Device instance management
  - Maintenance contract tracking
  - Delivery information

- [x] **Service Ticket Module**
  - Ticket creation for maintenance
  - Category and severity levels
  - Technician visit scheduling
  - Parts usage tracking

- [x] **Notification Module**
  - Notification creation and queuing
  - Email and SMS channel support
  - Template-based notifications
  - Status tracking (PENDING, SENT, DELIVERED, FAILED)

- [x] **Audit Module**
  - Audit event logging
  - Actor tracking (USER, SYSTEM, INTEGRATION)

- [x] **Health Check**
  - System health endpoints

- [x] **Consent Module** ✨ NEW
  - List user consents (GET /me/consents)
  - Get specific consent (GET /me/consents/{type})
  - Create consent (POST /me/consents)
  - Revoke consent (DELETE /me/consents/{type})

- [x] **Proxy/Caregiver Module** ✨ NEW
  - Invite proxy (POST /me/proxy/invite)
  - List proxies (GET /me/proxy)
  - Revoke proxy (DELETE /me/proxy/{id})
  - Accept invitation (POST /proxy/accept)
  - List managed patients (GET /me/proxy/patients)
  - Switch patient context (POST /me/proxy/switch)

- [x] **Prescriber Portal Module** ✨ NEW
  - Generate secure link (POST /prescriber/links)
  - Validate link - public (GET /prescriber/links/:token/validate)
  - Submit prescription - public (POST /prescriber/links/:token/submit)
  - List patient links (GET /prescriber/links/patient/:patientId)
  - Revoke link (DELETE /prescriber/links/:linkId)

- [x] **Chat/Support Module** ✨ NEW
  - Create chat session (POST /chat/sessions)
  - List user sessions (GET /chat/sessions)
  - Get session details (GET /chat/sessions/:id)
  - Send message (POST /chat/sessions/:id/messages)
  - Get session messages (GET /chat/sessions/:id/messages)
  - Escalate session (POST /chat/sessions/:id/escalate)
  - Resolve session (POST /chat/sessions/:id/resolve)
  - Close session (POST /chat/sessions/:id/close)

- [x] **Admin Module** ✨ NEW
  - Dashboard statistics (GET /admin/dashboard/stats)
  - User management search (GET /admin/users)
  - Audit log search (GET /admin/audit)
  - System metrics (GET /admin/system/metrics)

### Frontend (Next.js 14)
- [x] **Core Setup**
  - App Router with i18n (French/English)
  - Tailwind CSS styling
  - Zustand state management
  - React Query ready

- [x] **Public Pages**
  - Landing page (index.html - standalone)
  - Compliance-reviewed content

- [x] **Authentication Pages**
  - Login (`/connexion`)
  - Registration (`/inscription`)
  - Email verification (`/verification`)
  - Password reset (`/mot-de-passe-oublie`)

- [x] **Patient Portal Structure**
  - Dashboard (`/dashboard`)
  - Case list (`/dossiers`)
  - Case detail (`/dossiers/[caseId]`)
  - Documents (`/documents`)
  - My devices (`/mes-equipements`)
  - Maintenance/tickets (`/maintenance`)
  - Profile (`/profil`)
  - Support (`/support`)

- [x] **Prescriber Portal**
  - Secure link upload (`/prescripteur/[token]`)

- [x] **Admin Back-Office Structure**
  - Dashboard (`/admin/tableau-de-bord`)
  - Case management (`/admin/dossiers`)
  - Quotes (`/admin/devis`)
  - Billing (`/admin/facturation`)
  - Deliveries (`/admin/livraisons`)
  - Service/SAV (`/admin/sav`)
  - Users (`/admin/utilisateurs`)
  - Audit (`/admin/audit`)

- [x] **Components**
  - Admin sidebar navigation
  - Patient layout
  - Form components
  - UI components (shadcn/radix-based)

### Database Schema (Prisma)
- [x] All 30+ models defined per specs
- [x] All enums defined
- [x] Proper indexes and relations
- [x] Initial migration created

---

## 🔴 NOT IMPLEMENTED - CRITICAL

### Authentication & Identity
- [ ] **FranceConnect Integration** - SSO for French government identity
  - OAuth2 flow with FranceConnect endpoints
  - FranceConnectAccount model (exists in plan, not in schema)
  - Account linking for existing users
  - *Documented in plan.md but not implemented*

### Notifications
- [ ] **Actual Email Sending** - Currently placeholder only
  - Integration with email service (SendGrid, Brevo, SES)
  - Email templates for all notification types:
    - Registration verification
    - Password reset
    - Case status updates
    - Quote ready
    - Delivery scheduled
    - Maintenance reminders
  - *Processor exists but `sendEmailNotification` is a placeholder*

- [ ] **Actual SMS Sending** - Currently placeholder only
  - Integration with SMS provider (Twilio, SMSFactor)
  - SMS templates for critical notifications

### Document Processing
- [ ] **Antivirus Scanning** - Queued but not implemented
  - Integration with ClamAV or cloud scanning service
  - Document quarantine workflow

- [ ] **OCR Processing** - Schema supports metadata but not implemented
  - Integration with OCR service
  - Prescription data extraction
  - Human verification workflow

---

## 🟡 NOT IMPLEMENTED - IMPORTANT

### Business Features - Phase 1
- [ ] **Doctor/Commercial Incentive System**
  - Reward points for doctors recommending service
  - Points redemption for gift cards, travel
  - Commercial people commission/bonus tracking
  - *Mentioned in original TODO*

- [x] **Consent Management API** ✨ DONE (Backend module complete)
  - View current consents
  - Withdraw consent flow
  - Version tracking

- [x] **Proxy/Caregiver Module** ✨ DONE (Backend module complete)
  - Proxy invitation flow
  - Proxy acceptance
  - Switch context to act as patient
  - Consent document upload
  - *API endpoints defined but likely not fully implemented*

### Admin Features
- [ ] **Quote PDF Generation**
  - Automated PDF creation
  - LPPR-compliant format

- [ ] **Billing Gateway Integration**
  - Actual integration with Infimax/Vega/LGPI
  - Or file-based export/import
  - SESAM-Vitale compliance

- [x] **Dashboard Statistics API** ✨ DONE
  - Cases by status chart data
  - SLA violation tracking
  - Payment metrics

### Support Features
- [x] **Support Chat Backend** ✨ DONE
  - Chat session management
  - Message storage
  - Chatbot integration ready
  - *WebSocket for real-time would be future enhancement*

### Frontend Integration
- [ ] **API Integration** - Most pages have structure but need API calls
  - Connect forms to actual endpoints
  - Error handling
  - Loading states

- [ ] **Real-time Updates**
  - Polling or WebSocket for status changes
  - Notification badges

---

## 🟢 NICE TO HAVE - FUTURE

### Phase 2 Features
- [ ] Public pages in Next.js (currently standalone index.html)
  - `/comment-ca-marche`
  - `/vos-droits`
  - `/catalogue`
  - `/contact`

- [ ] Phone verification flow
- [ ] Maintenance contract renewal automation
- [ ] Annual maintenance reminders (scheduled jobs)
- [ ] Technician mobile app
- [ ] Advanced reporting and analytics
- [ ] Multi-language expansion beyond FR/EN

### Technical Improvements
- [ ] End-to-end tests
- [ ] API documentation (Swagger is setup, needs completion)
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] CI/CD pipeline
- [ ] HDS-compliant deployment

---

## 📋 ORIGINAL TODO ITEMS (Updated Status)

| Original Item | Status |
|--------------|--------|
| Doctor reward system | 🔴 Not Started |
| Incentive system for commercial people & doctors | 🔴 Not Started |
| Implement FranceConnect login | 🔴 Not Started (plan exists) |
| Implement email notifications | 🟡 Partially Done (placeholder) |

---

## 📊 COMPLETION ESTIMATE

| Area | Completion |
|------|------------|
| Database Schema | ~98% |
| Backend Core APIs | ~95% |
| Backend Integrations | ~30% |
| Frontend Structure | ~70% |
| Frontend Integration | ~40% |
| Notifications | ~20% |
| Admin Features | ~70% |
| Overall MVP | ~70% |

---

## 🎯 RECOMMENDED PRIORITY ORDER

1. **Email Notifications** - Critical for user flows
2. **API Frontend Integration** - Make pages functional
3. **FranceConnect** - Important for French market
4. **Billing Gateway** - Required for revenue
5. **WebSocket for Chat** - Real-time experience
6. **Incentive System** - Growth driver
