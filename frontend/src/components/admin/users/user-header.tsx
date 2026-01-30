"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types";

type UserStatus = "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | "DEACTIVATED";

interface UserHeaderProps {
  user: User & { status?: UserStatus };
}

export function UserHeader({ user }: UserHeaderProps) {
  const t = useTranslations("admin.userDetail");

  const roleLabels: Record<string, string> = {
    PATIENT: t("roles.patient"),
    PRESCRIBER: t("roles.prescriber"),
    OPS_AGENT: t("roles.ops"),
    BILLING_AGENT: t("roles.billing"),
    TECHNICIAN: t("roles.technician"),
    ADMIN: t("roles.admin"),
    COMPLIANCE_ADMIN: t("roles.complianceAdmin"),
  };

  const roleColors: Record<string, "default" | "success" | "warning" | "error" | "info" | "secondary"> = {
    PATIENT: "secondary",
    PRESCRIBER: "default",
    OPS_AGENT: "info",
    BILLING_AGENT: "warning",
    TECHNICIAN: "success",
    ADMIN: "error",
    COMPLIANCE_ADMIN: "error",
  };

  const statusLabels: Record<UserStatus, string> = {
    ACTIVE: t("status.active"),
    PENDING_VERIFICATION: t("status.pendingVerification"),
    SUSPENDED: t("status.suspended"),
    DEACTIVATED: t("status.deactivated"),
  };

  const statusColors: Record<UserStatus, "success" | "warning" | "error" | "secondary"> = {
    ACTIVE: "success",
    PENDING_VERIFICATION: "warning",
    SUSPENDED: "error",
    DEACTIVATED: "secondary",
  };

  const userStatus: UserStatus = user.status || (user.emailVerified ? "ACTIVE" : "PENDING_VERIFICATION");

  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-20 w-20">
        <AvatarImage
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}%20${user.lastName}`}
          alt={`${user.firstName} ${user.lastName}`}
        />
        <AvatarFallback className="text-2xl">
          {user.firstName[0]}
          {user.lastName[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-neutral-900">
            {user.firstName} {user.lastName}
          </h1>
          <Badge variant={roleColors[user.role] || "default"}>
            {roleLabels[user.role] || user.role}
          </Badge>
          <Badge variant={statusColors[userStatus]}>
            {statusLabels[userStatus]}
          </Badge>
        </div>
        <p className="text-neutral-500">
          ID: {user.id} | {t("createdOn")} {new Date(user.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </div>
    </div>
  );
}
