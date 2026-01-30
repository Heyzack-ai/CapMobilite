"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Euro,
  Truck,
  Clock,
  CheckCircle,
  Loader2,
  Plus,
  Calendar,
  AlertCircle,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { CaseHeader } from "@/components/admin/cases/case-header";
import { CaseChecklistAdmin } from "@/components/admin/cases/case-checklist-admin";
import { CaseNotes } from "@/components/admin/cases/case-notes";
import { CaseActivity } from "@/components/admin/cases/case-activity";
import { CaseDocuments } from "@/components/patient/case-documents";

import { getCaseById, caseStatusLabels } from "@/lib/mocks/data/cases";
import { findPatientById, mockUsers } from "@/lib/mocks/data/users";
import type { CaseStatus } from "@/types";

export default function AdminCaseDetailPage() {
  const t = useTranslations("admin.caseDetail");
  const params = useParams();
  const caseId = params.caseId as string;

  // State for dialogs
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<CaseStatus | "">("");
  const [statusNotes, setStatusNotes] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  // Get case data
  const caseData = getCaseById(caseId);
  const patient = caseData ? findPatientById(caseData.patientId) : null;

  // Get staff members for assignment
  const staffMembers = mockUsers.filter(
    (u) => u.role === "OPS_AGENT" || u.role === "ADMIN"
  );

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
        <h2 className="text-xl font-semibold text-neutral-900">
          Dossier non trouvé
        </h2>
        <p className="text-neutral-500 mt-2">
          Ce dossier n'existe pas ou a été supprimé.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/dossiers">{t("backToList")}</Link>
        </Button>
      </div>
    );
  }

  // Calculate progress
  const completedItems = caseData.checklist.filter(
    (item) => item.completedAt
  ).length;
  const progress =
    caseData.checklist.length > 0
      ? Math.round((completedItems / caseData.checklist.length) * 100)
      : 0;

  // SLA calculation
  const slaExpired =
    caseData.slaDeadline && new Date(caseData.slaDeadline) < new Date();
  const slaDaysRemaining = caseData.slaDeadline
    ? Math.ceil(
        (new Date(caseData.slaDeadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  // Mock quote data
  const mockQuote = caseData.quoteId
    ? {
        id: caseData.quoteId,
        totalLPPR: 2100,
        totalPatient: 350,
        total: 2450,
        status: "SENT",
        validUntil: "2024-02-20",
        items: [
          {
            id: "item-1",
            description: "Fauteuil roulant électrique",
            lpprCode: "4032110",
            quantity: 1,
            unitPrice: 2200,
          },
          {
            id: "item-2",
            description: "Coussin anti-escarre",
            lpprCode: "4032115",
            quantity: 1,
            unitPrice: 250,
          },
        ],
      }
    : null;

  // Handle checklist toggle
  const handleChecklistToggle = (key: string, completed: boolean) => {
    console.log("Toggle checklist item:", key, completed);
    // TODO: Implement API call
  };

  // Handle status change
  const handleStatusChange = () => {
    if (!newStatus) return;
    console.log("Change status to:", newStatus, "Notes:", statusNotes);
    // TODO: Implement API call
    setShowStatusDialog(false);
    setNewStatus("");
    setStatusNotes("");
  };

  // Handle assignment
  const handleAssign = () => {
    if (!assigneeId) return;
    console.log("Assign to:", assigneeId);
    // TODO: Implement API call
    setShowAssignDialog(false);
    setAssigneeId("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <CaseHeader
        caseData={caseData}
        patient={patient}
        onChangeStatus={() => setShowStatusDialog(true)}
        onAssign={() => setShowAssignDialog(true)}
      />

      {/* SLA Progress Card */}
      {slaDaysRemaining !== null && (
        <Card
          className={
            slaExpired
              ? "border-error/50 bg-error/5"
              : slaDaysRemaining <= 3
              ? "border-warning/50 bg-warning/5"
              : "border-primary/50"
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock
                  className={`w-5 h-5 ${
                    slaExpired
                      ? "text-error"
                      : slaDaysRemaining <= 3
                      ? "text-warning"
                      : "text-primary"
                  }`}
                />
                <div>
                  <p className="font-medium">
                    {slaExpired
                      ? "SLA dépassé"
                      : `${slaDaysRemaining} jour${
                          slaDaysRemaining > 1 ? "s" : ""
                        } restant${slaDaysRemaining > 1 ? "s" : ""}`}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Échéance:{" "}
                    {new Date(caseData.slaDeadline!).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-500">Progression globale</p>
                <p className="font-semibold">{progress}%</p>
              </div>
            </div>
            <Progress value={progress} className="h-2 mt-3" />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="documents">{t("tabs.documents")}</TabsTrigger>
          <TabsTrigger value="quote">{t("tabs.quote")}</TabsTrigger>
          <TabsTrigger value="delivery">{t("tabs.delivery")}</TabsTrigger>
          <TabsTrigger value="notes">{t("tabs.notes")}</TabsTrigger>
          <TabsTrigger value="activity">{t("tabs.activity")}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Checklist */}
            <CaseChecklistAdmin
              checklist={caseData.checklist}
              onToggleItem={handleChecklistToggle}
            />

            {/* Assignment Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations d'assignation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Assigné à</p>
                      <p className="font-medium">
                        {caseData.assignedToId
                          ? mockUsers.find(
                              (u) => u.id === caseData.assignedToId
                            )?.firstName +
                            " " +
                            mockUsers.find(
                              (u) => u.id === caseData.assignedToId
                            )?.lastName
                          : "Non assigné"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAssignDialog(true)}
                  >
                    {caseData.assignedToId ? "Réassigner" : "Assigner"}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-500">Créé le</p>
                    <p className="font-medium">
                      {new Date(caseData.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-500">Dernière mise à jour</p>
                    <p className="font-medium">
                      {new Date(caseData.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-neutral-700 mb-3">
                    Actions rapides
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Ajouter document
                    </Button>
                    {!mockQuote && (
                      <Button variant="outline" size="sm">
                        <Euro className="w-4 h-4 mr-2" />
                        {t("actions.createQuote")}
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Truck className="w-4 h-4 mr-2" />
                      {t("actions.scheduleDelivery")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <CaseDocuments caseId={caseId} />
        </TabsContent>

        {/* Quote Tab */}
        <TabsContent value="quote" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5" />
                {t("tabs.quote")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!mockQuote ? (
                <div className="text-center py-8">
                  <Euro className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-neutral-500 mb-4">
                    Aucun devis n'a encore été créé pour ce dossier.
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("actions.createQuote")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Quote Status */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        mockQuote.status === "APPROVED" ? "success" : "info"
                      }
                    >
                      {mockQuote.status === "APPROVED"
                        ? "Approuvé"
                        : mockQuote.status === "SENT"
                        ? "Envoyé au patient"
                        : "Brouillon"}
                    </Badge>
                    <p className="text-sm text-neutral-500">
                      Valide jusqu'au{" "}
                      {new Date(mockQuote.validUntil).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>

                  {/* Quote Items */}
                  <div className="border rounded-lg divide-y">
                    {mockQuote.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex justify-between items-start"
                      >
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-neutral-500">
                            Code LPPR: {item.lpprCode}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {item.unitPrice.toLocaleString("fr-FR")} EUR
                          </p>
                          <p className="text-sm text-neutral-500">
                            x{item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quote Totals */}
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">
                        Prise en charge CPAM
                      </span>
                      <span className="font-medium text-success">
                        {mockQuote.totalLPPR.toLocaleString("fr-FR")} EUR
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Reste à charge patient</span>
                      <span className="font-bold text-lg">
                        {mockQuote.totalPatient.toLocaleString("fr-FR")} EUR
                      </span>
                    </div>
                  </div>

                  {/* Quote Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline">Modifier le devis</Button>
                    <Button variant="outline">Télécharger PDF</Button>
                    {mockQuote.status !== "APPROVED" && (
                      <Button>Renvoyer au patient</Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                {t("tabs.delivery")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!["DELIVERY_SCHEDULED", "DELIVERED"].includes(caseData.status) ? (
                <div className="text-center py-8">
                  <Truck className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-neutral-500 mb-4">
                    La livraison n'est pas encore planifiée.
                  </p>
                  <p className="text-sm text-neutral-400 mb-4">
                    La livraison peut être planifiée une fois le dossier approuvé
                    par la CPAM.
                  </p>
                  <Button disabled={caseData.status !== "CPAM_APPROVED"}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {t("actions.scheduleDelivery")}
                  </Button>
                </div>
              ) : caseData.status === "DELIVERY_SCHEDULED" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-primary-50 border border-primary-200">
                    <Calendar className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium text-primary">
                        Livraison planifiée
                      </p>
                      <p className="text-sm text-neutral-500">
                        Date prévue: 25 janvier 2024 - Créneau: 10h-12h
                      </p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm font-medium text-neutral-700 mb-2">
                      Adresse de livraison
                    </p>
                    <p className="text-neutral-600">
                      {patient?.address?.street}
                      <br />
                      {patient?.address?.postalCode} {patient?.address?.city}
                    </p>
                    {patient?.address?.deliveryNotes && (
                      <p className="text-sm text-neutral-500 mt-2">
                        Notes: {patient.address.deliveryNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">Replanifier</Button>
                    <Button>Marquer comme livrée</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30">
                    <CheckCircle className="w-6 h-6 text-success" />
                    <div>
                      <p className="font-medium text-success">
                        Livraison effectuée
                      </p>
                      <p className="text-sm text-neutral-500">
                        Livré le{" "}
                        {new Date(caseData.updatedAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                  </div>

                  <Button variant="outline">Voir le bon de livraison</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-6">
          <CaseNotes
            caseId={caseId}
            onAddNote={(content, isInternal) => {
              console.log("Add note:", content, "Internal:", isInternal);
              // TODO: Implement API call
            }}
          />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <CaseActivity caseId={caseId} />
        </TabsContent>
      </Tabs>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.changeStatus")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-neutral-500 mb-2">Statut actuel</p>
              <Badge
                variant={
                  caseStatusLabels[caseData.status as CaseStatus]
                    ? "info"
                    : "default"
                }
              >
                {caseStatusLabels[caseData.status as CaseStatus] ||
                  caseData.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nouveau statut</label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as CaseStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(caseStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optionnel)</label>
              <Textarea
                placeholder="Ajouter une note sur ce changement de statut..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleStatusChange} disabled={!newStatus}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("actions.assign")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Collaborateur</label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un collaborateur" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName} ({staff.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAssign} disabled={!assigneeId}>
              Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
