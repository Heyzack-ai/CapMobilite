"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import {
  FolderOpen,
  Search,
  Filter,
  ChevronDown,
  AlertTriangle,
  Clock,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllCases, caseStatusLabels, caseStatusColors } from "@/lib/mocks/data/cases";
import { findPatientById } from "@/lib/mocks/data/users";

export default function AdminCasesPage() {
  const t = useTranslations("admin.cases");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const cases = getAllCases();

  const filteredCases = cases.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQuery) {
      const patient = findPatientById(c.patientId);
      const searchLower = searchQuery.toLowerCase();
      return (
        c.caseNumber.toLowerCase().includes(searchLower) ||
        patient?.firstName.toLowerCase().includes(searchLower) ||
        patient?.lastName.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const priorityColors = {
    LOW: "secondary",
    NORMAL: "default",
    HIGH: "warning",
    URGENT: "error",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder={t("search")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t("filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                {Object.entries(caseStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.caseNumber")}</TableHead>
                <TableHead>{t("table.patient")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.priority")}</TableHead>
                <TableHead>{t("table.created")}</TableHead>
                <TableHead>{t("table.sla")}</TableHead>
                <TableHead>{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((caseItem) => {
                const patient = findPatientById(caseItem.patientId);
                const slaExpired = caseItem.slaDeadline && new Date(caseItem.slaDeadline) < new Date();

                return (
                  <TableRow key={caseItem.id}>
                    <TableCell>
                      <Link
                        href={`/admin/dossiers/${caseItem.id}`}
                        className="font-medium text-primary-600 hover:underline"
                      >
                        {caseItem.caseNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-neutral-500" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {patient?.firstName} {patient?.lastName}
                          </p>
                          <p className="text-sm text-neutral-500">{patient?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={caseStatusColors[caseItem.status] as "default" | "success" | "warning" | "error" | "info" | "secondary"}
                      >
                        {caseStatusLabels[caseItem.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={priorityColors[caseItem.priority] as "default" | "warning" | "error" | "secondary"}
                      >
                        {caseItem.priority === "URGENT" && (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {caseItem.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-500">
                      {new Date(caseItem.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      {caseItem.slaDeadline ? (
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            slaExpired ? "text-error" : "text-neutral-500"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          {new Date(caseItem.slaDeadline).toLocaleDateString("fr-FR")}
                        </div>
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/dossiers/${caseItem.id}`}>
                          {t("table.view")}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredCases.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t("noCases")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
