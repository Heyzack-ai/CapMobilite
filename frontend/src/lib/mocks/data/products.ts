import type { Product, ProductFamily, Quote, Claim, Document } from "@/types";

export const mockProductFamilies: ProductFamily[] = [
  {
    id: "family-1",
    name: "Fauteuils manuels",
    slug: "manual",
    description: "Fauteuils roulants manuels légers et pliables",
    imageUrl: "/images/wheelchair-manual.png",
  },
  {
    id: "family-2",
    name: "Fauteuils électriques",
    slug: "electric",
    description: "Fauteuils roulants électriques pour une mobilité maximale",
    imageUrl: "/images/wheelchair-electric.png",
  },
  {
    id: "family-3",
    name: "Fauteuils tout-terrain",
    slug: "terrain",
    description: "Fauteuils adaptés aux terrains variés",
    imageUrl: "/images/wheelchair-terrain.png",
  },
];

export const mockProducts: Product[] = [
  {
    id: "product-1",
    name: "FreedomLite X1",
    description: "Fauteuil manuel ultra-léger en aluminium, idéal pour un usage quotidien",
    familyId: "family-1",
    lpprCodes: ["4011001", "4011002"],
    basePrice: 1200,
    specifications: {
      weight: "9.5 kg",
      maxCapacity: "125 kg",
      foldable: "Oui",
      seatWidth: "40-50 cm",
    },
    imageUrl: "/images/wheelchair-manual.png",
    isActive: true,
  },
  {
    id: "product-2",
    name: "ElectroDrive Pro",
    description: "Fauteuil électrique performant avec grande autonomie",
    familyId: "family-2",
    lpprCodes: ["4012001", "4012002"],
    basePrice: 4500,
    specifications: {
      weight: "45 kg",
      maxCapacity: "150 kg",
      range: "40 km",
      maxSpeed: "10 km/h",
      batteryType: "Lithium-ion",
    },
    imageUrl: "/images/wheelchair-electric.png",
    isActive: true,
  },
  {
    id: "product-3",
    name: "TerrainMaster 4x4",
    description: "Fauteuil tout-terrain pour une mobilité sans limites",
    familyId: "family-3",
    lpprCodes: ["4013001"],
    basePrice: 6800,
    specifications: {
      weight: "55 kg",
      maxCapacity: "120 kg",
      range: "30 km",
      wheelType: "Pneumatique renforcé",
      suspension: "Indépendante 4 roues",
    },
    imageUrl: "/images/wheelchair-terrain.png",
    isActive: true,
  },
];

export const mockQuotes: Quote[] = [
  {
    id: "quote-1",
    caseId: "case-1",
    version: 1,
    status: "SENT",
    items: [
      {
        id: "item-1",
        productId: "product-2",
        lpprCode: "4012001",
        description: "ElectroDrive Pro - Fauteuil électrique",
        quantity: 1,
        unitPrice: 4500,
        lpprAmount: 3850,
        patientAmount: 650,
      },
      {
        id: "item-2",
        productId: "product-2",
        lpprCode: "4012002",
        description: "Batterie supplémentaire lithium-ion",
        quantity: 1,
        unitPrice: 450,
        lpprAmount: 350,
        patientAmount: 100,
      },
    ],
    totalLPPR: 4200,
    totalPatient: 750,
    validUntil: "2024-03-20T23:59:59Z",
    createdAt: "2024-01-20T14:00:00Z",
  },
  {
    id: "quote-2",
    caseId: "case-2",
    version: 1,
    status: "APPROVED",
    items: [
      {
        id: "item-3",
        productId: "product-2",
        lpprCode: "4012001",
        description: "ElectroDrive Pro - Fauteuil électrique",
        quantity: 1,
        unitPrice: 4500,
        lpprAmount: 3850,
        patientAmount: 650,
      },
    ],
    totalLPPR: 3850,
    totalPatient: 650,
    validUntil: "2023-12-01T23:59:59Z",
    approvedAt: "2023-11-05T14:00:00Z",
    createdAt: "2023-11-03T10:00:00Z",
  },
];

export const mockClaims: Claim[] = [
  {
    id: "claim-1",
    caseId: "case-2",
    claimNumber: "CPAM-2023-98765",
    status: "PAID",
    submittedAt: "2023-11-10T09:00:00Z",
    responseAt: "2023-11-25T14:00:00Z",
    amountClaimed: 3850,
    amountApproved: 3850,
  },
];

export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    type: "PRESCRIPTION",
    filename: "ordonnance_jean_dupont.pdf",
    mimeType: "application/pdf",
    size: 245000,
    uploadedById: "user-1",
    caseId: "case-1",
    scanStatus: "CLEAN",
    storageKey: "documents/case-1/prescription.pdf",
    createdAt: "2024-01-16T10:00:00Z",
  },
  {
    id: "doc-2",
    type: "PRESCRIPTION",
    filename: "ordonnance_ancien.pdf",
    mimeType: "application/pdf",
    size: 198000,
    uploadedById: "user-1",
    caseId: "case-2",
    scanStatus: "CLEAN",
    storageKey: "documents/case-2/prescription.pdf",
    createdAt: "2023-11-01T10:00:00Z",
  },
  {
    id: "doc-3",
    type: "ID_CARD",
    filename: "carte_identite.jpg",
    mimeType: "image/jpeg",
    size: 1200000,
    uploadedById: "user-1",
    caseId: "case-1",
    scanStatus: "CLEAN",
    storageKey: "documents/case-1/id_card.jpg",
    createdAt: "2024-01-16T10:05:00Z",
  },
  {
    id: "doc-4",
    type: "CARTE_VITALE",
    filename: "carte_vitale.jpg",
    mimeType: "image/jpeg",
    size: 950000,
    uploadedById: "user-1",
    caseId: "case-1",
    scanStatus: "CLEAN",
    storageKey: "documents/case-1/carte_vitale.jpg",
    createdAt: "2024-01-16T10:10:00Z",
  },
];

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id);
}

export function getProductsByFamily(familyId: string): Product[] {
  return mockProducts.filter((p) => p.familyId === familyId);
}

export function getQuoteByCaseId(caseId: string): Quote | undefined {
  return mockQuotes.find((q) => q.caseId === caseId);
}

export function getClaimByCaseId(caseId: string): Claim | undefined {
  return mockClaims.find((c) => c.caseId === caseId);
}

export function getDocumentsByCaseId(caseId: string): Document[] {
  return mockDocuments.filter((d) => d.caseId === caseId);
}
