# AX TECH Wheelchair Platform — Frontend Specifications

> **References**: 
> - Entities from [backend-specs.md](./backend-specs.md)
> - API endpoints from [api-docs.md](./api-docs.md)

---

## 1. Technical Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | React Query (server state) + Zustand (client state) |
| Forms | React Hook Form + Zod validation |
| Components | Radix UI primitives + custom components |
| Auth | JWT with httpOnly cookies |
| i18n | next-intl (French only v1) |

---

## 2. Application Structure

```
/app
├── (public)/           # Public pages (no auth)
│   ├── page.tsx        # Landing page
│   ├── comment-ca-marche/
│   ├── vos-droits/
│   ├── catalogue/
│   ├── maintenance/
│   └── contact/
├── (auth)/             # Auth pages
│   ├── connexion/
│   ├── inscription/
│   ├── verification/
│   └── mot-de-passe-oublie/
├── (prescriber)/       # Prescriber portal
│   └── prescripteur/[token]/
├── (patient)/          # Patient portal (auth required)
│   ├── dashboard/
│   ├── dossiers/
│   ├── mes-equipements/
│   ├── maintenance/
│   ├── documents/
│   ├── profil/
│   └── support/
├── (admin)/            # Staff back-office (role-based)
│   ├── tableau-de-bord/
│   ├── dossiers/
│   ├── devis/
│   ├── facturation/
│   ├── livraisons/
│   ├── sav/
│   ├── utilisateurs/
│   └── audit/
├── layout.tsx
└── globals.css
```

---

## 3. Design System

### 3.1 Color Palette
```css
--color-primary: #1E40AF;      /* Blue - trust, medical */
--color-primary-light: #3B82F6;
--color-primary-dark: #1E3A8A;
--color-secondary: #059669;    /* Green - success, health */
--color-warning: #F59E0B;      /* Amber - attention */
--color-error: #DC2626;        /* Red - errors */
--color-neutral-50: #F9FAFB;
--color-neutral-100: #F3F4F6;
--color-neutral-900: #111827;
```

### 3.2 Typography
```css
--font-heading: 'Inter', sans-serif;
--font-body: 'Inter', sans-serif;
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;
```

### 3.3 Spacing Scale
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
```

### 3.4 Accessibility Requirements
- WCAG 2.1 AA compliance minimum
- Color contrast ratio ≥ 4.5:1 for text
- Focus indicators visible
- Keyboard navigation support
- Screen reader compatible (ARIA labels)
- Touch targets ≥ 44px

---

## 4. Public Website Screens

### 4.1 Landing Page (`/`)

**Purpose**: Explain service, build trust, guide to action

**Components**:
- Hero section with value proposition
- "How it works" steps
- Trust indicators (CPAM partnership, HDS hosting)
- CTA buttons (Start my case / Healthcare professional)
- Footer with legal links

**Content Requirements** (Compliance):
- Must include: "Sous réserve de prescription médicale"
- Must include: "Prise en charge selon éligibilité définie par l'Assurance Maladie"
- No claims of "gratuit" or "garanti"

**API Dependencies**: None (static content)

---

### 4.2 How It Works (`/comment-ca-marche`)

**Purpose**: Step-by-step process explanation

**Sections**:
1. Obtain prescription from your doctor
2. Create account and upload documents
3. AX TECH builds your dossier
4. Submission to Assurance Maladie
5. Delivery to your home
6. Ongoing maintenance

**Key Message**: AX TECH handles administrative work, not medical decisions.

---

### 4.3 Patient Rights (`/vos-droits`)

**Purpose**: Transparency on LPPR reimbursement

**Content**:
- What is covered since Dec 2025 reform
- Types of wheelchairs
- Maintenance forfaits
- No out-of-pocket when compliant

**Compliance Note**: Never say "100% remboursé automatiquement" — always "selon prescription et éligibilité"

---

### 4.4 Catalog (`/catalogue`)

**Purpose**: Show available product types (indicative only)

**API Endpoint**: `GET /products/families`, `GET /products`

**Components**:
- Product family cards
- Filter by category
- Product detail modal

**Key Constraint**: Products are selected based on prescription, not patient choice.

---

### 4.5 Contact (`/contact`)

**Purpose**: Contact form and support info

**Fields**: Name, email, phone, subject, message
**No API**: Form sends email via backend

---

## 5. Authentication Screens

### 5.1 Login (`/connexion`)

**Components**:
- Email input
- Password input (show/hide toggle)
- "Forgot password" link
- Submit button
- Link to registration

**API**: `POST /auth/login`

**States**:
- Default
- Loading
- Error (invalid credentials)
- MFA required → redirect to MFA screen

**Validation**:
- Email: required, valid format
- Password: required

---

### 5.2 Registration (`/inscription`)

**Multi-step form**:

**Step 1: Account**
- Email
- Password (requirements visible)
- Phone

**Step 2: Identity**
- First name
- Last name
- Date of birth

**Step 3: Consents**
- Terms of service checkbox
- Health data consent checkbox (with full text link)
- Marketing consent checkbox (optional)

**API**: `POST /auth/register`

**Validation**:
- Password: min 12 chars, uppercase, lowercase, number, special char
- Phone: E.164 format
- All consents: required for health data and ToS

---

### 5.3 Email Verification (`/verification/email`)

**Components**:
- 6-digit code input
- Resend code button (with cooldown)
- Success → redirect to phone verification or dashboard

**API**: `POST /auth/verify-email`

---

### 5.4 Phone Verification (`/verification/telephone`)

**Components**:
- 6-digit code input
- Resend code button
- Success → redirect to dashboard

**API**: `POST /auth/verify-phone`

---

### 5.5 MFA Verification (`/verification/mfa`)

**Components**:
- TOTP 6-digit input
- "Remember this device" checkbox
- Backup code link

**API**: `POST /auth/mfa/verify`

---

### 5.6 Password Reset (`/mot-de-passe-oublie`)

**Step 1**: Enter email
**Step 2**: Check inbox message
**Step 3**: Enter new password (via token link)

**API**: `POST /auth/password/reset-request`, `POST /auth/password/reset-confirm`

---

## 6. Patient Portal Screens

### 6.1 Dashboard (`/dashboard`)

**Purpose**: Overview of patient's status

**Components**:
- Active case status card (if exists)
- My devices summary
- Recent notifications
- Quick actions (new case, support)

**API**:
- `GET /me/profile`
- `GET /cases?patientId={me}&limit=5`
- `GET /me/devices`
- `GET /me/tickets?status=OPEN`

---

### 6.2 Case List (`/dossiers`)

**Components**:
- Case cards with status badges
- Status filter
- Create new case button

**API**: `GET /cases`

**Status Badge Colors**:
| Status | Color |
|--------|-------|
| INTAKE_RECEIVED | Blue |
| DOCUMENTS_PENDING | Amber |
| UNDER_REVIEW | Blue |
| QUOTE_READY | Green |
| SUBMITTED_TO_CPAM | Purple |
| CPAM_APPROVED | Green |
| DELIVERED | Green |

---

### 6.3 Case Detail (`/dossiers/[caseId]`)

**Tabs**:
1. **Overview**: Status timeline, checklist progress
2. **Documents**: Uploaded documents with status
3. **Quote**: View quote, approve (if pending)
4. **Delivery**: Scheduled date, tracking

**API**: `GET /cases/{caseId}`

**Actions**:
- Upload missing document → document upload modal
- Approve quote → signature capture modal
- Request support → chat

---

### 6.4 New Case (`/dossiers/nouveau`)

**Multi-step wizard**:

**Step 1: Prescription**
- Upload prescription (drag-drop or file picker)
- Prescription date picker
- Product category selector (based on prescription)

**Step 2: Identity Documents**
- Upload ID card
- Upload Carte Vitale (or enter NIR manually)

**Step 3: Address Confirmation**
- Display address from profile
- Edit if needed
- Delivery notes field

**Step 4: Review & Submit**
- Summary of all uploads
- Consent confirmation
- Submit button

**API**:
- `POST /documents/presign` (per document)
- `POST /documents/complete` (per document)
- `POST /cases`

---

### 6.5 Quote Approval (`/dossiers/[caseId]/devis`)

**Components**:
- Quote details (items, prices)
- LPPR coverage explanation
- Patient remainder (should be €0)
- Signature pad component
- Approve button

**API**: 
- `GET /quotes/{quoteId}`
- `POST /quotes/{quoteId}/approve`

---

### 6.6 My Devices (`/mes-equipements`)

**Components**:
- Device cards with photo, serial, status
- Maintenance contract status
- "Report issue" button per device

**API**: `GET /me/devices`

---

### 6.7 Device Detail (`/mes-equipements/[deviceId]`)

**Sections**:
- Device info (model, serial, delivery date)
- Warranty status
- Maintenance contract details
- Service history timeline
- Open tickets

**API**: `GET /devices/{deviceId}`

---

### 6.8 Create Service Ticket (`/maintenance/nouveau`)

**Form Fields**:
- Device selector (if multiple)
- Issue category dropdown
- Severity selector
- Description textarea
- Safety issue checkbox (shows warning)
- Photo upload (optional)

**API**: `POST /devices/{deviceId}/tickets`

**Validation**:
- Category: required
- Severity: required
- Description: required, min 20 chars

---

### 6.9 My Tickets (`/maintenance`)

**Components**:
- Ticket cards with status, scheduled visit
- Filter by status
- Link to create new ticket

**API**: `GET /me/tickets`

---

### 6.10 Ticket Detail (`/maintenance/[ticketId]`)

**Sections**:
- Ticket info (category, severity, description)
- Status timeline
- Scheduled visit details
- Resolution notes (if closed)
- Chat with support

**API**: `GET /tickets/{ticketId}`

---

### 6.11 Documents (`/documents`)

**Components**:
- Document list with type badges
- Upload new document button
- Download buttons
- Scan status indicators

**API**: `GET /me/documents`

---

### 6.12 Profile (`/profil`)

**Tabs**:
1. **Personal Info**: Name, DOB (read-only), address (editable)
2. **Contact**: Email, phone, preferences
3. **Security**: Password change, MFA setup
4. **Consents**: View/withdraw consents
5. **Proxy**: Manage caregivers

**API**: 
- `GET /me/profile`
- `PUT /me/profile`
- `GET /me/consents`

---

### 6.13 Support Chat (`/support`)

**Components**:
- Chat message list
- Message input with attachment support
- Typing indicator
- System messages (bot/human escalation)

**API**:
- `POST /support/chat`
- `POST /support/chat/{sessionId}/messages`
- `GET /support/chat/{sessionId}/messages` (polling or WebSocket)

---

## 7. Prescriber Portal Screens

### 7.1 Prescription Upload (`/prescripteur/[token]`)

**Purpose**: Allow doctors to upload prescriptions via secure link

**Validation Screen** (initial):
- Shows partial patient name
- Validates token not expired
- Link to upload form

**Upload Form**:
- Prescriber info (RPPS/ADELI, name, specialty, email)
- Prescription date
- Document upload
- Product category selection
- Clinical notes (optional, encrypted)
- Submit button

**API**:
- `GET /prescriber/links/{token}/validate`
- `POST /documents/presign`
- `POST /prescriber/links/{token}/submit`

**Success Screen**:
- Confirmation message
- Reference number
- "Patient will be contacted within 24h"

---

## 8. Admin Back-Office Screens

### 8.1 Dashboard (`/admin/tableau-de-bord`)

**Purpose**: Ops/Billing overview

**Widgets**:
- Cases by status (bar chart)
- Cases received today vs yesterday
- SLA violations count
- Pending claims amount
- Open tickets count

**API**: `GET /admin/dashboard/stats`

---

### 8.2 Case Management (`/admin/dossiers`)

**Components**:
- Data table with columns: Case #, Patient, Status, Priority, Assigned, Created, SLA
- Filters: status, priority, assignee, date range
- Search by case # or patient name
- Bulk actions (assign)

**API**: `GET /cases` with admin filters

**Row Actions**:
- View details
- Assign
- Change status

---

### 8.3 Case Detail (Admin) (`/admin/dossiers/[caseId]`)

**Enhanced view with**:
- Full checklist management
- Document verification toggles
- Internal notes
- Task management
- Quote generation
- Claim creation link

**API**:
- `GET /cases/{caseId}`
- `POST /cases/{caseId}/checklist/validate`
- `POST /cases/{caseId}/notes`

---

### 8.4 Quote Builder (`/admin/devis/nouveau`)

**Components**:
- Case selector (or from case context)
- Product search/filter
- LPPR code lookup
- Line item builder
- Auto-calculation of totals
- Generate PDF preview
- Save draft / Send to patient

**API**:
- `GET /products`
- `GET /lppr`
- `POST /cases/{caseId}/quote/generate`

---

### 8.5 Billing Dashboard (`/admin/facturation`)

**Tabs**:
1. **Pending Claims**: Ready to submit
2. **Submitted**: Awaiting response
3. **Rejections**: Need resubmission
4. **Payments**: Received payments

**API**: `GET /claims` with status filters

---

### 8.6 Claim Detail (`/admin/facturation/[claimId]`)

**Sections**:
- Claim status and history
- Attached documents
- Return file data
- Payment records
- Resubmission workflow

**API**: `GET /claims/{claimId}`

---

### 8.7 Delivery Management (`/admin/livraisons`)

**Components**:
- Calendar view of scheduled deliveries
- List view with filters
- Technician assignment

**API**: Custom delivery list endpoint

---

### 8.8 SAV/Tickets (`/admin/sav`)

**Components**:
- Ticket queue with priority sorting
- Filters: status, severity, category, technician
- Assignment dropdown
- Bulk actions

**API**: `GET /tickets` with admin filters

---

### 8.9 Ticket Detail (Admin) (`/admin/sav/[ticketId]`)

**Enhanced with**:
- Technician assignment
- Visit scheduling
- Parts usage tracking
- Invoice generation for maintenance forfait

**API**: Various ticket endpoints

---

### 8.10 User Management (`/admin/utilisateurs`)

**Components**:
- User table (patients, prescribers, staff)
- Search by name/email
- Role filter
- Status actions (suspend/activate)

**API**: `GET /admin/users`

---

### 8.11 Audit Logs (`/admin/audit`)

**Components**:
- Log table with filters
- Actor, action, object, timestamp columns
- Date range filter
- Export functionality

**API**: `GET /admin/audit`

---

## 9. Shared Components

### 9.1 Document Upload Component
```typescript
interface DocumentUploadProps {
  documentType: DocumentType;
  onUploadComplete: (documentId: string) => void;
  accept?: string;
  maxSizeMB?: number;
}
```

**States**: idle, uploading, scanning, complete, error

---

### 9.2 Signature Pad Component
```typescript
interface SignaturePadProps {
  onSign: (signatureData: string) => void;
  width?: number;
  height?: number;
}
```

---

### 9.3 Status Badge Component
```typescript
interface StatusBadgeProps {
  status: CaseStatus | TicketStatus | ClaimStatus;
  size?: 'sm' | 'md' | 'lg';
}
```

---

### 9.4 Timeline Component
```typescript
interface TimelineProps {
  events: TimelineEvent[];
  currentStatus?: string;
}
```

---

### 9.5 Data Table Component
```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  filters?: FilterState[];
  onFilterChange?: (filters: FilterState[]) => void;
}
```

---

## 10. Form Validation Rules

### Patient Registration
```typescript
const registrationSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string()
    .min(12, "Minimum 12 caractères")
    .regex(/[A-Z]/, "Une majuscule requise")
    .regex(/[a-z]/, "Une minuscule requise")
    .regex(/[0-9]/, "Un chiffre requis")
    .regex(/[^A-Za-z0-9]/, "Un caractère spécial requis"),
  phone: z.string().regex(/^\+33[0-9]{9}$/, "Format: +33612345678"),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  dateOfBirth: z.date().max(new Date(), "Date invalide"),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Requis" }) }),
  acceptHealthDataConsent: z.literal(true, { errorMap: () => ({ message: "Requis" }) }),
});
```

### Service Ticket
```typescript
const ticketSchema = z.object({
  category: z.enum(['BATTERY', 'WHEELS', 'JOYSTICK', 'BRAKE', 'CUSHION', 'FRAME', 'ELECTRICAL', 'OTHER']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(20, "Décrivez le problème en détail (min 20 caractères)"),
  isSafetyIssue: z.boolean(),
});
```

---

## 11. State Management

### Server State (React Query)
- All API data fetched via React Query
- Automatic caching and revalidation
- Optimistic updates for mutations

### Client State (Zustand)
- Auth state (current user, tokens)
- UI state (sidebar open, active filters)
- Form wizard state (multi-step forms)

```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  actingAs: Patient | null;  // For proxy mode
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  switchToPatient: (patientId: string) => Promise<void>;
}
```

---

## 12. Error Handling

### Global Error Boundary
- Catches React errors
- Shows user-friendly error page
- Reports to Sentry

### API Error Handling
- React Query onError callbacks
- Toast notifications for user feedback
- Automatic retry for network errors

### Form Error Display
- Inline field errors
- Summary at form top for screen readers
- Focus first error field

---

## 13. Performance Requirements

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Cumulative Layout Shift | < 0.1 |
| Bundle size (initial) | < 200KB gzipped |

### Optimization Strategies
- Route-based code splitting
- Image optimization (Next.js Image)
- Prefetching on hover
- Service worker for offline support

