"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Circle,
  Clock,
  Download,
  Euro,
  Truck,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CaseDocuments } from "@/components/patient/case-documents";
import { useCase, useCaseQuote } from "@/lib/api/hooks";
import { caseStatusLabels, caseStatusColors } from "@/lib/mocks/data/cases";

export default function CaseDetailPage() {
  const t = useTranslations("patient.caseDetail");
  const params = useParams();
  const caseId = params.caseId as string;

  // API hooks
  const { data: caseData, isLoading: caseLoading } = useCase(caseId);
  const { data: quote, isLoading: quoteLoading } = useCaseQuote(caseId);

  if (caseLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">{t("notFound")}</h2>
        <Button asChild className="mt-4">
          <Link href="/dossiers">{t("backToList")}</Link>
        </Button>
      </div>
    );
  }

  const checklist = caseData.checklist || [];
  const completedItems = checklist.filter((item: { completedAt?: string }) => item.completedAt).length;
  const progress = checklist.length > 0 ? Math.round((completedItems / checklist.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dossiers">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("back")}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{caseData.caseNumber}</h1>
            <p className="text-neutral-500">
              {t("created")}: {new Date(caseData.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <Badge
          variant={caseStatusColors[caseData.status] as "default" | "success" | "warning" | "error" | "info" | "secondary"}
          className="text-sm px-3 py-1"
        >
          {caseStatusLabels[caseData.status]}
        </Badge>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t("overallProgress")}</h3>
            <span className="text-sm text-neutral-500">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-neutral-500 mt-2">
            {completedItems} {t("of")} {checklist.length} {t("stepsCompleted")}
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="documents">{t("tabs.documents")}</TabsTrigger>
          <TabsTrigger value="quote">{t("tabs.quote")}</TabsTrigger>
          <TabsTrigger value="delivery">{t("tabs.delivery")}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("checklist")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checklist.map((item: { key: string; label: string; completedAt?: string; required?: boolean }, index: number) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      item.completedAt
                        ? "border-success/30 bg-success/5"
                        : "border-neutral-200 bg-neutral-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.completedAt
                          ? "bg-success text-white"
                          : "bg-neutral-200 text-neutral-500"
                      }`}
                    >
                      {item.completedAt ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      {item.completedAt && (
                        <p className="text-sm text-neutral-500">
                          {t("completedOn")} {new Date(item.completedAt).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>
                    {item.required && !item.completedAt && (
                      <Badge variant="warning">{t("required")}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SLA Warning */}
          {caseData.slaDeadline && !["DELIVERED", "CLOSED", "CANCELLED"].includes(caseData.status) && (
            <Card className="mt-6 border-warning/50">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">{t("slaWarning")}</p>
                  <p className="text-sm text-neutral-500">
                    {t("deadline")}: {new Date(caseData.slaDeadline).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
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
                {t("quoteDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!quote ? (
                <div className="text-center py-8 text-neutral-500">
                  <Euro className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t("noQuote")}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge variant={quote.status === "APPROVED" ? "success" : "info"}>
                      {quote.status === "APPROVED" ? t("quoteApproved") : t("quotePending")}
                    </Badge>
                    <p className="text-sm text-neutral-500">
                      {t("validUntil")}: {new Date(quote.validUntil).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  {/* Line Items */}
                  <div className="border rounded-lg divide-y">
                    {quote.items.map((item) => (
                      <div key={item.id} className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-neutral-500">Code LPPR: {item.lpprCode}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.unitPrice.toLocaleString("fr-FR")} &euro;</p>
                            <p className="text-sm text-neutral-500">x{item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">{t("cpamCoverage")}</span>
                      <span className="font-medium text-success">
                        {quote.totalLPPR.toLocaleString("fr-FR")} &euro;
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">{t("yourCost")}</span>
                      <span className="font-bold text-lg">
                        {quote.totalPatient.toLocaleString("fr-FR")} &euro;
                      </span>
                    </div>
                  </div>

                  {quote.status !== "APPROVED" && (
                    <Button className="w-full">{t("approveQuote")}</Button>
                  )}
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
                {t("deliveryInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!["DELIVERY_SCHEDULED", "DELIVERED"].includes(caseData.status) ? (
                <div className="text-center py-8 text-neutral-500">
                  <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t("noDelivery")}</p>
                  <p className="text-sm mt-2">{t("deliveryAfterApproval")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30">
                    <CheckCircle className="w-6 h-6 text-success" />
                    <div>
                      <p className="font-medium text-success">{t("deliveryComplete")}</p>
                      <p className="text-sm text-neutral-500">
                        {t("deliveredOn")}: {new Date(caseData.updatedAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
