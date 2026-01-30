"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  FileText,
  Cpu,
  Activity,
  Edit,
  Key,
  UserX,
  AlertTriangle,
  Wrench,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserHeader } from "@/components/admin/users/user-header";
import { UserProfileCard } from "@/components/admin/users/user-profile-card";
import { UserCasesList } from "@/components/admin/users/user-cases-list";
import type { Patient, Case, Device, AuditLog, CaseStatus, DeviceStatus } from "@/types";

// Mock user data
const mockUsers: Record<string, Patient & { status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | "DEACTIVATED" }> = {
  "usr_patient_001": {
    id: "usr_patient_001",
    email: "marie.dupont@email.com",
    phone: "+33612345678",
    firstName: "Marie",
    lastName: "Dupont",
    role: "PATIENT",
    emailVerified: true,
    phoneVerified: true,
    mfaEnabled: false,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-06-20T14:45:00Z",
    dateOfBirth: "1965-03-22",
    nir: "1650375123456",
    address: {
      street: "123 Rue de la Paix",
      city: "Paris",
      postalCode: "75001",
      country: "France",
      deliveryNotes: "Digicode: 1234A, 3eme etage gauche",
    },
    emergencyContact: {
      name: "Jean Dupont",
      phone: "+33698765432",
      relationship: "Epoux",
    },
    status: "ACTIVE",
  },
  "usr_patient_002": {
    id: "usr_patient_002",
    email: "pierre.martin@email.com",
    phone: "+33623456789",
    firstName: "Pierre",
    lastName: "Martin",
    role: "PATIENT",
    emailVerified: true,
    phoneVerified: false,
    mfaEnabled: true,
    createdAt: "2024-02-10T09:00:00Z",
    updatedAt: "2024-07-01T11:20:00Z",
    dateOfBirth: "1978-11-15",
    nir: "1781175234567",
    address: {
      street: "45 Avenue des Champs",
      city: "Lyon",
      postalCode: "69001",
      country: "France",
    },
    emergencyContact: {
      name: "Sophie Martin",
      phone: "+33687654321",
      relationship: "Soeur",
    },
    status: "ACTIVE",
  },
  "usr_ops_001": {
    id: "usr_ops_001",
    email: "julie.bernard@capmobilite.fr",
    phone: "+33634567890",
    firstName: "Julie",
    lastName: "Bernard",
    role: "OPS_AGENT",
    emailVerified: true,
    phoneVerified: true,
    mfaEnabled: true,
    createdAt: "2023-06-01T08:00:00Z",
    updatedAt: "2024-07-15T16:30:00Z",
    status: "ACTIVE",
  },
  "usr_tech_001": {
    id: "usr_tech_001",
    email: "marc.leroy@capmobilite.fr",
    phone: "+33645678901",
    firstName: "Marc",
    lastName: "Leroy",
    role: "TECHNICIAN",
    emailVerified: true,
    phoneVerified: true,
    mfaEnabled: true,
    createdAt: "2023-09-15T10:00:00Z",
    updatedAt: "2024-07-20T09:00:00Z",
    status: "ACTIVE",
  },
  "usr_prescriber_001": {
    id: "usr_prescriber_001",
    email: "dr.moreau@hopital.fr",
    phone: "+33656789012",
    firstName: "Claire",
    lastName: "Moreau",
    role: "PRESCRIBER",
    emailVerified: true,
    phoneVerified: true,
    mfaEnabled: false,
    createdAt: "2024-03-01T14:00:00Z",
    updatedAt: "2024-07-10T10:30:00Z",
    status: "PENDING_VERIFICATION",
  },
};

// Mock cases data
const mockCases: Record<string, Case[]> = {
  "usr_patient_001": [
    {
      id: "case_001",
      caseNumber: "CAP-2024-001234",
      patientId: "usr_patient_001",
      status: "CPAM_APPROVED" as CaseStatus,
      priority: "NORMAL",
      createdAt: "2024-05-15T10:00:00Z",
      updatedAt: "2024-07-01T14:30:00Z",
      slaDeadline: "2024-07-20T23:59:59Z",
      checklist: [
        { id: "1", label: "Ordonnance", required: true, completedAt: "2024-05-15T10:30:00Z" },
        { id: "2", label: "Piece identite", required: true, completedAt: "2024-05-16T09:00:00Z" },
        { id: "3", label: "Carte Vitale", required: true, completedAt: "2024-05-16T09:30:00Z" },
        { id: "4", label: "Devis approuve", required: true, completedAt: "2024-06-01T11:00:00Z" },
        { id: "5", label: "CPAM approuve", required: true, completedAt: "2024-07-01T14:30:00Z" },
        { id: "6", label: "Livraison", required: true },
      ],
      documents: [],
      timeline: [],
    },
    {
      id: "case_002",
      caseNumber: "CAP-2024-002345",
      patientId: "usr_patient_001",
      status: "DELIVERED" as CaseStatus,
      priority: "LOW",
      createdAt: "2024-01-20T09:00:00Z",
      updatedAt: "2024-03-15T16:00:00Z",
      checklist: [
        { id: "1", label: "Ordonnance", required: true, completedAt: "2024-01-20T09:30:00Z" },
        { id: "2", label: "Piece identite", required: true, completedAt: "2024-01-21T10:00:00Z" },
        { id: "3", label: "Carte Vitale", required: true, completedAt: "2024-01-21T10:30:00Z" },
        { id: "4", label: "Devis approuve", required: true, completedAt: "2024-02-05T14:00:00Z" },
        { id: "5", label: "CPAM approuve", required: true, completedAt: "2024-03-01T11:00:00Z" },
        { id: "6", label: "Livraison", required: true, completedAt: "2024-03-15T16:00:00Z" },
      ],
      documents: [],
      timeline: [],
    },
  ],
  "usr_patient_002": [
    {
      id: "case_003",
      caseNumber: "CAP-2024-003456",
      patientId: "usr_patient_002",
      status: "DOCUMENTS_PENDING" as CaseStatus,
      priority: "HIGH",
      createdAt: "2024-07-10T11:00:00Z",
      updatedAt: "2024-07-12T09:00:00Z",
      slaDeadline: "2024-07-25T23:59:59Z",
      checklist: [
        { id: "1", label: "Ordonnance", required: true, completedAt: "2024-07-10T11:30:00Z" },
        { id: "2", label: "Piece identite", required: true },
        { id: "3", label: "Carte Vitale", required: true },
        { id: "4", label: "Devis approuve", required: true },
        { id: "5", label: "CPAM approuve", required: true },
        { id: "6", label: "Livraison", required: true },
      ],
      documents: [],
      timeline: [],
    },
  ],
};

// Mock devices data
const mockDevices: Record<string, Device[]> = {
  "usr_patient_001": [
    {
      id: "dev_001",
      patientId: "usr_patient_001",
      caseId: "case_002",
      serialNumber: "WC-2024-001234",
      model: "Invacare Action 3",
      category: "MANUAL",
      status: "ACTIVE" as DeviceStatus,
      deliveryDate: "2024-03-15",
      warrantyEndDate: "2026-03-15",
      lastMaintenanceDate: "2024-06-15",
      nextMaintenanceDate: "2024-09-15",
    },
  ],
  "usr_patient_002": [],
};

// Mock audit logs
const mockAuditLogs: Record<string, AuditLog[]> = {
  "usr_patient_001": [
    {
      id: "log_001",
      userId: "usr_ops_001",
      action: "UPDATE",
      entityType: "USER",
      entityId: "usr_patient_001",
      timestamp: "2024-07-15T14:30:00Z",
      details: { field: "phone", oldValue: "+33600000000", newValue: "+33612345678" },
      ipAddress: "192.168.1.100",
    },
    {
      id: "log_002",
      userId: "usr_patient_001",
      action: "LOGIN",
      entityType: "SESSION",
      entityId: "usr_patient_001",
      timestamp: "2024-07-14T09:00:00Z",
      details: { device: "Chrome/Windows" },
      ipAddress: "82.120.45.67",
    },
    {
      id: "log_003",
      userId: "usr_patient_001",
      action: "CREATE",
      entityType: "DOCUMENT",
      entityId: "doc_005",
      timestamp: "2024-07-10T11:30:00Z",
      details: { documentType: "Ordonnance", fileName: "ordonnance_2024.pdf" },
      ipAddress: "82.120.45.67",
    },
    {
      id: "log_004",
      userId: "usr_ops_001",
      action: "UPDATE",
      entityType: "CASE",
      entityId: "case_001",
      timestamp: "2024-07-01T14:30:00Z",
      details: { field: "status", oldValue: "SUBMITTED_TO_CPAM", newValue: "CPAM_APPROVED" },
      ipAddress: "192.168.1.100",
    },
  ],
  "usr_patient_002": [
    {
      id: "log_005",
      userId: "usr_patient_002",
      action: "LOGIN",
      entityType: "SESSION",
      entityId: "usr_patient_002",
      timestamp: "2024-07-12T08:00:00Z",
      details: { device: "Safari/iOS" },
      ipAddress: "90.56.78.123",
    },
  ],
  "usr_ops_001": [
    {
      id: "log_006",
      userId: "usr_ops_001",
      action: "LOGIN",
      entityType: "SESSION",
      entityId: "usr_ops_001",
      timestamp: "2024-07-15T08:30:00Z",
      details: { device: "Chrome/MacOS" },
      ipAddress: "192.168.1.100",
    },
  ],
  "usr_tech_001": [
    {
      id: "log_007",
      userId: "usr_tech_001",
      action: "UPDATE",
      entityType: "TICKET",
      entityId: "tkt_001",
      timestamp: "2024-07-18T10:00:00Z",
      details: { field: "status", oldValue: "OPEN", newValue: "IN_PROGRESS" },
      ipAddress: "192.168.1.105",
    },
  ],
  "usr_prescriber_001": [],
};

export default function UserDetailPage() {
  const t = useTranslations("admin.userDetail");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const userId = params.userId as string;

  const [activeTab, setActiveTab] = useState("profile");

  // Get user data
  const user = mockUsers[userId];
  const userCases = mockCases[userId] || [];
  const userDevices = mockDevices[userId] || [];
  const userAuditLogs = mockAuditLogs[userId] || [];

  // Check if user is a patient (show cases and devices tabs)
  const isPatient = user?.role === "PATIENT";

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
            <p className="text-neutral-500 font-medium">{t("notFound")}</p>
            <p className="text-sm text-neutral-400 mt-1">{t("notFoundDescription")}</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href={`/${locale}/admin/utilisateurs`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("backToList")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const actionLabels: Record<string, string> = {
    CREATE: t("activity.actions.create"),
    UPDATE: t("activity.actions.update"),
    DELETE: t("activity.actions.delete"),
    LOGIN: t("activity.actions.login"),
    LOGOUT: t("activity.actions.logout"),
  };

  const entityLabels: Record<string, string> = {
    USER: t("activity.entities.user"),
    CASE: t("activity.entities.case"),
    DOCUMENT: t("activity.entities.document"),
    DEVICE: t("activity.entities.device"),
    TICKET: t("activity.entities.ticket"),
    SESSION: t("activity.entities.session"),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href={`/${locale}/admin/utilisateurs`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("back")}
        </Link>
      </Button>

      {/* User Header */}
      <Card>
        <CardContent className="p-6">
          <UserHeader user={user} />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {t("tabs.profile")}
          </TabsTrigger>
          {isPatient && (
            <>
              <TabsTrigger value="cases" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t("tabs.cases")}
                {userCases.length > 0 && (
                  <Badge variant="secondary" size="sm">
                    {userCases.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="devices" className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                {t("tabs.devices")}
                {userDevices.length > 0 && (
                  <Badge variant="secondary" size="sm">
                    {userDevices.length}
                  </Badge>
                )}
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {t("tabs.activity")}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <UserProfileCard user={user} />
        </TabsContent>

        {/* Cases Tab (Patients only) */}
        {isPatient && (
          <TabsContent value="cases" className="mt-6">
            <UserCasesList cases={userCases} />
          </TabsContent>
        )}

        {/* Devices Tab (Patients only) */}
        {isPatient && (
          <TabsContent value="devices" className="mt-6">
            {userDevices.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Cpu className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                  <p className="text-neutral-500">{t("devices.noDevices")}</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    {t("devices.noDevicesDescription")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Devices Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-neutral-500">{t("devices.stats.total")}</p>
                      <p className="text-2xl font-bold">{userDevices.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-neutral-500">{t("devices.stats.active")}</p>
                      <p className="text-2xl font-bold text-success">
                        {userDevices.filter((d) => d.status === "ACTIVE").length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-neutral-500">{t("devices.stats.inRepair")}</p>
                      <p className="text-2xl font-bold text-warning">
                        {userDevices.filter((d) => d.status === "IN_REPAIR").length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-neutral-500">{t("devices.stats.underWarranty")}</p>
                      <p className="text-2xl font-bold text-info">
                        {userDevices.filter((d) => d.warrantyEndDate && new Date(d.warrantyEndDate) > new Date()).length}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Devices List */}
                <div className="grid gap-4">
                  {userDevices.map((device) => {
                    const isUnderWarranty = device.warrantyEndDate ? new Date(device.warrantyEndDate) > new Date() : false;
                    const maintenanceDue =
                      device.nextMaintenanceDate &&
                      new Date(device.nextMaintenanceDate) <= new Date();

                    return (
                      <Card key={device.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Cpu className="w-6 h-6 text-primary-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{device.model}</h3>
                                <p className="text-sm text-neutral-500">
                                  {t("devices.serialNumber")}: {device.serialNumber}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge
                                    variant={
                                      device.status === "ACTIVE"
                                        ? "success"
                                        : device.status === "IN_REPAIR"
                                        ? "warning"
                                        : "secondary"
                                    }
                                  >
                                    {t(`devices.status.${device.status.toLowerCase()}`)}
                                  </Badge>
                                  {device.category && (
                                    <Badge variant={device.category === "ELECTRIC" ? "info" : "outline"}>
                                      {t(`devices.category.${device.category.toLowerCase()}`)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {isUnderWarranty ? (
                                <div className="flex items-center gap-1 text-success">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    {t("devices.underWarranty")}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-neutral-400">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    {t("devices.warrantyExpired")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                            {device.deliveryDate && (
                              <div>
                                <p className="text-xs text-neutral-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {t("devices.deliveryDate")}
                                </p>
                                <p className="font-medium">
                                  {new Date(device.deliveryDate).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                            )}
                            {device.warrantyEndDate && (
                              <div>
                                <p className="text-xs text-neutral-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {t("devices.warrantyEnd")}
                                </p>
                                <p className="font-medium">
                                  {new Date(device.warrantyEndDate).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                            )}
                            {device.lastMaintenanceDate && (
                              <div>
                                <p className="text-xs text-neutral-500 flex items-center gap-1">
                                  <Wrench className="w-3 h-3" />
                                  {t("devices.lastMaintenance")}
                                </p>
                                <p className="font-medium">
                                  {new Date(device.lastMaintenanceDate).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                            )}
                            {device.nextMaintenanceDate && (
                              <div>
                                <p className="text-xs text-neutral-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {t("devices.nextMaintenance")}
                                </p>
                                <p
                                  className={`font-medium ${
                                    maintenanceDue ? "text-error" : ""
                                  }`}
                                >
                                  {new Date(device.nextMaintenanceDate).toLocaleDateString("fr-FR")}
                                  {maintenanceDue && (
                                    <AlertTriangle className="w-4 h-4 inline ml-1" />
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        )}

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("activity.title")}</CardTitle>
              <CardDescription>{t("activity.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {userAuditLogs.length === 0 ? (
                <div className="py-12 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                  <p className="text-neutral-500">{t("activity.noActivity")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-neutral-50"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          log.action === "CREATE"
                            ? "bg-success/10 text-success"
                            : log.action === "UPDATE"
                            ? "bg-info/10 text-info"
                            : log.action === "DELETE"
                            ? "bg-error/10 text-error"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              log.action === "CREATE"
                                ? "success"
                                : log.action === "UPDATE"
                                ? "info"
                                : log.action === "DELETE"
                                ? "error"
                                : "secondary"
                            }
                            size="sm"
                          >
                            {actionLabels[log.action] || log.action}
                          </Badge>
                          <span className="text-sm text-neutral-500">
                            {entityLabels[log.entityType] || log.entityType}
                          </span>
                        </div>
                        <p className="text-sm mt-1">
                          {log.details && typeof log.details === "object" && (
                            <>
                              {(log.details as { field?: string; oldValue?: string; newValue?: string }).field && (
                                <span>
                                  {t("activity.fieldChanged", { field: (log.details as { field: string }).field })}:{" "}
                                  <span className="line-through text-neutral-400">
                                    {String((log.details as { oldValue?: unknown }).oldValue || "")}
                                  </span>{" "}
                                  <span className="text-primary-600">{String((log.details as { newValue?: unknown }).newValue || "")}</span>
                                </span>
                              )}
                              {(log.details as { device?: string }).device && (
                                <span>{t("activity.device")}: {(log.details as { device: string }).device}</span>
                              )}
                              {(log.details as { documentType?: string }).documentType && (
                                <span>
                                  {(log.details as { documentType: string }).documentType}: {(log.details as { fileName?: string }).fileName}
                                </span>
                              )}
                            </>
                          )}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                          <span>
                            {new Date(log.timestamp).toLocaleDateString("fr-FR")}{" "}
                            {new Date(log.timestamp).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">{t("actions.title")}</p>
              <p className="text-xs text-neutral-400">{t("actions.description")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                {t("actions.editProfile")}
              </Button>
              <Button variant="outline">
                <Key className="w-4 h-4 mr-2" />
                {t("actions.resetPassword")}
              </Button>
              {user.status === "ACTIVE" ? (
                <Button variant="destructive">
                  <UserX className="w-4 h-4 mr-2" />
                  {t("actions.deactivate")}
                </Button>
              ) : user.status === "SUSPENDED" || user.status === "DEACTIVATED" ? (
                <Button variant="default">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t("actions.activate")}
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
