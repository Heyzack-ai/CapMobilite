"use client";

import { useTranslations } from "next-intl";
import {
  Clock,
  FileText,
  CheckCircle,
  UserPlus,
  Send,
  Truck,
  Euro,
  AlertCircle,
  RefreshCw,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: string;
  type:
    | "status_change"
    | "document_uploaded"
    | "checklist_update"
    | "assignment"
    | "quote_created"
    | "quote_approved"
    | "delivery_scheduled"
    | "delivery_completed"
    | "note_added"
    | "cpam_submission";
  description: string;
  userId: string;
  userName: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface CaseActivityProps {
  caseId: string;
  activities?: ActivityItem[];
}

// Mock activities for display
const mockActivities: ActivityItem[] = [
  {
    id: "act-1",
    type: "status_change",
    description: "Statut changé de \"Documents en attente\" à \"Devis prêt\"",
    userId: "user-3",
    userName: "Pierre Bernard",
    metadata: {
      oldStatus: "DOCUMENTS_PENDING",
      newStatus: "QUOTE_READY",
    },
    createdAt: "2024-01-20T14:00:00Z",
  },
  {
    id: "act-2",
    type: "quote_created",
    description: "Devis créé - Montant: 2 450,00 EUR",
    userId: "user-3",
    userName: "Pierre Bernard",
    metadata: {
      quoteId: "quote-1",
      amount: 2450,
    },
    createdAt: "2024-01-19T16:30:00Z",
  },
  {
    id: "act-3",
    type: "document_uploaded",
    description: "Document ajouté: Attestation mutuelle",
    userId: "user-1",
    userName: "Jean Dupont",
    metadata: {
      documentType: "MUTUAL_CARD",
    },
    createdAt: "2024-01-18T11:20:00Z",
  },
  {
    id: "act-4",
    type: "checklist_update",
    description: "Élément validé: Carte Vitale",
    userId: "user-3",
    userName: "Pierre Bernard",
    metadata: {
      checklistItem: "carte_vitale",
    },
    createdAt: "2024-01-17T09:45:00Z",
  },
  {
    id: "act-5",
    type: "assignment",
    description: "Dossier assigné à Pierre Bernard",
    userId: "user-2",
    userName: "Marie Martin",
    metadata: {
      assigneeId: "user-3",
      assigneeName: "Pierre Bernard",
    },
    createdAt: "2024-01-16T10:30:00Z",
  },
  {
    id: "act-6",
    type: "document_uploaded",
    description: "Documents initiaux téléchargés: Ordonnance, Carte d'identité",
    userId: "user-1",
    userName: "Jean Dupont",
    metadata: {
      documentTypes: ["PRESCRIPTION", "ID_CARD"],
    },
    createdAt: "2024-01-16T09:15:00Z",
  },
  {
    id: "act-7",
    type: "status_change",
    description: "Dossier créé",
    userId: "system",
    userName: "Système",
    metadata: {
      newStatus: "INTAKE_RECEIVED",
    },
    createdAt: "2024-01-16T09:00:00Z",
  },
];

const activityIcons: Record<ActivityItem["type"], React.ReactNode> = {
  status_change: <RefreshCw className="w-4 h-4" />,
  document_uploaded: <FileText className="w-4 h-4" />,
  checklist_update: <CheckCircle className="w-4 h-4" />,
  assignment: <UserPlus className="w-4 h-4" />,
  quote_created: <Euro className="w-4 h-4" />,
  quote_approved: <CheckCircle className="w-4 h-4" />,
  delivery_scheduled: <Truck className="w-4 h-4" />,
  delivery_completed: <Truck className="w-4 h-4" />,
  note_added: <FileText className="w-4 h-4" />,
  cpam_submission: <Send className="w-4 h-4" />,
};

const activityColors: Record<ActivityItem["type"], string> = {
  status_change: "bg-blue-100 text-blue-600",
  document_uploaded: "bg-purple-100 text-purple-600",
  checklist_update: "bg-green-100 text-green-600",
  assignment: "bg-amber-100 text-amber-600",
  quote_created: "bg-cyan-100 text-cyan-600",
  quote_approved: "bg-green-100 text-green-600",
  delivery_scheduled: "bg-indigo-100 text-indigo-600",
  delivery_completed: "bg-green-100 text-green-600",
  note_added: "bg-neutral-100 text-neutral-600",
  cpam_submission: "bg-primary-100 text-primary-600",
};

export function CaseActivity({
  caseId,
  activities = mockActivities,
}: CaseActivityProps) {
  const t = useTranslations("admin.caseDetail");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Historique d'activité
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune activité enregistrée</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200" />

            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-4 pl-2">
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      activityColors[activity.type]
                    }`}
                  >
                    {activityIcons[activity.type]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm text-neutral-900">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{activity.userName}</span>
                          </div>
                          <span>·</span>
                          <span>
                            {new Date(activity.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
