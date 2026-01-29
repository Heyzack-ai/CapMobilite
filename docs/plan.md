# Plan de Conformité - CapMobilité / AX TECH

## 📋 Vue d'Ensemble

Ce document détaille les modifications nécessaires pour rendre le site `index.html` **100% conforme** aux réglementations françaises sur les dispositifs médicaux, la publicité santé, et la protection des données.

**Objectif** : Assurer une communication légale, transparente et sans risque juridique pour l'activité de distribution de fauteuils roulants remboursés par l'Assurance Maladie.

---

## 🚨 RÈGLES FONDAMENTALES

### Ce que nous pouvons faire (AUTORISÉ)

| Action | Justification légale |
|--------|---------------------|
| ✅ Accompagnement administratif | Gestion des dossiers CPAM |
| ✅ Réception de l'ordonnance | Le patient nous la transmet |
| ✅ Constitution du dossier | Service administratif |
| ✅ Dépôt auprès de la CPAM | En tant que PSDM agréé |
| ✅ Livraison à domicile | Prestation logistique |
| ✅ Formation à l'utilisation | Service après-vente |
| ✅ Maintenance & réparations | Forfaits CPAM prévus |
| ✅ Publicité Internet/Réseaux | Dispositifs médicaux classe I = autorisé |
| ✅ Suivi client & CRM | RGPD + HDS respectés |
| ✅ Chatbot SAV logistique | Questions non-médicales |

### Ce que nous NE POUVONS PAS faire (INTERDIT)

| Action interdite | Risque |
|-----------------|--------|
| ❌ Prescrire un fauteuil | Exercice illégal de la médecine |
| ❌ Évaluer le besoin médical | Exercice illégal de la médecine |
| ❌ Analyser l'état de santé | Exercice illégal de la médecine |
| ❌ Influencer la prescription | Complicité d'exercice illégal |
| ❌ Garantir le remboursement | Publicité mensongère |
| ❌ Dire "gratuit" sans conditions | Publicité trompeuse |
| ❌ Conseil médical via chatbot | Exercice illégal de la médecine |

---

## 📝 MODIFICATIONS REQUISES - index.html

### 1. META DESCRIPTION (Ligne 6)

**❌ ACTUEL (problématique):**
```html
<meta name="description" content="Depuis décembre 2025, l'Assurance Maladie prend en charge intégralement votre fauteuil roulant. Zéro reste à charge. CapMobilité s'occupe de tout.">
```

**✅ CONFORME:**
```html
<meta name="description" content="Fauteuils roulants pris en charge par l'Assurance Maladie sur prescription médicale. CapMobilité vous accompagne dans vos démarches administratives.">
```

**Raison**: Éviter la promesse absolue "100% remboursé" sans mentionner la condition de prescription médicale.

---

### 2. TITLE (Ligne 5)

**❌ ACTUEL:**
```html
<title>CapMobilité - Votre Fauteuil Roulant 100% Remboursé</title>
```

**✅ CONFORME:**
```html
<title>CapMobilité - Fauteuils Roulants Pris en Charge | Sur Prescription Médicale</title>
```

---

### 3. HERO SECTION - BADGE (Lignes ~136-138)

**❌ ACTUEL:**
```html
<span x-show="lang === 'fr'">Réforme 2025 · 100% Pris en charge</span>
```

**✅ CONFORME:**
```html
<span x-show="lang === 'fr'">Réforme Décembre 2025 · Sur prescription médicale</span>
```

---

### 4. HERO SECTION - H1 PRINCIPAL (Lignes ~140-142)

**❌ ACTUEL:**
```html
<span x-show="lang === 'fr'">Votre Fauteuil Roulant <br/><span class="gradient-text">100% Remboursé</span></span>
```

**✅ CONFORME:**
```html
<span x-show="lang === 'fr'">Fauteuil Roulant <br/><span class="gradient-text">Pris en Charge</span></span>
```

---

### 5. HERO SECTION - PARAGRAPHE INTRO (Lignes ~144-146)

**❌ ACTUEL:**
```html
<span x-show="lang === 'fr'">Depuis décembre 2025, l'Assurance Maladie prend en charge intégralement votre fauteuil roulant. <strong class="text-navy-900 font-semibold">Zéro reste à charge.</strong> On s'occupe de tout pour vous.</span>
```

**✅ CONFORME:**
```html
<span x-show="lang === 'fr'">Depuis décembre 2025, les fauteuils roulants peuvent être pris en charge à 100% par l'Assurance Maladie, <strong class="text-navy-900 font-semibold">uniquement sur prescription médicale</strong>. Nous vous accompagnons dans toutes vos démarches administratives.</span>
```

**Raison**: Ajout de la condition obligatoire "sur prescription médicale".

---

### 6. HERO SECTION - LISTE AVANTAGES (Lignes ~149-170)

**❌ ACTUEL:**
```html
<span class="font-medium" x-show="lang === 'fr'">Aucun frais pour vous (Tiers Payant Intégral)</span>
```

**✅ CONFORME:**
```html
<span class="font-medium" x-show="lang === 'fr'">Aucune avance de frais si dossier conforme (Tiers Payant)</span>
```

---

### 7. BOUTON CTA - "Vérifier mon éligibilité" (Multiple occurrences)

**❌ ACTUEL:**
```html
<span x-show="lang === 'fr'">Vérifier mon éligibilité</span>
```

**✅ CONFORME:**
```html
<span x-show="lang === 'fr'">Déposer ma demande</span>
```

**Raison**: Nous ne "vérifions" pas l'éligibilité médicale - c'est le rôle du médecin et de la CPAM. Nous recevons les demandes.

---

### 8. FLOATING BADGE "0€" (Lignes ~223-239)

**❌ ACTUEL:**
```html
<div class="text-xs text-gray-400 font-medium">
    <span x-show="lang === 'fr'">Pour tout dossier validé CPAM</span>
</div>
```

**✅ CONFORME (ajouter mention):**
```html
<div class="text-xs text-gray-400 font-medium">
    <span x-show="lang === 'fr'">Sous réserve de prescription médicale et accord CPAM</span>
</div>
```

---

### 9. SECTION "Comment ça marche" - ÉTAPE 1 (Lignes ~337-339)

**❌ ACTUEL:**
```html
<span x-show="lang === 'fr'">Remplissez le formulaire ou appelez-nous. On vérifie votre éligibilité en 24h avec une simple ordonnance.</span>
```

**✅ CONFORME:**
```html
<span x-show="lang === 'fr'">Remplissez le formulaire ou appelez-nous. Transmettez-nous votre ordonnance médicale et nous constituons votre dossier.</span>
```

**Raison**: Nous ne "vérifions" pas l'éligibilité - c'est le médecin qui prescrit, la CPAM qui valide.

---

### 10. SECTION "Pourquoi nous faire confiance" - "Sans risque" (Lignes ~595-600)

**❌ ACTUEL:**
```html
<span x-show="lang === 'fr'">Vous ne payez jamais rien. On se fait payer par la CPAM.</span>
```

**✅ CONFORME:**
```html
<span x-show="lang === 'fr'">Aucune avance de frais pour les dossiers conformes. Facturation directe à l'Assurance Maladie.</span>
```

---

### 11. FAQ - Question 1 "C'est vraiment gratuit ?" (Lignes ~730-735)

**❌ ACTUEL:**
```html
<span x-show="lang === 'fr'">Oui, c'est 100% légal et officiel. Depuis décembre 2025, l'Assurance Maladie rembourse intégralement les fauteuils roulants prescrits par un médecin. Nous ne vous demandons jamais de payer quoi que ce soit. On se fait régler directement par la CPAM.</span>
```

**✅ CONFORME:**
```html
<span x-show="lang === 'fr'">Oui, c'est légal et officiel. Depuis décembre 2025, l'Assurance Maladie peut prendre en charge intégralement les fauteuils roulants <strong>prescrits par un médecin</strong> et conformes à la réglementation LPPR. Nous pratiquons le tiers payant : vous n'avancez pas de frais lorsque votre dossier est accepté par la CPAM.</span>
```

---

### 12. FAQ - Question 3 "Je n'ai pas encore d'ordonnance" (Lignes ~763-769)

**❌ ACTUEL:**
```html
<span x-show="lang === 'fr'">Prenez rendez-vous avec votre médecin traitant ou un médecin spécialiste. Si le médecin juge qu'un fauteuil roulant est nécessaire, il vous délivrera une ordonnance.</span>
```

**✅ CONFORME (OK mais à enrichir):**
```html
<span x-show="lang === 'fr'">Seul un médecin peut établir une prescription de fauteuil roulant. Prenez rendez-vous avec votre médecin traitant ou un médecin spécialiste (MPR, neurologue...). Si le médecin estime qu'un fauteuil roulant est médicalement nécessaire, il établira l'ordonnance. CapMobilité n'intervient qu'après obtention de cette prescription.</span>
```

---

### 13. SECTION FORMULAIRE - TITRE (Lignes ~799-803)

**❌ ACTUEL:**
```html
<span x-show="lang === 'fr'">Vérifier votre éligibilité en 2 minutes</span>
```

**✅ CONFORME:**
```html
<span x-show="lang === 'fr'">Déposer votre demande d'accompagnement</span>
```

---

### 14. SECTION FORMULAIRE - SOUS-TITRE (Lignes ~805-807)

**❌ ACTUEL:**
```html
<span x-show="lang === 'fr'">Remplissez ce formulaire. On vous rappelle sous 24h pour confirmer votre éligibilité.</span>
```

**✅ CONFORME:**
```html
<span x-show="lang === 'fr'">Remplissez ce formulaire. Nous vous rappelons sous 24h pour vous accompagner dans vos démarches administratives.</span>
```

---

### 15. SECTION CTA FINALE (Lignes ~932-940)

**❌ ACTUEL:**
```html
<span x-show="lang === 'fr'">Ne payez plus un seul euro. L'état prend tout en charge.</span>
```

**✅ CONFORME:**
```html
<span x-show="lang === 'fr'">Sur prescription médicale, l'Assurance Maladie peut prendre en charge votre fauteuil roulant.</span>
```

---

### 16. AJOUT OBLIGATOIRE - DISCLAIMER LÉGAL EN HAUT DE PAGE

**À AJOUTER après la balise `<body>` :**

```html
<!-- Legal Disclaimer Banner -->
<div class="bg-navy-900 text-white text-xs py-2 px-4 text-center">
    <span x-show="lang === 'fr'">⚠️ La fourniture de fauteuil roulant est soumise à prescription médicale obligatoire. Dispositif médical de classe I.</span>
    <span x-show="lang === 'en'" x-cloak>⚠️ Wheelchair supply requires mandatory medical prescription. Class I medical device.</span>
</div>
```

---

### 17. MENTIONS LÉGALES FOOTER - RENFORCEMENT

**Le footer actuel est correct mais à compléter avec :**

```html
<p class="text-xs text-gray-500 leading-relaxed text-justify">
    <span x-show="lang === 'fr'">
    ⚠️ <strong>IMPORTANT :</strong> Les fauteuils roulants sont des dispositifs médicaux de classe I (Règlement UE 2017/745). 
    La prise en charge par l'Assurance Maladie est <strong>exclusivement soumise à prescription médicale</strong> établie par un médecin.
    CapMobilité n'intervient à aucun moment dans l'évaluation médicale ni dans la décision de prescription.
    L'accord de prise en charge relève de la seule décision de l'Assurance Maladie selon les critères LPPR.
    Lire attentivement les instructions d'utilisation du dispositif.
    </span>
</p>
```

---

## 🔒 PHRASES LÉGALES À UTILISER

### Formulations AUTORISÉES (à utiliser partout)

| Français | English |
|----------|---------|
| "Sur prescription médicale" | "With medical prescription" |
| "Selon éligibilité définie par l'Assurance Maladie" | "Subject to eligibility defined by Health Insurance" |
| "Nous vous accompagnons dans vos démarches administratives" | "We support you in your administrative procedures" |
| "La prescription est établie exclusivement par un médecin" | "The prescription is issued exclusively by a doctor" |
| "Sous réserve d'accord de la CPAM" | "Subject to CPAM approval" |
| "Aucune avance de frais pour les dossiers conformes" | "No upfront payment for compliant files" |

### Formulations INTERDITES (ne jamais utiliser)

| ❌ Interdit | Raison |
|-------------|--------|
| "100% gratuit" (sans conditions) | Publicité trompeuse |
| "Garanti remboursé" | Promesse abusive |
| "On vérifie votre besoin" | Exercice illégal médecine |
| "On analyse votre situation" | Exercice illégal médecine |
| "Vous avez droit à..." | Préjuge de la décision CPAM |
| "Fauteuil gratuit" | Trompeur |

---

## 📄 PAGES LÉGALES À CRÉER

Les pages suivantes doivent être créées et liées dans le footer :

1. **mentions-legales.html** - Informations société, SIRET, FINESS, directeur publication
2. **cgu.html** - Conditions Générales d'Utilisation du site
3. **cgv.html** - Conditions Générales de Vente (dispositifs médicaux)
4. **confidentialite.html** - Politique RGPD + HDS (données de santé)
5. **cookies.html** - Politique cookies avec bandeau de consentement

---

## 🛡️ CONFORMITÉ TECHNIQUE

### Hébergement HDS (OBLIGATOIRE)

Les données de santé (ordonnances, informations médicales) doivent être hébergées chez un hébergeur **certifié HDS** :

- OVH Cloud HDS ✅
- AWS Health (HDS France) ✅
- Microsoft Azure HDS ✅

**Article L.1111-8 du Code de la santé publique**

### RGPD Renforcé

- Consentement explicite pour données de santé
- Registre des traitements
- DPA avec hébergeur
- Droit d'accès / rectification / suppression

---

## 📊 CHECKLIST DE MISE EN CONFORMITÉ

- [ ] Modifier le `<title>` de la page
- [ ] Modifier la `<meta description>`
- [ ] Ajouter le banner disclaimer en haut de page
- [ ] Modifier le badge hero "Réforme 2025"
- [ ] Modifier le H1 principal
- [ ] Modifier le paragraphe d'introduction
- [ ] Modifier les bullet points avantages
- [ ] Remplacer "Vérifier mon éligibilité" → "Déposer ma demande" (tous les CTA)
- [ ] Modifier le floating badge "0€"
- [ ] Modifier l'étape 1 "Comment ça marche"
- [ ] Modifier la section "Sans risque"
- [ ] Modifier toutes les réponses FAQ
- [ ] Modifier le titre du formulaire
- [ ] Modifier le sous-titre du formulaire
- [ ] Modifier la CTA finale
- [ ] Renforcer les mentions légales footer
- [ ] Créer les pages légales (CGV, CGU, Confidentialité, Cookies, Mentions légales)
- [ ] Implémenter le bandeau cookies
- [ ] Vérifier l'hébergement HDS

---

## 🎯 RÉSUMÉ

### Notre positionnement légal

> **CapMobilité accompagne les patients dans leurs démarches administratives pour l'obtention d'un fauteuil roulant pris en charge par l'Assurance Maladie. La prescription médicale est établie exclusivement par un médecin. La décision de prise en charge relève de la seule compétence de l'Assurance Maladie.**

### Ce que nous sommes
- ✅ Prestataire de Services et Distributeur de Matériel médical (PSDM)
- ✅ Accompagnateur administratif
- ✅ Fournisseur agréé CPAM
- ✅ Prestataire de maintenance

### Ce que nous ne sommes PAS
- ❌ Prescripteurs médicaux
- ❌ Évaluateurs de besoins médicaux
- ❌ Décisionnaires de la prise en charge

---

**Document créé le** : 29 janvier 2026  
**Version** : 1.0  
**Auteur** : AX TECH / CapMobilité  
**Prochaine révision** : À chaque modification réglementaire


Here are the available routes to test:

Public Routes
Landing Page: http://localhost:3000
Login: http://localhost:3000/connexion
Register: http://localhost:3000/inscription
Forgot Password: http://localhost:3000/mot-de-passe-oublie
Patient Portal (requires login)
Dashboard: http://localhost:3000/dashboard
My Cases: http://localhost:3000/dossiers
My Devices: http://localhost:3000/mes-equipements
Maintenance: http://localhost:3000/maintenance
New Ticket: http://localhost:3000/maintenance/nouveau
Documents: http://localhost:3000/documents
Profile: http://localhost:3000/profil
Support: http://localhost:3000/support
Admin Portal (requires admin login)
Admin Dashboard: http://localhost:3000/admin/tableau-de-bord
Cases Management: http://localhost:3000/admin/dossiers
Quotes: http://localhost:3000/admin/devis
Deliveries: http://localhost:3000/admin/livraisons
Service (SAV): http://localhost:3000/admin/sav
Users: http://localhost:3000/admin/utilisateurs
Billing: http://localhost:3000/admin/facturation
Audit: http://localhost:3000/admin/audit
Prescriber Portal
Document Upload: http://localhost:3000/prescripteur/test-token-123
Mock Login Credentials
Patient: jean.dupont@email.com / password123
Admin: admin@capmobilite.fr / admin123

---

## 🔐 FRANCECONNECT INTEGRATION PLAN

### Overview

FranceConnect is the French government's official identity federation service that allows citizens to use their existing government accounts (Impots.gouv.fr, Ameli.fr, etc.) to authenticate on third-party services. This integration will:

1. **Simplify patient onboarding** - No need to create new credentials
2. **Verify patient identity** - Get certified identity data (nom, prénoms, date de naissance, etc.)
3. **Comply with regulations** - Meet HDS and RGPD requirements for health data
4. **Improve security** - Leverage government-grade authentication

### Technical Foundation

**Protocol**: OpenID Connect (OAuth 2.0 extension)
**Production Endpoints**:
- Authorization: `https://app.franceconnect.gouv.fr/api/v1/authorize`
- Token: `https://app.franceconnect.gouv.fr/api/v1/token`
- UserInfo: `https://app.franceconnect.gouv.fr/api/v1/userinfo`
- Logout: `https://app.franceconnect.gouv.fr/api/v1/logout`

**Integration Endpoints** (for testing):
- Authorization: `https://fcp.integ01.dev-franceconnect.fr/api/v1/authorize`
- Token: `https://fcp.integ01.dev-franceconnect.fr/api/v1/token`
- UserInfo: `https://fcp.integ01.dev-franceconnect.fr/api/v1/userinfo`
- Logout: `https://fcp.integ01.dev-franceconnect.fr/api/v1/logout`

### Identity Pivot Data Available

| Scope | Data | Format | Example |
|-------|------|--------|---------|
| `openid` (required) | Technical user ID (sub) | string (max 255 chars) | `YWxhY3JpdMOp` |
| `given_name` | First names (all) | string | `Jean Pierre` |
| `family_name` | Birth name | string | `DUPONT` |
| `preferred_username` | Married name (if available) | string | `MARTIN` |
| `birthdate` | Date of birth | YYYY-MM-DD | `1975-06-15` |
| `gender` | Gender | `male` or `female` | `male` |
| `birthplace` | INSEE code of birth city | 5 digits | `75115` |
| `birthcountry` | INSEE code of birth country | 5 digits | `99100` (France) |
| `email` | Email address | RFC 5322 | `jean.dupont@email.com` |

**Scope aliases**:
- `profile` = `given_name` + `family_name` + `birthdate` + `gender` + `preferred_username` (if available)
- `birth` = `birthplace` + `birthcountry`
- `identite_pivot` = `profile` + `birth` (complete identity pivot)

### Authentication Flow

```
┌─────────────┐                ┌──────────────┐               ┌─────────────┐
│   Patient   │                │CapMobilité FS│               │FranceConnect│
└──────┬──────┘                └──────┬───────┘               └──────┬──────┘
       │                              │                              │
       │ 1. Click "Connect with FC"   │                              │
       ├─────────────────────────────>│                              │
       │                              │                              │
       │        2. Redirect 302       │                              │
       │<─────────────────────────────┤                              │
       │   /api/v1/authorize          │                              │
       │   + client_id                │                              │
       │   + redirect_uri             │                              │
       │   + scope                    │                              │
       │   + state                    │                              │
       │   + nonce                    │                              │
       │                              │                              │
       │                              │ 3. Show FC login page        │
       ├──────────────────────────────┼─────────────────────────────>│
       │                              │                              │
       │ 4. User authenticates        │                              │
       │    (chooses IdP: Impots,     │                              │
       │     Ameli, La Poste, etc.)   │                              │
       │<─────────────────────────────┼──────────────────────────────┤
       │                              │                              │
       │ 5. Redirect 302 to callback  │                              │
       │    with authorization code   │                              │
       ├─────────────────────────────>│                              │
       │                              │                              │
       │                              │ 6. Exchange code for tokens  │
       │                              ├─────────────────────────────>│
       │                              │ POST /api/v1/token           │
       │                              │ + code                       │
       │                              │ + client_id                  │
       │                              │ + client_secret              │
       │                              │                              │
       │                              │ 7. Return access_token       │
       │                              │    + id_token                │
       │                              │<─────────────────────────────┤
       │                              │                              │
       │                              │ 8. Get user info             │
       │                              ├─────────────────────────────>│
       │                              │ GET /api/v1/userinfo         │
       │                              │ Authorization: Bearer <token>│
       │                              │                              │
       │                              │ 9. Return identity pivot     │
       │                              │<─────────────────────────────┤
       │                              │                              │
       │ 10. Redirect to dashboard    │                              │
       │     (user authenticated)     │                              │
       │<─────────────────────────────┤                              │
       │                              │                              │
```

### Backend Implementation Plan

#### 1. Database Schema Changes

**New Table: `france_connect_accounts`**
```prisma
model FranceConnectAccount {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // FranceConnect unique identifier (stable per user per service)
  sub           String   @unique
  
  // Identity Pivot Data
  givenName     String   // Prénoms
  familyName    String   // Nom de naissance
  preferredUsername String? // Nom d'usage
  birthdate     DateTime
  gender        Gender
  birthplace    String?  // Code INSEE lieu de naissance
  birthcountry  String   // Code INSEE pays de naissance
  email         String?
  
  // Metadata
  idpIdentity   String   // Which IdP was used (DGFIP, CNAM, etc.)
  lastLoginAt   DateTime @updatedAt
  createdAt     DateTime @default(now())
  
  @@map("france_connect_accounts")
}
```

**Update `User` model**:
```prisma
model User {
  // ... existing fields
  franceConnectAccount FranceConnectAccount?
  isVerifiedByFC       Boolean @default(false)
}
```

#### 2. Environment Variables

Add to `.env`:
```bash
# FranceConnect Configuration
FRANCECONNECT_ENABLED=true
FRANCECONNECT_CLIENT_ID=your_client_id_here
FRANCECONNECT_CLIENT_SECRET=your_client_secret_here
FRANCECONNECT_CALLBACK_URL=http://localhost:3001/api/auth/franceconnect/callback
FRANCECONNECT_LOGOUT_CALLBACK_URL=http://localhost:3001/api/auth/franceconnect/logout-callback

# Use integration environment for testing
FRANCECONNECT_ENVIRONMENT=integration # or "production"

# Integration URLs
FRANCECONNECT_INTEG_AUTHORIZE_URL=https://fcp.integ01.dev-franceconnect.fr/api/v1/authorize
FRANCECONNECT_INTEG_TOKEN_URL=https://fcp.integ01.dev-franceconnect.fr/api/v1/token
FRANCECONNECT_INTEG_USERINFO_URL=https://fcp.integ01.dev-franceconnect.fr/api/v1/userinfo
FRANCECONNECT_INTEG_LOGOUT_URL=https://fcp.integ01.dev-franceconnect.fr/api/v1/logout

# Production URLs
FRANCECONNECT_PROD_AUTHORIZE_URL=https://app.franceconnect.gouv.fr/api/v1/authorize
FRANCECONNECT_PROD_TOKEN_URL=https://app.franceconnect.gouv.fr/api/v1/token
FRANCECONNECT_PROD_USERINFO_URL=https://app.franceconnect.gouv.fr/api/v1/userinfo
FRANCECONNECT_PROD_LOGOUT_URL=https://app.franceconnect.gouv.fr/api/v1/logout
```

#### 3. Backend Module Structure

**New Module: `backend/src/modules/france-connect/`**

```
france-connect/
├── france-connect.module.ts
├── france-connect.controller.ts
├── france-connect.service.ts
├── france-connect.strategy.ts (Passport strategy)
├── dto/
│   ├── franceconnect-callback.dto.ts
│   ├── franceconnect-user-info.dto.ts
│   └── index.ts
├── interfaces/
│   ├── franceconnect-config.interface.ts
│   ├── franceconnect-tokens.interface.ts
│   └── index.ts
└── index.ts
```

**Key Files**:

`france-connect.service.ts`:
```typescript
@Injectable()
export class FranceConnectService {
  private readonly baseUrl: string;
  
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {
    const env = this.configService.get('FRANCECONNECT_ENVIRONMENT');
    this.baseUrl = env === 'production' 
      ? this.configService.get('FRANCECONNECT_PROD_AUTHORIZE_URL')
      : this.configService.get('FRANCECONNECT_INTEG_AUTHORIZE_URL');
  }

  // Generate authorization URL with state and nonce
  getAuthorizationUrl(state: string, nonce: string): string;
  
  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<FranceConnectTokens>;
  
  // Get user info from FranceConnect
  async getUserInfo(accessToken: string): Promise<FranceConnectUserInfo>;
  
  // Verify ID token signature
  async verifyIdToken(idToken: string): Promise<boolean>;
  
  // Find or create user from FranceConnect data
  async findOrCreateUser(fcUserInfo: FranceConnectUserInfo): Promise<User>;
  
  // Link existing user to FranceConnect account
  async linkExistingUser(userId: string, fcUserInfo: FranceConnectUserInfo): Promise<void>;
  
  // Generate logout URL
  getLogoutUrl(idTokenHint: string, state: string): string;
}
```

`france-connect.controller.ts`:
```typescript
@Controller('auth/franceconnect')
export class FranceConnectController {
  @Get('login')
  @Public()
  async login(@Res() res: Response): Promise<void> {
    // Generate state and nonce, store in session/Redis
    // Redirect to FranceConnect authorization endpoint
  }

  @Get('callback')
  @Public()
  async callback(
    @Query() query: FranceConnectCallbackDto,
    @Res() res: Response,
  ): Promise<void> {
    // 1. Verify state parameter
    // 2. Exchange code for tokens
    // 3. Verify ID token
    // 4. Get user info
    // 5. Find or create user
    // 6. Generate JWT token for CapMobilité session
    // 7. Redirect to frontend dashboard
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    // 1. Get stored id_token_hint from user session
    // 2. Generate logout URL
    // 3. Redirect to FranceConnect logout
  }

  @Get('logout-callback')
  @Public()
  async logoutCallback(@Res() res: Response): Promise<void> {
    // Redirect to frontend home page
  }
}
```

#### 4. Security Considerations

**State Parameter**:
- Generate cryptographically secure random string
- Store in Redis with short TTL (5 minutes)
- Verify on callback to prevent CSRF

**Nonce Parameter**:
- Generate cryptographically secure random string
- Store in session/Redis
- Verify in ID token to prevent replay attacks

**ID Token Verification**:
- Verify signature using FranceConnect's public keys (JWKS)
- Verify `aud` claim matches client_id
- Verify `iss` claim matches FranceConnect issuer
- Verify `exp` claim (not expired)
- Verify `nonce` matches stored value

**Data Storage**:
- Store identity pivot data in HDS-certified database
- Hash/encrypt sensitive fields if needed
- Comply with RGPD (user consent, right to deletion)

### Frontend Implementation Plan

#### 1. New Components

**`frontend/src/components/auth/FranceConnectButton.tsx`**
```typescript
import { Button } from '@/components/ui/button';

export function FranceConnectButton() {
  const handleLogin = () => {
    // Redirect to backend FranceConnect login endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/franceconnect/login`;
  };

  return (
    <Button
      onClick={handleLogin}
      className="w-full bg-[#0053b3] hover:bg-[#003d82]"
    >
      <img 
        src="/images/franceconnect-logo.svg" 
        alt="FranceConnect"
        className="h-8 w-auto"
      />
    </Button>
  );
}
```

#### 2. Updated Login Page

**`frontend/src/app/[locale]/connexion/page.tsx`**

Add FranceConnect button above or below existing email/password form:

```typescript
<div className="space-y-4">
  {/* FranceConnect Button */}
  <FranceConnectButton />
  
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-white px-2 text-muted-foreground">
        {t('auth.login.orContinueWith')}
      </span>
    </div>
  </div>
  
  {/* Existing email/password form */}
  <LoginForm />
</div>
```

#### 3. Callback Handling

**`frontend/src/app/[locale]/auth/franceconnect/callback/page.tsx`**

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function FranceConnectCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      router.push(`/connexion?error=${error}`);
      return;
    }

    if (token) {
      // Store JWT token
      localStorage.setItem('token', token);
      // Redirect to dashboard
      router.push('/dashboard');
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">
          Connexion avec FranceConnect en cours...
        </p>
      </div>
    </div>
  );
}
```

#### 4. Assets

Download official FranceConnect button pack:
- URL: `https://partenaires.franceconnect.gouv.fr/files/fc_boutons.zip`
- Extract SVG buttons to `frontend/public/images/`
- Use official button designs (required by FranceConnect branding guidelines)

#### 5. Translation Updates

**`frontend/src/messages/fr.json`**
```json
{
  "auth": {
    "login": {
      "franceConnect": "Se connecter avec FranceConnect",
      "orContinueWith": "Ou continuer avec",
      "franceConnectDescription": "Utilisez votre compte Impots.gouv.fr, Ameli.fr ou La Poste pour vous connecter en toute sécurité."
    }
  }
}
```

**`frontend/src/messages/en.json`**
```json
{
  "auth": {
    "login": {
      "franceConnect": "Sign in with FranceConnect",
      "orContinueWith": "Or continue with",
      "franceConnectDescription": "Use your Impots.gouv.fr, Ameli.fr or La Poste account to sign in securely."
    }
  }
}
```

### Testing Plan

#### 1. Integration Environment

**Demo Credentials** (provided by FranceConnect):
- CLIENT_ID: `211286433e39cce01db448d80181bdfd005554b19cd51b3fe7943f6b3b86ab6e`
- CLIENT_SECRET: `2791a731e6a59f56b6b4dd0d08c9b1f593b5f3658b9fd731cb24248e2669af4b`
- Callback URLs: `http://localhost:3000/callback`, `http://localhost:3001/api/auth/franceconnect/callback`

**Test Identity Provider**:
- Use "Démonstration" provider in integration environment
- Test identities: https://github.com/france-connect/identity-provider-example/blob/master/database.csv

#### 2. Test Scenarios

**Scenario 1: New User Registration via FranceConnect**
- User clicks "Connect with FranceConnect" on registration page
- User selects IdP (e.g., "Démonstration")
- User authenticates with test credentials
- System creates new User + FranceConnectAccount
- User is redirected to onboarding flow

**Scenario 2: Existing User Login via FranceConnect**
- User with existing FC account clicks "Connect with FranceConnect"
- User authenticates
- System matches by `sub` and logs user in
- User is redirected to dashboard

**Scenario 3: Link Existing Account**
- User with email/password account wants to add FranceConnect
- User goes to profile settings
- User clicks "Link FranceConnect"
- After authentication, system links FC account to existing user

**Scenario 4: Logout Flow**
- User clicks logout button
- System redirects to FranceConnect logout
- User confirms logout from FC
- User is redirected back to home page

**Scenario 5: Error Handling**
- Test invalid state parameter (CSRF protection)
- Test expired authorization code
- Test network errors
- Test user canceling authentication

#### 3. E2E Tests

```typescript
// backend/test/e2e/france-connect.e2e-spec.ts
describe('FranceConnect Integration (e2e)', () => {
  it('should redirect to FranceConnect authorization', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/franceconnect/login')
      .expect(302);
    
    expect(response.header.location).toContain('dev-franceconnect.fr');
  });

  it('should exchange code for tokens', async () => {
    // Mock FranceConnect token endpoint
    // Test callback with valid code
  });

  it('should create user from FranceConnect data', async () => {
    // Mock complete flow
    // Verify user creation with identity pivot data
  });
});
```

### Deployment Checklist

#### Pre-Production

- [ ] Request FranceConnect habilitation at https://franceconnect.gouv.fr/partenaires
- [ ] Complete DataPass form: https://datapass.api.gouv.fr/demandes/france-connect/nouveau
- [ ] Provide production callback URLs
- [ ] Receive production CLIENT_ID and CLIENT_SECRET
- [ ] Update environment variables for production
- [ ] Test on integration environment
- [ ] Complete functional testing scenarios
- [ ] Submit qualification request: https://www.demarches-simplifiees.fr/commencer/demande-qualification-fs

#### Production Launch

- [ ] Switch FRANCECONNECT_ENVIRONMENT to "production"
- [ ] Verify HDS hosting compliance
- [ ] Update RGPD documentation (mention FranceConnect data processing)
- [ ] Add FranceConnect mention in privacy policy
- [ ] Monitor error logs for FC-specific errors (E000000-E050002)
- [ ] Set up alerts for FC service downtime

### Regulatory Compliance

#### RGPD Compliance

**Data Processing**:
- Identity pivot data = personal data + health context = special category
- Requires explicit consent
- Must be stored in HDS-certified infrastructure
- Right to access, rectification, deletion must be implemented

**Privacy Policy Updates**:
```markdown
### Utilisation de FranceConnect

CapMobilité utilise FranceConnect pour simplifier votre connexion et vérifier votre identité.

**Données collectées via FranceConnect** :
- Nom de naissance
- Prénoms
- Date de naissance
- Sexe
- Lieu de naissance
- Email (si disponible)

**Base légale** : Consentement explicite + Exécution du contrat

**Conservation** : Durée de votre compte + 3 ans (obligations légales)

**Droits** : Accès, rectification, suppression, portabilité
Contact : dpo@capmobilite.fr
```

#### HDS Compliance

FranceConnect identity data combined with medical prescriptions = health data storage requirements:

- Database must be on HDS-certified infrastructure
- Encryption at rest and in transit
- Access logging and audit trails
- Regular security audits

### Success Metrics

**Implementation Timeline**:
- Week 1: Backend module + database schema
- Week 2: Frontend integration + testing
- Week 3: Integration environment testing
- Week 4: Habilitation request + qualification
- Week 5-8: Production deployment (after approval)

**KPIs**:
- % of new users registering via FranceConnect
- Reduction in identity verification time
- User satisfaction with authentication process
- Error rate for FC flows

### Support and Resources

**Official Documentation**:
- Main docs: https://partenaires.franceconnect.gouv.fr/documentation
- API reference: https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service
- Error codes: Search "Système de codes d'erreurs" in docs

**Support Contact**:
- Email: support.partenaires@franceconnect.gouv.fr
- Forum: https://forum.societenumerique.gouv.fr/c/franceconnect/

**Code Examples**:
- Service Provider Example: https://github.com/france-connect/service-provider-example
- Demo FS: https://fournisseur-de-service.dev-franceconnect.fr

---

Go to http://localhost:3000/connexion first, login with the patient credentials, then you'll be redirected to the dashboard.

Invalid email or password
Email
admin@capmobilite.fr
Password
••••••••


