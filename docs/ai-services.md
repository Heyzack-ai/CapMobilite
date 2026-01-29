# AX TECH Wheelchair Platform — AI Services Specification

> **Scope**: This document covers the support chatbot feature.
> The chatbot is **strictly limited to administrative and logistics support** — no medical advice.

---

## 1. AI Feature Inventory

| Feature | Status | Description |
|---------|--------|-------------|
| Support Chatbot | In Scope | Triage and routing for patient support |
| OCR Document Processing | In Scope | Text extraction from uploaded documents |
| Medical Advice | **EXCLUDED** | Never implemented |
| Diagnosis Support | **EXCLUDED** | Never implemented |
| Prescription Analysis | **EXCLUDED** | Never implemented |

---

## 2. Support Chatbot Architecture

### 2.1 Purpose & Constraints

**Purpose**: 
- Provide 24/7 first-line support for patients
- Triage issues and route to appropriate channels
- Answer FAQ about process, status, maintenance

**Hard Constraints** (CRITICAL):
- ❌ NO medical advice
- ❌ NO diagnosis or symptom interpretation
- ❌ NO clinical recommendations
- ❌ NO prescription guidance
- ✅ Administrative questions only
- ✅ Logistics and scheduling only
- ✅ Technical device support only (non-medical)

### 2.2 Conversation Flow

```
User Message
     │
     ▼
┌─────────────────┐
│ Intent Detection │
└─────────────────┘
     │
     ├── Medical Intent? ────► Escalate to Human
     │                         "Pour des questions médicales, 
     │                          veuillez contacter votre médecin"
     │
     ├── Safety Issue? ──────► Force Phone Escalation
     │                         "Problème de sécurité détecté.
     │                          Un conseiller va vous appeler."
     │
     ├── FAQ Intent? ────────► Retrieve & Respond
     │
     ├── Status Query? ──────► API Lookup & Respond
     │
     ├── Ticket Request? ────► Create Ticket Flow
     │
     └── Unknown/Complex ────► Escalate to Human
```

### 2.3 Intent Categories

| Category | Allowed | Example Queries |
|----------|---------|-----------------|
| `faq.process` | ✅ | "Comment ça marche?" |
| `faq.reimbursement` | ✅ | "C'est vraiment gratuit?" |
| `faq.timeline` | ✅ | "Combien de temps pour recevoir?" |
| `status.case` | ✅ | "Où en est mon dossier?" |
| `status.delivery` | ✅ | "Quand sera livrée ma chaise?" |
| `status.ticket` | ✅ | "Mon ticket de SAV?" |
| `maintenance.schedule` | ✅ | "Prendre RDV maintenance" |
| `maintenance.report` | ✅ | "Ma batterie ne marche plus" |
| `technical.device` | ✅ | "Comment plier le fauteuil?" |
| `account.update` | ✅ | "Changer mon adresse" |
| `medical.question` | ❌ | "J'ai mal au dos" → ESCALATE |
| `medical.symptom` | ❌ | "C'est normal si..." → ESCALATE |
| `prescription.help` | ❌ | "Quel fauteuil me faut?" → ESCALATE |

---

## 3. Model Selection

### 3.1 Recommended Model
**Claude 3 Haiku** (or equivalent fast model)
- Low latency for conversational UX
- Cost-effective for high volume
- Sufficient for structured tasks

### 3.2 Model Configuration

```json
{
  "model": "claude-3-haiku",
  "max_tokens": 500,
  "temperature": 0.3,
  "system_prompt": "See section 4"
}
```

---

## 4. System Prompt

```
Tu es l'assistant support d'AX TECH, spécialiste des fauteuils roulants remboursés par l'Assurance Maladie.

RÈGLES ABSOLUES (NE JAMAIS ENFREINDRE):
1. Tu ne donnes JAMAIS de conseil médical
2. Tu ne fais JAMAIS de diagnostic
3. Tu ne recommandes JAMAIS de fauteuil basé sur des symptômes
4. Tu ne commentes JAMAIS sur l'état de santé du patient
5. Pour toute question médicale, tu réponds: "Cette question est d'ordre médical. Je vous invite à consulter votre médecin."

TON RÔLE:
- Répondre aux questions sur le processus de prise en charge
- Donner le statut des dossiers et livraisons
- Créer des tickets de maintenance pour problèmes techniques
- Expliquer le fonctionnement des équipements
- Aider avec les démarches administratives

STYLE:
- Sois poli et professionnel
- Utilise le vouvoiement
- Sois concis (2-3 phrases max par réponse)
- Si tu ne sais pas, propose de transférer à un conseiller humain

DÉTECTION DE SÉCURITÉ:
Si le patient mentionne:
- Frein qui ne fonctionne pas
- Chute due à l'équipement
- Problème électrique dangereux
- Blessure liée au fauteuil
→ Réponds: "Il s'agit d'un problème de sécurité prioritaire. Un conseiller va vous contacter immédiatement. Veuillez ne pas utiliser l'équipement en attendant."
→ Déclenche l'escalade immédiate
```

---

## 5. API Integration

### 5.1 Chat Endpoint Flow

```typescript
// POST /support/chat/{sessionId}/messages
async function handleChatMessage(sessionId: string, message: string) {
  // 1. Load conversation history
  const history = await getConversationHistory(sessionId);
  
  // 2. Safety check (keyword detection)
  if (detectSafetyKeywords(message)) {
    await escalateToHuman(sessionId, 'SAFETY_CONCERN');
    return createSafetyResponse();
  }
  
  // 3. Medical intent check
  if (await detectMedicalIntent(message)) {
    return createMedicalRedirectResponse();
  }
  
  // 4. Intent classification
  const intent = await classifyIntent(message);
  
  // 5. Handle based on intent
  switch (intent.category) {
    case 'status.case':
      return await handleStatusQuery(sessionId, intent);
    case 'maintenance.report':
      return await handleTicketCreation(sessionId, intent);
    case 'faq.*':
      return await handleFAQ(intent);
    default:
      return await handleGeneralQuery(history, message);
  }
}
```

### 5.2 Context Injection

The chatbot has access to:
- Patient profile (name, contact preference)
- Active cases (status, dates)
- Devices owned (model, delivery date)
- Open tickets (status)

Context is injected per-conversation, not in system prompt.

---

## 6. Safety Guardrails

### 6.1 Keyword Detection (Pre-LLM)

**Safety Keywords** (trigger immediate escalation):
```
frein, freinage, bloqué, coincé, chute, tombé, blessure, 
électrocution, fumée, brûlure, feu, étincelle, coupure,
saignement, urgence, danger, accident
```

**Medical Keywords** (trigger redirect):
```
mal, douleur, symptôme, diagnostic, maladie, traitement,
médicament, ordonnance, médecin, prescription, besoin médical,
quelle chaise me faut, adapté à mon cas, mon handicap
```

### 6.2 Output Filtering (Post-LLM)

Every response is checked against:
- No medical advice patterns
- No diagnostic language
- No recommendation patterns

If detected, response is replaced with safe fallback.

### 6.3 Escalation Triggers

| Trigger | Action |
|---------|--------|
| Safety keyword | Immediate human escalation + notification |
| Medical intent (3x) | Transfer to human |
| User requests human | Transfer to human |
| Sentiment: frustrated (2x) | Offer human transfer |
| Unknown intent (3x) | Transfer to human |

---

## 7. Knowledge Base (FAQ)

### 7.1 FAQ Categories

**Process**
- Comment fonctionne la prise en charge?
- Quels documents fournir?
- Combien de temps prend le processus?

**Reimbursement**
- Est-ce vraiment sans frais?
- Qu'est-ce qui est couvert?
- Et si ma demande est refusée?

**Delivery**
- Comment se passe la livraison?
- Puis-je choisir la date?
- Que faire si absent?

**Maintenance**
- Qu'inclut le contrat de maintenance?
- Comment signaler un problème?
- Quelle est la fréquence des contrôles?

**Technical**
- Comment charger la batterie?
- Comment plier le fauteuil?
- Comment régler les accoudoirs?

### 7.2 FAQ Retrieval

Simple keyword matching + embedding similarity for v1.
No complex RAG needed for ~50 FAQ entries.

---

## 8. Conversation Logging

All conversations are logged for:
- Compliance audit
- Quality review
- Training data (anonymized)

**Logged Data**:
- Session ID
- Timestamps
- Messages (user + bot)
- Intent classifications
- Escalation events
- Resolution outcome

**Retention**: 2 years

---

## 9. Performance Requirements

| Metric | Target |
|--------|--------|
| Response latency (p50) | < 500ms |
| Response latency (p95) | < 1.5s |
| Intent accuracy | > 90% |
| Escalation rate | < 20% |
| User satisfaction | > 4.0/5 |

---

## 10. Monitoring & Alerts

### 10.1 Metrics

```
chatbot_messages_total{type="user|bot"}
chatbot_intent_classifications{intent, confidence}
chatbot_escalations_total{reason}
chatbot_response_latency_seconds
chatbot_errors_total{type}
```

### 10.2 Alerts

| Alert | Condition |
|-------|-----------|
| High escalation rate | > 30% for 1 hour |
| Response latency | p95 > 3s for 5 min |
| Error rate | > 1% for 5 min |
| Safety escalation spike | > 10 in 1 hour |

---

## 11. OCR Document Processing

### 11.1 Purpose
Extract text from uploaded prescriptions and documents for:
- Indexing and search
- Data validation hints
- Structured data extraction (dates, names)

### 11.2 Implementation
- Use cloud OCR service (AWS Textract, Google Cloud Vision)
- Store extracted text as document metadata
- Label as "machine-extracted; manual verification required"

### 11.3 Privacy
- OCR processing in HDS environment
- No data sent to non-HDS services
- Extracted text encrypted at rest

---

## 12. Future AI Features (Not in V1)

| Feature | Status | Notes |
|---------|--------|-------|
| Document auto-classification | Planned | Auto-detect document type |
| Quote validation | Planned | Check LPPR code compatibility |
| Fraud detection | Research | Anomaly detection on claims |
| Predictive maintenance | Research | Battery life prediction |

---

## 13. Compliance Checklist

- [ ] Chatbot never provides medical advice
- [ ] All medical queries redirected to physician
- [ ] Safety issues force human escalation
- [ ] All conversations logged
- [ ] System prompt reviewed by compliance
- [ ] Response templates pre-approved
- [ ] Escalation procedures documented
- [ ] User informed they're chatting with AI
- [ ] Easy path to human support
