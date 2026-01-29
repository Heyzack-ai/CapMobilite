"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Receipt,
  Search,
  Filter,
  Euro,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockClaims, mockQuotes } from "@/lib/mocks/data/products";
import { getCaseById } from "@/lib/mocks/data/cases";

export default function AdminBillingPage() {
  const t = useTranslations("admin.billing");

  const claimStatusLabels: Record<string, string> = {
    DRAFT: "Brouillon",
    SUBMITTED: "Soumis",
    PENDING_RESPONSE: "En attente",
    APPROVED: "Approuvé",
    PARTIALLY_APPROVED: "Partiellement approuvé",
    REJECTED: "Rejeté",
    PAID: "Payé",
  };

  const claimStatusColors: Record<string, string> = {
    DRAFT: "secondary",
    SUBMITTED: "info",
    PENDING_RESPONSE: "warning",
    APPROVED: "success",
    PARTIALLY_APPROVED: "warning",
    REJECTED: "error",
    PAID: "success",
  };

  const totalClaimed = mockClaims.reduce((sum, c) => sum + c.amountClaimed, 0);
  const totalApproved = mockClaims
    .filter((c) => c.amountApproved)
    .reduce((sum, c) => sum + (c.amountApproved || 0), 0);
  const pendingAmount = mockClaims
    .filter((c) => ["SUBMITTED", "PENDING_RESPONSE"].includes(c.status))
    .reduce((sum, c) => sum + c.amountClaimed, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.totalClaimed")}</p>
            <p className="text-2xl font-bold">{totalClaimed.toLocaleString("fr-FR")} &euro;</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.approved")}</p>
            <p className="text-2xl font-bold text-success">
              {totalApproved.toLocaleString("fr-FR")} &euro;
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.pending")}</p>
            <p className="text-2xl font-bold text-warning">
              {pendingAmount.toLocaleString("fr-FR")} &euro;
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.claims")}</p>
            <p className="text-2xl font-bold">{mockClaims.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="claims">
        <TabsList>
          <TabsTrigger value="claims">{t("tabs.claims")}</TabsTrigger>
          <TabsTrigger value="quotes">{t("tabs.quotes")}</TabsTrigger>
        </TabsList>

        {/* Claims Tab */}
        <TabsContent value="claims" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("claims.title")}</CardTitle>
                  <CardDescription>{t("claims.description")}</CardDescription>
                </div>
                <Button>
                  <Receipt className="w-4 h-4 mr-2" />
                  {t("claims.newClaim")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockClaims.map((claim) => {
                  const caseData = getCaseById(claim.caseId);

                  return (
                    <div
                      key={claim.id}
                      className="p-4 border rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{claim.claimNumber}</h3>
                            <Badge
                              variant={claimStatusColors[claim.status] as "default" | "success" | "warning" | "error" | "info" | "secondary"}
                            >
                              {claimStatusLabels[claim.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-500 mt-1">
                            {t("claims.case")}: {caseData?.caseNumber || claim.caseId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {claim.amountClaimed.toLocaleString("fr-FR")} &euro;
                          </p>
                          {claim.amountApproved !== undefined && (
                            <p className="text-sm text-success">
                              {t("claims.approved")}: {claim.amountApproved.toLocaleString("fr-FR")} &euro;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-sm text-neutral-500">
                        {claim.submittedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {t("claims.submitted")}: {new Date(claim.submittedAt).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                        {claim.responseAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {t("claims.response")}: {new Date(claim.responseAt).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>

                      {claim.rejectionReason && (
                        <div className="mt-3 p-2 bg-error/5 border border-error/20 rounded text-sm text-error">
                          <XCircle className="w-4 h-4 inline mr-1" />
                          {claim.rejectionReason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("quotes.title")}</CardTitle>
                  <CardDescription>{t("quotes.description")}</CardDescription>
                </div>
                <Button>
                  <Euro className="w-4 h-4 mr-2" />
                  {t("quotes.newQuote")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockQuotes.map((quote) => {
                  const caseData = getCaseById(quote.caseId);
                  const statusLabels: Record<string, string> = {
                    DRAFT: "Brouillon",
                    SENT: "Envoyé",
                    APPROVED: "Approuvé",
                    SUPERSEDED: "Remplacé",
                    EXPIRED: "Expiré",
                  };
                  const statusColors: Record<string, string> = {
                    DRAFT: "secondary",
                    SENT: "info",
                    APPROVED: "success",
                    SUPERSEDED: "warning",
                    EXPIRED: "error",
                  };

                  return (
                    <div
                      key={quote.id}
                      className="p-4 border rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {t("quotes.quote")} #{quote.id}
                            </h3>
                            <Badge
                              variant={statusColors[quote.status] as "default" | "success" | "warning" | "error" | "info" | "secondary"}
                            >
                              {statusLabels[quote.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-500 mt-1">
                            {t("quotes.case")}: {caseData?.caseNumber || quote.caseId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-neutral-500">
                            {t("quotes.lppr")}: {quote.totalLPPR.toLocaleString("fr-FR")} &euro;
                          </p>
                          <p className="text-lg font-bold">
                            {t("quotes.patient")}: {quote.totalPatient.toLocaleString("fr-FR")} &euro;
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500">
                        <span>{t("quotes.items")}: {quote.items.length}</span>
                        <span>
                          {t("quotes.validUntil")}: {new Date(quote.validUntil).toLocaleDateString("fr-FR")}
                        </span>
                        {quote.approvedAt && (
                          <span className="text-success">
                            {t("quotes.approvedOn")}: {new Date(quote.approvedAt).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
