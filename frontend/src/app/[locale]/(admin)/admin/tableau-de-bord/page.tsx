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
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getAllCases, caseStatusLabels, caseStatusColors } from "@/lib/mocks/data/cases";
import { mockTickets } from "@/lib/mocks/data/devices";
import { mockClaims } from "@/lib/mocks/data/products";

export default function AdminDashboard() {
  const t = useTranslations("admin.dashboard");

  const cases = getAllCases();
  const openCases = cases.filter(
    (c) => !["DELIVERED", "CLOSED", "CANCELLED"].includes(c.status)
  );
  const openTickets = mockTickets.filter(
    (t) => !["RESOLVED", "CLOSED"].includes(t.status)
  );
  const pendingClaims = mockClaims.filter(
    (c) => !["PAID", "REJECTED"].includes(c.status)
  );

  // Case status distribution
  const statusCounts = cases.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{t("stats.openCases")}</p>
                <p className="text-3xl font-bold mt-1">{openCases.length}</p>
                <p className="text-sm text-success mt-1">
                  +2 {t("stats.fromYesterday")}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{t("stats.openTickets")}</p>
                <p className="text-3xl font-bold mt-1">{openTickets.length}</p>
                <p className="text-sm text-warning mt-1">
                  1 {t("stats.critical")}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{t("stats.pendingClaims")}</p>
                <p className="text-3xl font-bold mt-1">{pendingClaims.length}</p>
                <p className="text-sm text-neutral-500 mt-1">
                  {pendingClaims.reduce((sum, c) => sum + c.amountClaimed, 0).toLocaleString("fr-FR")} &euro;
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{t("stats.revenue")}</p>
                <p className="text-3xl font-bold mt-1">8 750 &euro;</p>
                <p className="text-sm text-success mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% {t("stats.vsLastMonth")}
                </p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <Euro className="w-6 h-6 text-success" />
              </div>
            </div>
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
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-4">
                <Badge
                  variant={caseStatusColors[status as keyof typeof caseStatusColors] as "default" | "success" | "warning" | "error" | "info" | "secondary"}
                  className="w-40 justify-center"
                >
                  {caseStatusLabels[status as keyof typeof caseStatusLabels]}
                </Badge>
                <div className="flex-1">
                  <Progress value={(count / cases.length) * 100} />
                </div>
                <span className="text-sm font-medium w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
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
            <div className="space-y-3">
              {cases.slice(0, 5).map((caseItem) => (
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
                      variant={caseStatusColors[caseItem.status] as "default" | "success" | "warning" | "error" | "info" | "secondary"}
                    >
                      {caseStatusLabels[caseItem.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
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
