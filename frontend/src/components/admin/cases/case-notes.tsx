"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Plus, Lock, Globe, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  isInternal: boolean;
  createdAt: string;
}

interface CaseNotesProps {
  caseId: string;
  notes?: Note[];
  onAddNote?: (content: string, isInternal: boolean) => void;
}

// Mock notes for display
const mockNotes: Note[] = [
  {
    id: "note-1",
    content:
      "Patient contacté par téléphone pour confirmer la réception des documents. Tout est en ordre.",
    authorId: "user-3",
    authorName: "Pierre Bernard",
    isInternal: true,
    createdAt: "2024-01-18T14:30:00Z",
  },
  {
    id: "note-2",
    content:
      "Ordonnance vérifiée et conforme aux exigences LPPR. Dossier prêt pour établissement du devis.",
    authorId: "user-2",
    authorName: "Marie Martin",
    isInternal: true,
    createdAt: "2024-01-17T10:15:00Z",
  },
  {
    id: "note-3",
    content:
      "Le patient préfère une livraison en matinée si possible. À noter pour la planification.",
    authorId: "user-3",
    authorName: "Pierre Bernard",
    isInternal: false,
    createdAt: "2024-01-16T16:45:00Z",
  },
];

export function CaseNotes({ caseId, notes = mockNotes, onAddNote }: CaseNotesProps) {
  const t = useTranslations("admin.caseDetail.notes");
  const [newNote, setNewNote] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      if (onAddNote) {
        await onAddNote(newNote, isInternal);
      }
      setNewNote("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Note Form */}
        <div className="space-y-3 mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <Textarea
            placeholder={t("placeholder")}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="internal-note"
                checked={isInternal}
                onCheckedChange={(checked) => setIsInternal(checked as boolean)}
              />
              <label
                htmlFor="internal-note"
                className="text-sm text-neutral-600 flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                {t("internal")}
              </label>
            </div>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newNote.trim() || isSubmitting}
            >
              <Plus className="w-4 h-4 mr-1" />
              {t("addNote")}
            </Button>
          </div>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t("noNotes")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg border ${
                  note.isInternal
                    ? "bg-amber-50/50 border-amber-200"
                    : "bg-white border-neutral-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <div className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-neutral-500" />
                    </div>
                    <span className="font-medium text-neutral-700">
                      {note.authorName}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(note.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <Badge
                    variant={note.isInternal ? "warning" : "secondary"}
                    className="text-xs"
                  >
                    {note.isInternal ? (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Interne
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 mr-1" />
                        Visible
                      </>
                    )}
                  </Badge>
                </div>
                <p className="mt-2 text-neutral-700 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
