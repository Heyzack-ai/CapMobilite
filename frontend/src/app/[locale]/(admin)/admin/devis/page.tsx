"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Euro,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  Download,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockCases, getAllCases } from "@/lib/mocks/data/cases";
import { findPatientById } from "@/lib/mocks/data/users";

interface Quote {
  id: string;
  quoteNumber: string;
  caseId: string;
  patientId: string;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";
  totalAmount: number;
  cpamAmount: number;
  mutuelleAmount: number;
  patientAmount: number;
  validUntil: string;
  createdAt: string;
  sentAt?: string;
  approvedAt?: string;
}

// Mock quotes data
const mockQuotes: Quote[] = [
  {
    id: "quote-1",
    quoteNumber: "DEV-2024-001",
    caseId: "case-1",
    patientId: "user-1",
    status: "APPROVED",
    totalAmount: 5500,
    cpamAmount: 3850,
    mutuelleAmount: 1375,
    patientAmount: 275,
    validUntil: "2024-03-15",
    createdAt: "2024-02-01",
    sentAt: "2024-02-02",
    approvedAt: "2024-02-10",
  },
  {
    id: "quote-2",
    quoteNumber: "DEV-2024-002",
    caseId: "case-2",
    patientId: "patient-1",
    status: "SENT",
    totalAmount: 3200,
    cpamAmount: 2240,
    mutuelleAmount: 800,
    patientAmount: 160,
    validUntil: "2024-03-20",
    createdAt: "2024-02-05",
    sentAt: "2024-02-06",
  },
  {
    id: "quote-3",
    quoteNumber: "DEV-2024-003",
    caseId: "case-3",
    patientId: "patient-2",
    status: "DRAFT",
    totalAmount: 8750,
    cpamAmount: 6125,
    mutuelleAmount: 2187.5,
    patientAmount: 437.5,
    validUntil: "2024-04-01",
    createdAt: "2024-02-10",
  },
  {
    id: "quote-4",
    quoteNumber: "DEV-2024-004",
    caseId: "case-4",
    patientId: "patient-3",
    status: "REJECTED",
    totalAmount: 4200,
    cpamAmount: 2940,
    mutuelleAmount: 1050,
    patientAmount: 210,
    validUntil: "2024-02-28",
    createdAt: "2024-01-28",
    sentAt: "2024-01-29",
  },
];

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  APPROVED: "Approuvé",
  REJECTED: "Refusé",
  EXPIRED: "Expiré",
};

const statusColors: Record<string, string> = {
  DRAFT: "secondary",
  SENT: "info",
  APPROVED: "success",
  REJECTED: "error",
  EXPIRED: "warning",
};

export default function QuotesPage() {
  const t = useTranslations("admin.quotes");
  const [search, setSearch] = useState("");

  const filteredQuotes = mockQuotes.filter((quote) =>
    quote.quoteNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = mockQuotes.reduce((sum, q) => sum + q.totalAmount, 0);
  const approvedAmount = mockQuotes
    .filter((q) => q.status === "APPROVED")
    .reduce((sum, q) => sum + q.totalAmount, 0);
  const pendingAmount = mockQuotes
    .filter((q) => q.status === "SENT")
    .reduce((sum, q) => sum + q.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t("newQuote")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{t("totalQuotes")}</p>
                <p className="text-2xl font-bold mt-1">{mockQuotes.length}</p>
              </div>
              <FileText className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{t("totalValue")}</p>
                <p className="text-2xl font-bold mt-1">{totalAmount.toLocaleString("fr-FR")} €</p>
              </div>
              <Euro className="w-8 h-8 text-secondary-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/50 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{t("approved")}</p>
                <p className="text-2xl font-bold mt-1 text-success">{approvedAmount.toLocaleString("fr-FR")} €</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-info/50 bg-info/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{t("pending")}</p>
                <p className="text-2xl font-bold mt-1 text-info">{pendingAmount.toLocaleString("fr-FR")} €</p>
              </div>
              <Clock className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {t("filters")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("quoteNumber")}</TableHead>
                <TableHead>{t("patient")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{t("breakdown")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => {
                const patient = findPatientById(quote.patientId);

                return (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <p className="font-medium">{quote.quoteNumber}</p>
                      <p className="text-sm text-neutral-500">
                        {new Date(quote.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">
                        {patient?.firstName} {patient?.lastName}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">{quote.totalAmount.toLocaleString("fr-FR")} €</p>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <p>CPAM: {quote.cpamAmount.toLocaleString("fr-FR")} €</p>
                        <p>Mutuelle: {quote.mutuelleAmount.toLocaleString("fr-FR")} €</p>
                        <p className="font-medium">RAC: {quote.patientAmount.toLocaleString("fr-FR")} €</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[quote.status] as "default" | "success" | "warning" | "error" | "info" | "secondary"}>
                        {statusLabels[quote.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        {quote.status === "DRAFT" && (
                          <Button variant="ghost" size="sm">
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredQuotes.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p className="text-neutral-500">{t("noQuotesFound")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
