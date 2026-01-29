import type { User, Patient } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "jean.dupont@email.fr",
    phone: "+33612345678",
    firstName: "Jean",
    lastName: "Dupont",
    role: "PATIENT",
    emailVerified: true,
    phoneVerified: true,
    mfaEnabled: false,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "user-2",
    email: "admin@capmobilite.fr",
    phone: "+33612345679",
    firstName: "Marie",
    lastName: "Martin",
    role: "ADMIN",
    emailVerified: true,
    phoneVerified: true,
    mfaEnabled: true,
    createdAt: "2023-06-01T08:00:00Z",
    updatedAt: "2024-01-10T14:30:00Z",
  },
  {
    id: "user-3",
    email: "ops@capmobilite.fr",
    phone: "+33612345680",
    firstName: "Pierre",
    lastName: "Bernard",
    role: "OPS_AGENT",
    emailVerified: true,
    phoneVerified: true,
    mfaEnabled: true,
    createdAt: "2023-08-15T09:00:00Z",
    updatedAt: "2024-01-12T11:00:00Z",
  },
];

export const mockPatients: Patient[] = [
  {
    id: "user-1",
    email: "jean.dupont@email.fr",
    phone: "+33612345678",
    firstName: "Jean",
    lastName: "Dupont",
    role: "PATIENT",
    emailVerified: true,
    phoneVerified: true,
    mfaEnabled: false,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    dateOfBirth: "1965-03-22",
    nirHash: "hashed_nir_value",
    address: {
      street: "123 Rue de la Paix",
      city: "Paris",
      postalCode: "75001",
      country: "France",
      deliveryNotes: "Digicode: 1234A, 3ème étage gauche",
    },
    emergencyContact: {
      name: "Marie Dupont",
      phone: "+33612345699",
      relationship: "Épouse",
    },
  },
  {
    id: "patient-2",
    email: "sophie.laurent@email.fr",
    phone: "+33623456789",
    firstName: "Sophie",
    lastName: "Laurent",
    role: "PATIENT",
    emailVerified: true,
    phoneVerified: true,
    mfaEnabled: false,
    createdAt: "2024-02-01T14:00:00Z",
    updatedAt: "2024-02-01T14:00:00Z",
    dateOfBirth: "1978-07-14",
    address: {
      street: "45 Avenue Victor Hugo",
      city: "Lyon",
      postalCode: "69002",
      country: "France",
    },
  },
];

// Mock credentials for testing
export const mockCredentials = [
  { email: "jean.dupont@email.fr", password: "password123", role: "PATIENT" },
  { email: "admin@capmobilite.fr", password: "admin123", role: "ADMIN" },
  { email: "ops@capmobilite.fr", password: "ops123", role: "OPS_AGENT" },
];

export function findUserByEmail(email: string): User | undefined {
  return mockUsers.find((u) => u.email === email);
}

export function findPatientById(id: string): Patient | undefined {
  return mockPatients.find((p) => p.id === id);
}

export function validateCredentials(email: string, password: string): User | null {
  const cred = mockCredentials.find((c) => c.email === email && c.password === password);
  if (cred) {
    return mockUsers.find((u) => u.email === email) || null;
  }
  return null;
}
