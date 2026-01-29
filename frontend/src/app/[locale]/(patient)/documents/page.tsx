"use client";

import { useTranslations } from "next-intl";
import { FileText, Upload, Download, CheckCircle, Clock, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth.store";
import { mockDocuments } from "@/lib/mocks/data/products";

export default function DocumentsPage() {
  const t = useTranslations("patient.documents");
  const { user } = useAuthStore();

  // Filter documents by user
  const documents = mockDocuments.filter((doc) => doc.uploadedById === user?.id);

  const documentTypeLabels: Record<string, string> = {
    PRESCRIPTION: "Ordonnance",
    ID_CARD: "Carte d'identité",
    CARTE_VITALE: "Carte Vitale",
    PROOF_OF_ADDRESS: "Justificatif de domicile",
    QUOTE: "Devis",
    QUOTE_SIGNED: "Devis signé",
    DELIVERY_PROOF: "Preuve de livraison",
    CLINICAL_NOTES: "Notes cliniques",
    OTHER: "Autre",
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType === "application/pdf") return "pdf";
    return "file";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          {t("upload")}
        </Button>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/50 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 mx-auto mb-3 text-neutral-400" />
            <p className="font-medium text-neutral-700">{t("dropzone")}</p>
            <p className="text-sm text-neutral-500 mt-1">{t("dropzoneDescription")}</p>
            <Button variant="outline" size="sm" className="mt-4">
              {t("browse")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("myDocuments")}</CardTitle>
          <CardDescription>{t("myDocumentsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-neutral-900">{t("noDocuments")}</h3>
              <p className="mt-1">{t("noDocumentsDescription")}</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.filename}</p>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <span>{documentTypeLabels[doc.type] || doc.type}</span>
                        <span>&middot;</span>
                        <span>{(doc.size / 1024).toFixed(0)} KB</span>
                        <span>&middot;</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant={doc.scanStatus === "CLEAN" ? "success" : doc.scanStatus === "PENDING" ? "warning" : "error"}
                      className="gap-1"
                    >
                      {doc.scanStatus === "CLEAN" ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          {t("verified")}
                        </>
                      ) : doc.scanStatus === "PENDING" ? (
                        <>
                          <Clock className="w-3 h-3" />
                          {t("pending")}
                        </>
                      ) : (
                        t("error")
                      )}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-error hover:text-error">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-primary-50 border-primary-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-primary-900">{t("infoTitle")}</h3>
          <ul className="mt-2 space-y-1 text-sm text-primary-700">
            <li>&bull; {t("infoItem1")}</li>
            <li>&bull; {t("infoItem2")}</li>
            <li>&bull; {t("infoItem3")}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
