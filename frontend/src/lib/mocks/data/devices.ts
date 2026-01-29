import type { Device, ServiceTicket, TicketCategory, TicketSeverity, TicketStatus } from "@/types";

export const mockDevices: Device[] = [
  {
    id: "device-1",
    patientId: "user-1",
    productId: "product-2",
    serialNumber: "FRE-2023-12345",
    deliveredAt: "2023-12-15T10:00:00Z",
    warrantyExpiresAt: "2025-12-15T10:00:00Z",
    maintenanceContractId: "contract-1",
    status: "ACTIVE",
  },
  {
    id: "device-2",
    patientId: "patient-2",
    productId: "product-1",
    serialNumber: "FRM-2024-00123",
    deliveredAt: "2024-01-20T14:00:00Z",
    warrantyExpiresAt: "2026-01-20T14:00:00Z",
    maintenanceContractId: "contract-2",
    status: "ACTIVE",
  },
];

export const mockTickets: ServiceTicket[] = [
  {
    id: "ticket-1",
    deviceId: "device-1",
    patientId: "user-1",
    category: "BATTERY",
    severity: "MEDIUM",
    description: "La batterie ne tient plus que 2 heures au lieu de 8 heures initialement. Le fauteuil s'éteint de manière inattendue.",
    isSafetyIssue: false,
    status: "SCHEDULED",
    assignedToId: "tech-1",
    scheduledVisit: {
      date: "2024-02-15",
      timeSlot: "09:00-12:00",
      technicianId: "tech-1",
      technicianName: "Lucas Moreau",
    },
    createdAt: "2024-02-01T10:00:00Z",
  },
  {
    id: "ticket-2",
    deviceId: "device-1",
    patientId: "user-1",
    category: "WHEELS",
    severity: "LOW",
    description: "Bruit léger provenant de la roue arrière gauche lors des déplacements.",
    isSafetyIssue: false,
    status: "RESOLVED",
    assignedToId: "tech-1",
    resolvedAt: "2023-12-20T16:00:00Z",
    resolutionNotes: "Roulement remplacé, fonctionnement normal rétabli.",
    createdAt: "2023-12-18T09:00:00Z",
  },
  {
    id: "ticket-3",
    deviceId: "device-2",
    patientId: "patient-2",
    category: "BRAKE",
    severity: "CRITICAL",
    description: "Le frein de parking ne se bloque plus correctement. Le fauteuil glisse sur les pentes.",
    isSafetyIssue: true,
    status: "IN_PROGRESS",
    assignedToId: "tech-2",
    createdAt: "2024-02-10T08:00:00Z",
  },
];

export const ticketCategoryLabels: Record<TicketCategory, string> = {
  BATTERY: "Batterie",
  WHEELS: "Roues",
  JOYSTICK: "Joystick",
  BRAKE: "Freins",
  CUSHION: "Coussin",
  FRAME: "Châssis",
  ELECTRICAL: "Électrique",
  OTHER: "Autre",
};

export const ticketSeverityLabels: Record<TicketSeverity, string> = {
  LOW: "Faible",
  MEDIUM: "Moyen",
  HIGH: "Élevé",
  CRITICAL: "Critique",
};

export const ticketStatusLabels: Record<TicketStatus, string> = {
  OPEN: "Ouvert",
  ASSIGNED: "Assigné",
  SCHEDULED: "Planifié",
  IN_PROGRESS: "En cours",
  PARTS_ORDERED: "Pièces commandées",
  RESOLVED: "Résolu",
  CLOSED: "Clôturé",
};

export function getDevicesByPatientId(patientId: string): Device[] {
  return mockDevices.filter((d) => d.patientId === patientId);
}

export function getDeviceById(id: string): Device | undefined {
  return mockDevices.find((d) => d.id === id);
}

export function getTicketsByPatientId(patientId: string): ServiceTicket[] {
  return mockTickets.filter((t) => t.patientId === patientId);
}

export function getTicketsByDeviceId(deviceId: string): ServiceTicket[] {
  return mockTickets.filter((t) => t.deviceId === deviceId);
}

export function getTicketById(id: string): ServiceTicket | undefined {
  return mockTickets.find((t) => t.id === id);
}

export function getAllTickets(): ServiceTicket[] {
  return mockTickets;
}
