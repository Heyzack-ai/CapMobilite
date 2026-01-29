"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  MoreVertical,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockUsers, mockPatients } from "@/lib/mocks/data/users";

export default function AdminUsersPage() {
  const t = useTranslations("admin.users");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allUsers = [...mockUsers, ...mockPatients.filter((p) => !mockUsers.find((u) => u.id === p.id))];

  const filteredUsers = allUsers.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const roleLabels: Record<string, string> = {
    PATIENT: "Patient",
    ADMIN: "Administrateur",
    OPS_AGENT: "Agent Ops",
    BILLING_AGENT: "Agent Facturation",
    TECHNICIAN: "Technicien",
    PRESCRIBER: "Prescripteur",
  };

  const roleColors: Record<string, string> = {
    PATIENT: "secondary",
    ADMIN: "error",
    OPS_AGENT: "info",
    BILLING_AGENT: "warning",
    TECHNICIAN: "success",
    PRESCRIBER: "default",
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
          <Users className="w-4 h-4 mr-2" />
          {t("addUser")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.total")}</p>
            <p className="text-2xl font-bold">{allUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.patients")}</p>
            <p className="text-2xl font-bold">
              {allUsers.filter((u) => u.role === "PATIENT").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.staff")}</p>
            <p className="text-2xl font-bold">
              {allUsers.filter((u) => u.role !== "PATIENT").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-500">{t("stats.verified")}</p>
            <p className="text-2xl font-bold text-success">
              {allUsers.filter((u) => u.emailVerified).length}
            </p>
          </CardContent>
        </Card>
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t("filterByRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allRoles")}</SelectItem>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-neutral-50">
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.user")}
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.contact")}
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.role")}
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.status")}
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.security")}
                  </th>
                  <th className="text-left p-4 font-medium text-neutral-500">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-neutral-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-neutral-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3 text-neutral-400" />
                          {user.email}
                        </p>
                        <p className="flex items-center gap-1 text-sm text-neutral-500">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          {user.phone}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={roleColors[user.role] as "default" | "success" | "warning" | "error" | "info" | "secondary"}>
                        {roleLabels[user.role]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1 text-sm">
                          {user.emailVerified ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-error" />
                          )}
                          Email
                        </p>
                        <p className="flex items-center gap-1 text-sm">
                          {user.phoneVerified ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-error" />
                          )}
                          Téléphone
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Shield
                          className={`w-4 h-4 ${
                            user.mfaEnabled ? "text-success" : "text-neutral-300"
                          }`}
                        />
                        <span className="text-sm">
                          {user.mfaEnabled ? "MFA actif" : "MFA inactif"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t("noUsers")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
