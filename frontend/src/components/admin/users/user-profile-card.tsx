"use client";

import { useTranslations } from "next-intl";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Patient, Address, EmergencyContact } from "@/types";

interface UserProfileCardProps {
  user: Patient;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const t = useTranslations("admin.userDetail.profile");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" />
            {t("personalInfo")}
          </CardTitle>
          <CardDescription>{t("personalInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-500">{t("firstName")}</p>
              <p className="font-medium">{user.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">{t("lastName")}</p>
              <p className="font-medium">{user.lastName}</p>
            </div>
          </div>

          {user.dateOfBirth && (
            <div>
              <p className="text-sm text-neutral-500 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t("dateOfBirth")}
              </p>
              <p className="font-medium">
                {new Date(user.dateOfBirth).toLocaleDateString("fr-FR")}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-neutral-500">{t("role")}</p>
            <p className="font-medium">{user.role}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-500" />
            {t("contactInfo")}
          </CardTitle>
          <CardDescription>{t("contactInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-neutral-500 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {t("email")}
            </p>
            <div className="flex items-center gap-2">
              <p className="font-medium">{user.email}</p>
              {user.emailVerified ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <XCircle className="w-4 h-4 text-error" />
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-neutral-500 flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {t("phone")}
            </p>
            <div className="flex items-center gap-2">
              <p className="font-medium">{user.phone}</p>
              {user.phoneVerified ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <XCircle className="w-4 h-4 text-error" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address (for patients) */}
      {user.address && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              {t("address")}
            </CardTitle>
            <CardDescription>{t("addressDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-neutral-500">{t("street")}</p>
              <p className="font-medium">{user.address.street}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">{t("city")}</p>
                <p className="font-medium">{user.address.city}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">{t("postalCode")}</p>
                <p className="font-medium">{user.address.postalCode}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-500">{t("country")}</p>
              <p className="font-medium">{user.address.country}</p>
            </div>
            {user.address.deliveryNotes && (
              <div>
                <p className="text-sm text-neutral-500">{t("deliveryNotes")}</p>
                <p className="font-medium text-neutral-600">{user.address.deliveryNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            {t("security")}
          </CardTitle>
          <CardDescription>{t("securityDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("mfa")}</p>
              <p className="text-sm text-neutral-500">{t("mfaDescription")}</p>
            </div>
            {user.mfaEnabled ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{t("enabled")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-neutral-400">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">{t("disabled")}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("emailVerification")}</p>
              <p className="text-sm text-neutral-500">{t("emailVerificationDescription")}</p>
            </div>
            {user.emailVerified ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{t("verified")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{t("pending")}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("phoneVerification")}</p>
              <p className="text-sm text-neutral-500">{t("phoneVerificationDescription")}</p>
            </div>
            {user.phoneVerified ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{t("verified")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{t("pending")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact (for patients) */}
      {user.emergencyContact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary-500" />
              {t("emergencyContact")}
            </CardTitle>
            <CardDescription>{t("emergencyContactDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-neutral-500">{t("emergencyName")}</p>
              <p className="font-medium">{user.emergencyContact.name}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">{t("emergencyPhone")}</p>
              <p className="font-medium">{user.emergencyContact.phone}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">{t("emergencyRelationship")}</p>
              <p className="font-medium">{user.emergencyContact.relationship}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
