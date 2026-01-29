"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Settings,
  Shield,
  Eye,
  Download,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details: string;
  ipAddress: string;
}

// Mock audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: "audit-1",
    timestamp: "2024-02-15T14:30:00",
    userId: "admin-1",
    userName: "Admin System",
    userRole: "ADMIN",
    action: "CREATE",
    entityType: "USER",
    entityId: "user-new",
    entityName: "Marie Dupont",
    details: "Création d'un nouveau compte patient",
    ipAddress: "192.168.1.100",
  },
  {
    id: "audit-2",
    timestamp: "2024-02-15T14:25:00",
    userId: "ops-1",
    userName: "Jean Ops",
    userRole: "OPS_AGENT",
    action: "UPDATE",
    entityType: "CASE",
    entityId: "case-1",
    entityName: "DOSS-2024-001",
    details: "Changement de statut: QUOTE_APPROVED → ORDERED",
    ipAddress: "192.168.1.101",
  },
  {
    id: "audit-3",
    timestamp: "2024-02-15T14:20:00",
    userId: "billing-1",
    userName: "Sophie Compta",
    userRole: "BILLING_AGENT",
    action: "CREATE",
    entityType: "CLAIM",
    entityId: "claim-new",
    entityName: "FACT-2024-005",
    details: "Soumission d'une demande de remboursement CPAM",
    ipAddress: "192.168.1.102",
  },
  {
    id: "audit-4",
    timestamp: "2024-02-15T14:15:00",
    userId: "user-1",
    userName: "Jean Dupont",
    userRole: "PATIENT",
    action: "VIEW",
    entityType: "DOCUMENT",
    entityId: "doc-1",
    entityName: "Ordonnance_20240115.pdf",
    details: "Consultation du document",
    ipAddress: "82.123.45.67",
  },
  {
    id: "audit-5",
    timestamp: "2024-02-15T14:10:00",
    userId: "tech-1",
    userName: "Pierre Martin",
    userRole: "TECHNICIAN",
    action: "UPDATE",
    entityType: "TICKET",
    entityId: "ticket-1",
    entityName: "TKT-2024-001",
    details: "Visite planifiée pour le 20/02/2024",
    ipAddress: "192.168.1.103",
  },
  {
    id: "audit-6",
    timestamp: "2024-02-15T14:05:00",
    userId: "admin-1",
    userName: "Admin System",
    userRole: "ADMIN",
    action: "DELETE",
    entityType: "USER",
    entityId: "user-old",
    entityName: "Compte Test",
    details: "Suppression d'un compte de test",
    ipAddress: "192.168.1.100",
  },
  {
    id: "audit-7",
    timestamp: "2024-02-15T14:00:00",
    userId: "user-1",
    userName: "Jean Dupont",
    userRole: "PATIENT",
    action: "LOGIN",
    entityType: "SESSION",
    entityId: "session-123",
    entityName: "Connexion",
    details: "Connexion réussie",
    ipAddress: "82.123.45.67",
  },
  {
    id: "audit-8",
    timestamp: "2024-02-15T13:55:00",
    userId: "ops-1",
    userName: "Jean Ops",
    userRole: "OPS_AGENT",
    action: "UPLOAD",
    entityType: "DOCUMENT",
    entityId: "doc-new",
    entityName: "Devis_DOSS-2024-002.pdf",
    details: "Upload d'un devis pour le dossier DOSS-2024-002",
    ipAddress: "192.168.1.101",
  },
];

const actionLabels: Record<string, string> = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  VIEW: "Consultation",
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
  UPLOAD: "Upload",
  DOWNLOAD: "Téléchargement",
};

const actionColors: Record<string, string> = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "error",
  VIEW: "secondary",
  LOGIN: "default",
  LOGOUT: "default",
  UPLOAD: "info",
  DOWNLOAD: "secondary",
};

const entityIcons: Record<string, React.ReactNode> = {
  USER: <User className="w-4 h-4" />,
  CASE: <FileText className="w-4 h-4" />,
  CLAIM: <FileText className="w-4 h-4" />,
  DOCUMENT: <FileText className="w-4 h-4" />,
  TICKET: <ClipboardList className="w-4 h-4" />,
  SESSION: <Shield className="w-4 h-4" />,
  SETTINGS: <Settings className="w-4 h-4" />,
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  OPS_AGENT: "Agent OPS",
  BILLING_AGENT: "Facturation",
  TECHNICIAN: "Technicien",
  PATIENT: "Patient",
};

export default function AuditPage() {
  const t = useTranslations("admin.audit");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [entityFilter, setEntityFilter] = useState<string>("");

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.entityName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesEntity = !entityFilter || log.entityType === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          {t("exportLogs")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-neutral-900">{mockAuditLogs.length}</p>
            <p className="text-sm text-neutral-500">{t("totalLogs")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-success">
              {mockAuditLogs.filter((l) => l.action === "CREATE").length}
            </p>
            <p className="text-sm text-neutral-500">{t("creations")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-info">
              {mockAuditLogs.filter((l) => l.action === "UPDATE").length}
            </p>
            <p className="text-sm text-neutral-500">{t("modifications")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-error">
              {mockAuditLogs.filter((l) => l.action === "DELETE").length}
            </p>
            <p className="text-sm text-neutral-500">{t("deletions")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t("allActions")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("allActions")}</SelectItem>
                {Object.entries(actionLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t("allEntities")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("allEntities")}</SelectItem>
                <SelectItem value="USER">Utilisateurs</SelectItem>
                <SelectItem value="CASE">Dossiers</SelectItem>
                <SelectItem value="CLAIM">Factures</SelectItem>
                <SelectItem value="DOCUMENT">Documents</SelectItem>
                <SelectItem value="TICKET">Tickets SAV</SelectItem>
                <SelectItem value="SESSION">Sessions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                <p className="text-neutral-500">{t("noLogsFound")}</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-neutral-50">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      {entityIcons[log.entityType] || <FileText className="w-4 h-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={actionColors[log.action] as "default" | "success" | "warning" | "error" | "info" | "secondary"}>
                          {actionLabels[log.action]}
                        </Badge>
                        <span className="font-medium">{log.entityName}</span>
                      </div>

                      <p className="text-sm text-neutral-600 mt-1">{log.details}</p>

                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.userName} ({roleLabels[log.userRole]})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleString("fr-FR")}
                        </span>
                        <span className="text-neutral-400">{log.ipAddress}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
