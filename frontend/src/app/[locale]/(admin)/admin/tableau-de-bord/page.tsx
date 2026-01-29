"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  FolderOpen,
  Wrench,
  Receipt,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  Euro,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  useAdminDashboardStats,
  useCases,
} from "@/lib/api/hooks";
import { caseStatusLabels, caseStatusColors } from "@/lib/mocks/data/cases";
import { mockTickets } from "@/lib/mocks/data/devices";

// Types for dashboard stats (matches API response)
interface ApiDashboardStats {
  cases: {
    total: number;
    byStatus: Record<string, number>;
    averageProcessingDays: number;
  };
  claims: {
    total: number;
    totalAmount: number;
    pendingAmount: number;
    acceptedAmount: number;
  };
  tickets: {
    total: number;
    open: number;
    critical: number;
  };
  devices: {
    total: number;
    delivered: number;
  };
}

// Transformed stats for UI
interface DashboardStats {
  openCases: number;
  openCasesChange: number;
  openTickets: number;
  criticalTickets: number;
  pendingClaims: number;
  pendingClaimsAmount: number;
  monthlyRevenue: number;
  revenueChange: number;
  casesByStatus: Record<string, number>;
  totalCases: number;
}

export default function AdminDashboard() {
  const t = useTranslations("admin.dashboard");

  // API hooks
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    refetch: refetchStats 
  } = useAdminDashboardStats();
  const { data: casesData, isLoading: casesLoading } = useCases({ limit: 5 });

  // Transform API stats to UI format with fallbacks
  const apiStats = statsData as ApiDashboardStats | undefined;
  const stats: DashboardStats = {
    openCases: apiStats?.cases?.total ?? 0,
    openCasesChange: 0, // Not provided by API, could be computed
    openTickets: apiStats?.tickets?.open ?? 0,
    criticalTickets: apiStats?.tickets?.critical ?? 0,
    pendingClaims: apiStats?.claims?.total ?? 0,
    pendingClaimsAmount: apiStats?.claims?.pendingAmount ?? 0,
    monthlyRevenue: apiStats?.claims?.acceptedAmount ?? 0,
    revenueChange: 0, // Not provided by API, could be computed
    casesByStatus: apiStats?.cases?.byStatus ?? {},
    totalCases: apiStats?.cases?.total ?? 0,
  };
  
  const recentCases = casesData?.data || [];
  const openTickets = mockTickets.filter(
    (t) => !["RESOLVED", "CLOSED"].includes(t.status)
  );

  const isLoading = statsLoading || casesLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetchStats()}
          disabled={statsLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
          {t("refresh")}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{t("stats.openCases")}</p>
                  <p className="text-3xl font-bold mt-1">{stats.openCases}</p>
                  <p className={`text-sm mt-1 ${stats.openCasesChange >= 0 ? 'text-success' : 'text-error'}`}>
                    {stats.openCasesChange >= 0 ? '+' : ''}{stats.openCasesChange} {t("stats.fromYesterday")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{t("stats.openTickets")}</p>
                  <p className="text-3xl font-bold mt-1">{stats.openTickets}</p>
                  <p className="text-sm text-warning mt-1">
                    {stats.criticalTickets} {t("stats.critical")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-warning" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{t("stats.pendingClaims")}</p>
                  <p className="text-3xl font-bold mt-1">{stats.pendingClaims}</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {stats.pendingClaimsAmount.toLocaleString("fr-FR")} &euro;
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-secondary-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {statsLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{t("stats.revenue")}</p>
                  <p className="text-3xl font-bold mt-1">{stats.monthlyRevenue.toLocaleString("fr-FR")} &euro;</p>
                  <p className={`text-sm mt-1 flex items-center gap-1 ${stats.revenueChange >= 0 ? 'text-success' : 'text-error'}`}>
                    <TrendingUp className="w-3 h-3" />
                    {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}% {t("stats.vsLastMonth")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Euro className="w-6 h-6 text-success" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cases by Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t("casesByStatus")}</CardTitle>
          <CardDescription>{t("casesByStatusDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats.casesByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center gap-4">
                  <Badge
                    variant={caseStatusColors[status as keyof typeof caseStatusColors] as "default" | "success" | "warning" | "error" | "info" | "secondary"}
                    className="w-40 justify-center"
                  >
                    {caseStatusLabels[status as keyof typeof caseStatusLabels] || status}
                  </Badge>
                  <div className="flex-1">
                    <Progress value={stats.totalCases > 0 ? (count / stats.totalCases) * 100 : 0} />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              ))}
              {Object.keys(stats.casesByStatus).length === 0 && (
                <p className="text-center text-neutral-500">{t("noData")}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>{t("recentCases")}</CardTitle>
              <CardDescription>{t("recentCasesDescription")}</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/dossiers">
                {t("viewAll")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {casesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : recentCases.length === 0 ? (
              <p className="text-center text-neutral-500 py-8">{t("noCases")}</p>
            ) : (
              <div className="space-y-3">
                {recentCases.map((caseItem: { id: string; caseNumber: string; createdAt: string; status: string; priority?: string }) => (
                  <Link
                    key={caseItem.id}
                    href={`/admin/dossiers/${caseItem.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-neutral-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{caseItem.caseNumber}</p>
                      <p className="text-sm text-neutral-500">
                        {new Date(caseItem.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {caseItem.priority === "URGENT" && (
                        <AlertTriangle className="w-4 h-4 text-error" />
                      )}
                      <Badge
                        variant={caseStatusColors[caseItem.status as keyof typeof caseStatusColors] as "default" | "success" | "warning" | "error" | "info" | "secondary"}
                      >
                        {caseStatusLabels[caseItem.status as keyof typeof caseStatusLabels] || caseItem.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>{t("serviceTickets")}</CardTitle>
              <CardDescription>{t("serviceTicketsDescription")}</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/sav">
                {t("viewAll")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTickets.slice(0, 5).map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/admin/sav/${ticket.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-neutral-50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{ticket.category}</p>
                    <p className="text-sm text-neutral-500 line-clamp-1">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {ticket.isSafetyIssue && (
                      <AlertTriangle className="w-4 h-4 text-error" />
                    )}
                    <Badge
                      variant={
                        ticket.severity === "CRITICAL"
                          ? "error"
                          : ticket.severity === "HIGH"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {ticket.severity}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/admin/dossiers">
                <FolderOpen className="w-5 h-5" />
                <span>{t("actions.manageCases")}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/admin/devis">
                <Receipt className="w-5 h-5" />
                <span>{t("actions.createQuote")}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/admin/sav">
                <Wrench className="w-5 h-5" />
                <span>{t("actions.manageTickets")}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/admin/utilisateurs">
                <Users className="w-5 h-5" />
                <span>{t("actions.manageUsers")}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
