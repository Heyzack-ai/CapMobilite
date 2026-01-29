# AX TECH Wheelchair Platform — API Documentation

> **References**: All entities defined in [backend-specs.md](./backend-specs.md)

---

## 1. API Overview

### 1.1 Base URL
```
Production: https://api.axtech.fr/v1
Staging:    https://api-staging.axtech.fr/v1
```

### 1.2 Authentication
All endpoints (except public) require JWT authentication:
```http
Authorization: Bearer <access_token>
```

### 1.3 Content Type
```http
Content-Type: application/json
Accept: application/json
```

### 1.4 Pagination
List endpoints support cursor-based pagination:
```json
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6IjEyMyJ9",
    "hasMore": true,
    "limit": 20
  }
}
```

### 1.5 Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [...],
    "requestId": "req_abc123",
    "timestamp": "2025-01-29T10:30:00Z"
  }
}
```

---

## 2. Authentication Endpoints

### POST /auth/register
Register new patient account.

**Request**:
```json
{
  "email": "patient@example.com",
  "password": "SecureP@ssw0rd!",
  "phone": "+33612345678",
  "firstName": "Jean",
  "lastName": "Dupont",
  "dateOfBirth": "1960-05-15",
  "acceptTerms": true,
  "acceptHealthDataConsent": true
}
```

**Response** `201`: User created, verification required

---

### POST /auth/verify-email
Verify email with 6-digit code.

### POST /auth/verify-phone
Verify phone with 6-digit code.

### POST /auth/login
Login with email/password. Returns JWT tokens or MFA challenge.

### POST /auth/mfa/verify
Complete MFA verification with TOTP code.

### POST /auth/refresh
Refresh access token using refresh token.

### POST /auth/logout
Invalidate refresh token.

### POST /auth/password/reset-request
Request password reset email.

### POST /auth/password/reset-confirm
Reset password with token from email.

---

## 3. Profile Endpoints

### GET /me/profile
Get current user's patient profile.

**Auth**: Patient, Caregiver

### PUT /me/profile
Update profile fields (address, contact preference, emergency contact).

### PUT /me/profile/nir
Update NIR (requires password confirmation).

---

## 4. Consent Endpoints

### GET /me/consents
List all consents given by user.

### POST /me/consents
Give new consent (type + version).

### DELETE /me/consents/{consentType}
Withdraw consent.

---

## 5. Proxy/Caregiver Endpoints

### POST /me/proxy/invite
Invite a caregiver to act on patient's behalf.

### POST /proxy/accept
Accept proxy invitation (as the invited caregiver).

### GET /me/proxy/patients
List patients I can act for (as caregiver).

### POST /me/proxy/switch
Switch context to act as a specific patient.

---

## 6. Document Endpoints

### POST /documents/presign
Request pre-signed upload URL for direct S3 upload.

**Request**:
```json
{
  "filename": "ordonnance.pdf",
  "mimeType": "application/pdf",
  "documentType": "PRESCRIPTION",
  "sizeBytes": 245678
}
```

**Response**: Pre-signed URL with upload fields.

### POST /documents/complete
Notify server that upload is complete, trigger antivirus scan.

### GET /documents/{documentId}
Get document metadata.

### GET /documents/{documentId}/download
Get pre-signed download URL.

### GET /me/documents
List all my uploaded documents.

---

## 7. Case Endpoints

### POST /cases
Create new case from prescription.

**Request**:
```json
{
  "patientId": "uuid",
  "prescriptionDocumentId": "uuid",
  "prescriptionDate": "2025-01-20",
  "productCategory": "ELECTRIC_WHEELCHAIR"
}
```

### GET /cases/{caseId}
Get full case details including status, checklist, quote, claim.

### GET /cases
List cases (filtered by status, assignee, patient).

### PATCH /cases/{caseId}/status
Update case status (Ops/Billing only).

### PATCH /cases/{caseId}/assign
Assign case to ops staff.

### POST /cases/{caseId}/checklist/validate
Update checklist validation state.

### POST /cases/{caseId}/documents
Attach document to case.

### GET /cases/{caseId}/documents
List case documents.

### POST /cases/{caseId}/notes
Add internal/external note.

### GET /cases/{caseId}/notes
List case notes.

---

## 8. Product Catalog Endpoints

### GET /products/families
List product families (manual/electric/accessory).

### GET /products
List products with filtering.

### GET /products/{productId}
Get product details including LPPR codes.

### GET /lppr
List LPPR reimbursement codes (staff only).

---

## 9. Quote Endpoints

### POST /cases/{caseId}/quote/generate
Generate quote with selected products.

**Request**:
```json
{
  "items": [
    {"productId": "uuid", "lpprItemId": "uuid", "quantity": 1}
  ]
}
```

### GET /quotes/{quoteId}
Get quote details.

### GET /quotes/{quoteId}/pdf
Get quote PDF download URL.

### POST /quotes/{quoteId}/approve
Patient approves quote with signature.

### POST /quotes/{quoteId}/supersede
Create new version (if changes needed).

---

## 10. Claim Endpoints

### POST /cases/{caseId}/claims
Create claim for submission.

### POST /claims/{claimId}/documents
Attach required documents to claim.

### POST /claims/{claimId}/submit
Submit claim to billing gateway.

### GET /claims/{claimId}
Get claim status and details.

### GET /claims
List claims with filtering.

### POST /billing/returns/ingest
Ingest NOEMIE/return files (webhook or manual).

---

## 11. Delivery Endpoints

### POST /cases/{caseId}/delivery/schedule
Schedule delivery date and time slot.

### POST /cases/{caseId}/delivery/proof
Record delivery with signature and photos.

---

## 12. Device Instance Endpoints

### GET /me/devices
List my devices (patient view).

### GET /devices/{deviceId}
Get device details including maintenance contract.

---

## 13. Service Ticket Endpoints

### POST /devices/{deviceId}/tickets
Create maintenance/repair ticket.

**Request**:
```json
{
  "category": "BATTERY",
  "severity": "MEDIUM",
  "description": "Battery autonomy reduced to 10km",
  "isSafetyIssue": false
}
```

### GET /tickets/{ticketId}
Get ticket details.

### GET /tickets
List tickets (staff view).

### GET /me/tickets
List my tickets (patient view).

### POST /tickets/{ticketId}/assign
Assign ticket to technician.

### POST /tickets/{ticketId}/visits
Schedule technician visit.

### POST /tickets/{ticketId}/visits/{visitId}/complete
Complete visit with parts used and signature.

### POST /tickets/{ticketId}/close
Close ticket with resolution notes.

---

## 14. Maintenance Contract Endpoints

### GET /contracts/{contractId}
Get contract details and service history.

### GET /contracts/due
List contracts due for renewal (ops view).

---

## 15. Chat/Support Endpoints

### POST /support/chat
Create new chat session.

### POST /support/chat/{sessionId}/messages
Send message in chat.

### GET /support/chat/{sessionId}/messages
Get chat history.

### POST /support/chat/{sessionId}/escalate
Escalate to human support (for safety issues).

---

## 16. Prescriber Portal Endpoints

### POST /prescriber/links
Generate one-time prescriber upload link.

### GET /prescriber/links/{token}/validate
Validate link (public, shows partial patient info).

### POST /prescriber/links/{token}/submit
Submit prescription via link (public with valid token).

---

## 17. Notification Preferences

### GET /me/notifications/preferences
Get notification preferences.

### PUT /me/notifications/preferences
Update notification preferences.

---

## 18. Admin Endpoints

### GET /admin/dashboard/stats
Dashboard statistics (cases, claims, maintenance).

### GET /admin/users
List users (compliance admin).

### GET /admin/audit
Search audit logs (compliance admin).

---

## 19. Health Endpoints

### GET /health
Public health check.

### GET /health/ready
Detailed readiness check (database, redis, storage).

---

## 20. Webhooks

### POST /webhooks/billing/{gatewayType}
Receive billing gateway callbacks (signature verified).

---

## 21. Rate Limits

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| `/auth/*` | 5 req | 1 min |
| `/documents/presign` | 10 req | 1 min |
| `/claims/*/submit` | 20 req | 1 min |
| General API | 100 req | 1 min |

Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
