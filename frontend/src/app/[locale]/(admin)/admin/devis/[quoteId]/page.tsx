"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Send,
  Download,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { QuoteHeader } from "@/components/admin/quotes/quote-header";
import { QuoteLineItems } from "@/components/admin/quotes/quote-line-items";
import { QuoteTotals } from "@/components/admin/quotes/quote-totals";
import { AddLineItemModal } from "@/components/admin/quotes/add-line-item-modal";

// Mock detailed quote data
interface QuoteLineItem {
  id: string;
  productId: string;
  productName: string;
  lpprCode: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuoteHistory {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  user: string;
}

interface DetailedQuote {
  id: string;
  quoteNumber: string;
  caseId: string;
  caseNumber: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";
  totalAmount: number;
  cpamAmount: number;
  mutuelleAmount: number;
  patientAmount: number;
  validUntil: string;
  createdAt: string;
  sentAt?: string;
  approvedAt?: string;
  lineItems: QuoteLineItem[];
  history: QuoteHistory[];
}

const mockDetailedQuotes: Record<string, DetailedQuote> = {
  "quote-1": {
    id: "quote-1",
    quoteNumber: "DEV-2024-001",
    caseId: "case-1",
    caseNumber: "CAP-2024-0001",
    patientId: "user-1",
    patientName: "Jean Dupont",
    patientEmail: "jean.dupont@email.fr",
    status: "APPROVED",
    totalAmount: 5500,
    cpamAmount: 3850,
    mutuelleAmount: 1375,
    patientAmount: 275,
    validUntil: "2024-03-15",
    createdAt: "2024-02-01",
    sentAt: "2024-02-02",
    approvedAt: "2024-02-10",
    lineItems: [
      {
        id: "item-1",
        productId: "product-2",
        productName: "ElectroDrive Pro",
        lpprCode: "4012001",
        quantity: 1,
        unitPrice: 4500,
        total: 4500,
      },
      {
        id: "item-2",
        productId: "product-2",
        productName: "Batterie supplementaire lithium-ion",
        lpprCode: "4012002",
        quantity: 1,
        unitPrice: 450,
        total: 450,
      },
      {
        id: "item-3",
        productId: "product-2",
        productName: "Coussin anti-escarres premium",
        lpprCode: "4012003",
        quantity: 1,
        unitPrice: 550,
        total: 550,
      },
    ],
    history: [
      {
        id: "h-1",
        action: "CREATED",
        description: "Devis cree",
        timestamp: "2024-02-01T10:00:00Z",
        user: "Pierre Bernard",
      },
      {
        id: "h-2",
        action: "SENT",
        description: "Devis envoye au patient",
        timestamp: "2024-02-02T14:30:00Z",
        user: "Pierre Bernard",
      },
      {
        id: "h-3",
        action: "APPROVED",
        description: "Devis approuve par le patient",
        timestamp: "2024-02-10T09:15:00Z",
        user: "Jean Dupont",
      },
    ],
  },
  "quote-2": {
    id: "quote-2",
    quoteNumber: "DEV-2024-002",
    caseId: "case-2",
    caseNumber: "CAP-2024-0002",
    patientId: "patient-1",
    patientName: "Sophie Laurent",
    patientEmail: "sophie.laurent@email.fr",
    status: "SENT",
    totalAmount: 3200,
    cpamAmount: 2240,
    mutuelleAmount: 800,
    patientAmount: 160,
    validUntil: "2024-03-20",
    createdAt: "2024-02-05",
    sentAt: "2024-02-06",
    lineItems: [
      {
        id: "item-4",
        productId: "product-1",
        productName: "FreedomLite X1",
        lpprCode: "4011001",
        quantity: 1,
        unitPrice: 1200,
        total: 1200,
      },
      {
        id: "item-5",
        productId: "product-1",
        productName: "Kit accessoires confort",
        lpprCode: "4011002",
        quantity: 1,
        unitPrice: 800,
        total: 800,
      },
      {
        id: "item-6",
        productId: "product-1",
        productName: "Housse de protection",
        lpprCode: "4011003",
        quantity: 2,
        unitPrice: 600,
        total: 1200,
      },
    ],
    history: [
      {
        id: "h-4",
        action: "CREATED",
        description: "Devis cree",
        timestamp: "2024-02-05T11:00:00Z",
        user: "Marie Martin",
      },
      {
        id: "h-5",
        action: "SENT",
        description: "Devis envoye au patient",
        timestamp: "2024-02-06T09:00:00Z",
        user: "Marie Martin",
      },
    ],
  },
  "quote-3": {
    id: "quote-3",
    quoteNumber: "DEV-2024-003",
    caseId: "case-3",
    caseNumber: "CAP-2024-0003",
    patientId: "patient-2",
    patientName: "Michel Leroy",
    patientEmail: "michel.leroy@email.fr",
    status: "DRAFT",
    totalAmount: 8750,
    cpamAmount: 6125,
    mutuelleAmount: 2187.5,
    patientAmount: 437.5,
    validUntil: "2024-04-01",
    createdAt: "2024-02-10",
    lineItems: [
      {
        id: "item-7",
        productId: "product-3",
        productName: "TerrainMaster 4x4",
        lpprCode: "4013001",
        quantity: 1,
        unitPrice: 6800,
        total: 6800,
      },
      {
        id: "item-8",
        productId: "product-3",
        productName: "Pack tout-terrain premium",
        lpprCode: "4013002",
        quantity: 1,
        unitPrice: 1950,
        total: 1950,
      },
    ],
    history: [
      {
        id: "h-6",
        action: "CREATED",
        description: "Devis cree",
        timestamp: "2024-02-10T16:00:00Z",
        user: "Pierre Bernard",
      },
    ],
  },
};

export default function QuoteDetailPage() {
  const t = useTranslations("admin.quoteDetail");
  const params = useParams();
  const quoteId = params.quoteId as string;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("lineItems");

  // Get quote data (in real app, this would be fetched)
  const quote = mockDetailedQuotes[quoteId];

  if (!quote) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/devis"
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("back")}
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-neutral-500">{t("notFound")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddLineItem = (item: {
    productId: string;
    productName: string;
    lpprCode: string;
    quantity: number;
    unitPrice: number;
  }) => {
    // In real app, this would update the quote via API
    console.log("Adding line item:", item);
    setIsAddModalOpen(false);
  };

  const handleRemoveLineItem = (itemId: string) => {
    // In real app, this would update the quote via API
    console.log("Removing line item:", itemId);
  };

  const handleSaveDraft = () => {
    // In real app, this would save the draft via API
    console.log("Saving draft");
  };

  const handleSendToPatient = () => {
    // In real app, this would send the quote via API
    console.log("Sending to patient");
  };

  const handleDownloadPDF = () => {
    // In real app, this would generate and download PDF
    console.log("Downloading PDF");
  };

  const handleApprove = () => {
    // In real app, this would approve the quote via API
    console.log("Approving quote");
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin/devis"
        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("back")}
      </Link>

      {/* Quote Header */}
      <QuoteHeader
        quoteNumber={quote.quoteNumber}
        status={quote.status}
        createdAt={quote.createdAt}
        caseNumber={quote.caseNumber}
        patientName={quote.patientName}
        patientEmail={quote.patientEmail}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tabs */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="lineItems" className="flex-1">
                    {t("tabs.lineItems")}
                  </TabsTrigger>
                  <TabsTrigger value="coverage" className="flex-1">
                    {t("tabs.coverage")}
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    {t("tabs.history")}
                  </TabsTrigger>
                </TabsList>

                {/* Line Items Tab */}
                <TabsContent value="lineItems">
                  <QuoteLineItems
                    lineItems={quote.lineItems}
                    onAddItem={() => setIsAddModalOpen(true)}
                    onRemoveItem={handleRemoveLineItem}
                    isEditable={quote.status === "DRAFT"}
                  />
                </TabsContent>

                {/* Coverage Tab */}
                <TabsContent value="coverage">
                  <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">
                          {t("coverage.cpam")}
                        </p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">
                          {quote.cpamAmount.toLocaleString("fr-FR")} EUR
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          {((quote.cpamAmount / quote.totalAmount) * 100).toFixed(0)}% {t("coverage.ofTotal")}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600 font-medium">
                          {t("coverage.mutuelle")}
                        </p>
                        <p className="text-2xl font-bold text-green-700 mt-1">
                          {quote.mutuelleAmount.toLocaleString("fr-FR")} EUR
                        </p>
                        <p className="text-xs text-green-500 mt-1">
                          {((quote.mutuelleAmount / quote.totalAmount) * 100).toFixed(0)}% {t("coverage.ofTotal")}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-600 font-medium">
                        {t("coverage.rac")}
                      </p>
                      <p className="text-3xl font-bold text-orange-700 mt-1">
                        {quote.patientAmount.toLocaleString("fr-FR")} EUR
                      </p>
                      <p className="text-xs text-orange-500 mt-1">
                        {((quote.patientAmount / quote.totalAmount) * 100).toFixed(1)}% {t("coverage.ofTotal")}
                      </p>
                    </div>

                    <div className="p-4 bg-neutral-100 rounded-lg border border-neutral-200">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-neutral-600 font-medium">
                          {t("coverage.total")}
                        </p>
                        <p className="text-2xl font-bold text-neutral-900">
                          {quote.totalAmount.toLocaleString("fr-FR")} EUR
                        </p>
                      </div>
                    </div>

                    {/* Coverage breakdown visualization */}
                    <div className="mt-4">
                      <p className="text-sm text-neutral-500 mb-2">{t("coverage.breakdown")}</p>
                      <div className="h-4 rounded-full overflow-hidden flex">
                        <div
                          className="bg-blue-500"
                          style={{ width: `${(quote.cpamAmount / quote.totalAmount) * 100}%` }}
                          title={`CPAM: ${quote.cpamAmount.toLocaleString("fr-FR")} EUR`}
                        />
                        <div
                          className="bg-green-500"
                          style={{ width: `${(quote.mutuelleAmount / quote.totalAmount) * 100}%` }}
                          title={`Mutuelle: ${quote.mutuelleAmount.toLocaleString("fr-FR")} EUR`}
                        />
                        <div
                          className="bg-orange-500"
                          style={{ width: `${(quote.patientAmount / quote.totalAmount) * 100}%` }}
                          title={`RAC: ${quote.patientAmount.toLocaleString("fr-FR")} EUR`}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-blue-500 rounded" /> CPAM
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-green-500 rounded" /> Mutuelle
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-orange-500 rounded" /> RAC
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history">
                  <div className="space-y-4 pt-4">
                    {quote.history.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="flex gap-4 relative"
                      >
                        {/* Timeline line */}
                        {index < quote.history.length - 1 && (
                          <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-neutral-200" />
                        )}

                        {/* Timeline dot */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              entry.action === "APPROVED"
                                ? "bg-success text-white"
                                : entry.action === "SENT"
                                ? "bg-info text-white"
                                : "bg-neutral-200 text-neutral-600"
                            }`}
                          >
                            {entry.action === "APPROVED" ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <span className="w-2 h-2 bg-current rounded-full" />
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-neutral-900">
                            {entry.description}
                          </p>
                          <p className="text-sm text-neutral-500 mt-1">
                            {entry.user} - {new Date(entry.timestamp).toLocaleString("fr-FR", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {quote.history.length === 0 && (
                      <p className="text-center text-neutral-500 py-8">
                        {t("history.empty")}
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Totals & Actions */}
        <div className="space-y-6">
          <QuoteTotals
            totalAmount={quote.totalAmount}
            cpamAmount={quote.cpamAmount}
            mutuelleAmount={quote.mutuelleAmount}
            patientAmount={quote.patientAmount}
            validUntil={quote.validUntil}
          />

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="font-medium text-neutral-900 mb-4">{t("actions.title")}</p>

              {quote.status === "DRAFT" && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleSaveDraft}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {t("actions.saveDraft")}
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={handleSendToPatient}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {t("actions.sendToPatient")}
                  </Button>
                </>
              )}

              {quote.status === "SENT" && (
                <Button
                  className="w-full justify-start bg-success hover:bg-success/90"
                  onClick={handleApprove}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t("actions.approve")}
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                {t("actions.downloadPDF")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Line Item Modal */}
      <AddLineItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddLineItem}
      />
    </div>
  );
}
