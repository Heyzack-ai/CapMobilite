import { http, HttpResponse } from "msw";
import { mockUsers, mockPatients, validateCredentials, findPatientById } from "./data/users";
import { mockCases, getCasesByPatientId, getCaseById, getAllCases } from "./data/cases";
import { mockDevices, mockTickets, getDevicesByPatientId, getTicketsByPatientId, getTicketsByDeviceId } from "./data/devices";
import { mockProducts, mockProductFamilies, mockQuotes, mockClaims, mockDocuments, getQuoteByCaseId, getDocumentsByCaseId } from "./data/products";

export const handlers = [
  // ============ AUTH ENDPOINTS ============
  http.post("/api/auth/login", async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    const user = validateCredentials(body.email, body.password);

    if (!user) {
      return HttpResponse.json(
        { code: "INVALID_CREDENTIALS", message: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // If patient, return patient data
    const patient = findPatientById(user.id);

    return HttpResponse.json({
      user: patient || user,
      tokens: {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        expiresIn: 3600,
      },
    });
  }),

  http.post("/api/auth/register", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    // Simulate registration - in real app would create user
    const newUser = {
      id: `user-${Date.now()}`,
      email: body.email as string,
      phone: body.phone as string,
      firstName: body.firstName as string,
      lastName: body.lastName as string,
      role: "PATIENT" as const,
      emailVerified: false,
      phoneVerified: false,
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ user: newUser });
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ success: true });
  }),

  http.post("/api/auth/refresh", () => {
    return HttpResponse.json({
      tokens: {
        accessToken: "new-mock-access-token",
        refreshToken: "new-mock-refresh-token",
        expiresIn: 3600,
      },
    });
  }),

  // ============ USER/PROFILE ENDPOINTS ============
  http.get("/api/me/profile", () => {
    // Return the first patient as logged in user for demo
    const patient = mockPatients[0];
    return HttpResponse.json({ user: patient });
  }),

  http.patch("/api/me/profile", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const patient = { ...mockPatients[0], ...body };
    return HttpResponse.json({ user: patient });
  }),

  // ============ CASES ENDPOINTS ============
  http.get("/api/cases", ({ request }) => {
    const url = new URL(request.url);
    const patientId = url.searchParams.get("patientId");

    const cases = patientId ? getCasesByPatientId(patientId) : getAllCases();

    return HttpResponse.json({
      data: cases,
      hasMore: false,
      total: cases.length,
    });
  }),

  http.get("/api/cases/:id", ({ params }) => {
    const caseData = getCaseById(params.id as string);

    if (!caseData) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "Dossier non trouvé" },
        { status: 404 }
      );
    }

    // Enrich with quote and documents
    const quote = getQuoteByCaseId(caseData.id);
    const documents = getDocumentsByCaseId(caseData.id);

    return HttpResponse.json({
      data: {
        ...caseData,
        quote,
        documents,
      },
    });
  }),

  http.post("/api/cases", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    const newCase = {
      id: `case-${Date.now()}`,
      caseNumber: `CAP-2024-${String(Date.now()).slice(-4)}`,
      patientId: body.patientId as string,
      status: "INTAKE_RECEIVED" as const,
      priority: "NORMAL" as const,
      checklist: [
        { key: "prescription", label: "Ordonnance médicale", required: true },
        { key: "id_card", label: "Carte d'identité", required: true },
        { key: "carte_vitale", label: "Carte Vitale", required: true },
        { key: "quote_approved", label: "Devis approuvé", required: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ data: newCase }, { status: 201 });
  }),

  // ============ DEVICES ENDPOINTS ============
  http.get("/api/devices", ({ request }) => {
    const url = new URL(request.url);
    const patientId = url.searchParams.get("patientId");

    const devices = patientId ? getDevicesByPatientId(patientId) : mockDevices;

    return HttpResponse.json({
      data: devices,
      hasMore: false,
      total: devices.length,
    });
  }),

  http.get("/api/devices/:id", ({ params }) => {
    const device = mockDevices.find((d) => d.id === params.id);

    if (!device) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "Équipement non trouvé" },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: device });
  }),

  // ============ TICKETS ENDPOINTS ============
  http.get("/api/tickets", ({ request }) => {
    const url = new URL(request.url);
    const patientId = url.searchParams.get("patientId");
    const deviceId = url.searchParams.get("deviceId");

    let tickets = mockTickets;
    if (patientId) tickets = getTicketsByPatientId(patientId);
    if (deviceId) tickets = getTicketsByDeviceId(deviceId);

    return HttpResponse.json({
      data: tickets,
      hasMore: false,
      total: tickets.length,
    });
  }),

  http.get("/api/tickets/:id", ({ params }) => {
    const ticket = mockTickets.find((t) => t.id === params.id);

    if (!ticket) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "Ticket non trouvé" },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: ticket });
  }),

  http.post("/api/tickets", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    const newTicket = {
      id: `ticket-${Date.now()}`,
      deviceId: body.deviceId as string,
      patientId: body.patientId as string,
      category: body.category as string,
      severity: body.severity as string,
      description: body.description as string,
      isSafetyIssue: body.isSafetyIssue as boolean || false,
      status: "OPEN" as const,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json({ data: newTicket }, { status: 201 });
  }),

  // ============ PRODUCTS ENDPOINTS ============
  http.get("/api/products", () => {
    return HttpResponse.json({
      data: mockProducts,
      hasMore: false,
      total: mockProducts.length,
    });
  }),

  http.get("/api/products/families", () => {
    return HttpResponse.json({
      data: mockProductFamilies,
    });
  }),

  http.get("/api/products/:id", ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.id);

    if (!product) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "Produit non trouvé" },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: product });
  }),

  // ============ QUOTES ENDPOINTS ============
  http.get("/api/quotes/:id", ({ params }) => {
    const quote = mockQuotes.find((q) => q.id === params.id);

    if (!quote) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "Devis non trouvé" },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: quote });
  }),

  http.post("/api/quotes/:id/approve", ({ params }) => {
    const quote = mockQuotes.find((q) => q.id === params.id);

    if (!quote) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "Devis non trouvé" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: {
        ...quote,
        status: "APPROVED",
        approvedAt: new Date().toISOString(),
      },
    });
  }),

  // ============ CLAIMS ENDPOINTS ============
  http.get("/api/claims", () => {
    return HttpResponse.json({
      data: mockClaims,
      hasMore: false,
      total: mockClaims.length,
    });
  }),

  http.get("/api/claims/:id", ({ params }) => {
    const claim = mockClaims.find((c) => c.id === params.id);

    if (!claim) {
      return HttpResponse.json(
        { code: "NOT_FOUND", message: "Demande non trouvée" },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: claim });
  }),

  // ============ DOCUMENTS ENDPOINTS ============
  http.get("/api/documents", ({ request }) => {
    const url = new URL(request.url);
    const caseId = url.searchParams.get("caseId");

    const documents = caseId ? getDocumentsByCaseId(caseId) : mockDocuments;

    return HttpResponse.json({
      data: documents,
      hasMore: false,
      total: documents.length,
    });
  }),

  http.post("/api/documents/upload-url", async ({ request }) => {
    const body = await request.json() as { filename: string; mimeType: string };

    return HttpResponse.json({
      uploadUrl: "https://mock-storage.example.com/upload",
      documentId: `doc-${Date.now()}`,
      storageKey: `documents/${body.filename}`,
    });
  }),

  // ============ ADMIN STATS ENDPOINTS ============
  http.get("/api/admin/stats", () => {
    return HttpResponse.json({
      data: {
        casesTotal: mockCases.length,
        casesByStatus: {
          INTAKE_RECEIVED: 1,
          DOCUMENTS_PENDING: 1,
          QUOTE_READY: 1,
          DELIVERED: 1,
        },
        ticketsOpen: mockTickets.filter((t) => t.status !== "RESOLVED" && t.status !== "CLOSED").length,
        claimsPending: mockClaims.filter((c) => c.status === "SUBMITTED" || c.status === "PENDING_RESPONSE").length,
        revenueThisMonth: 8750,
        slaViolations: 0,
      },
    });
  }),

  // ============ PRESCRIBER ENDPOINTS ============
  http.get("/api/prescriber/validate/:token", ({ params }) => {
    // Mock token validation
    if (params.token === "invalid") {
      return HttpResponse.json(
        { code: "INVALID_TOKEN", message: "Token invalide ou expiré" },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      data: {
        patientName: "Jean D.",
        caseNumber: "CAP-2024-0001",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }),

  http.post("/api/prescriber/upload/:token", async () => {
    return HttpResponse.json({
      data: {
        referenceNumber: `REF-${Date.now()}`,
        message: "Documents reçus avec succès",
      },
    });
  }),
];
