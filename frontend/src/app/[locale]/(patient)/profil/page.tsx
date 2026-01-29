"use client";

import { useTranslations } from "next-intl";
import { User, MapPin, Phone, Shield, Bell, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/auth.store";
import { findPatientById } from "@/lib/mocks/data/users";

export default function ProfilePage() {
  const t = useTranslations("patient.profile");
  const { user } = useAuthStore();

  const patient = user?.id ? findPatientById(user.id) : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="personal" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{t("tabs.personal")}</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">{t("tabs.contact")}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">{t("tabs.security")}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">{t("tabs.notifications")}</span>
          </TabsTrigger>
          <TabsTrigger value="proxy" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">{t("tabs.proxy")}</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("personal.title")}</CardTitle>
              <CardDescription>{t("personal.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t("personal.firstName")}
                  defaultValue={patient?.firstName || user?.firstName}
                  readOnly
                />
                <Input
                  label={t("personal.lastName")}
                  defaultValue={patient?.lastName || user?.lastName}
                  readOnly
                />
              </div>
              <Input
                label={t("personal.email")}
                type="email"
                defaultValue={user?.email}
                readOnly
              />
              <Input
                label={t("personal.phone")}
                type="tel"
                defaultValue={user?.phone}
              />
              <Input
                label={t("personal.dateOfBirth")}
                type="date"
                defaultValue={patient?.dateOfBirth}
                readOnly
              />
              <div className="pt-4">
                <Button>{t("save")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("contact.title")}</CardTitle>
              <CardDescription>{t("contact.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label={t("contact.street")}
                defaultValue={patient?.address?.street}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t("contact.postalCode")}
                  defaultValue={patient?.address?.postalCode}
                />
                <Input
                  label={t("contact.city")}
                  defaultValue={patient?.address?.city}
                />
              </div>
              <Input
                label={t("contact.country")}
                defaultValue={patient?.address?.country || "France"}
                readOnly
              />
              <Input
                label={t("contact.deliveryNotes")}
                defaultValue={patient?.address?.deliveryNotes}
                placeholder={t("contact.deliveryNotesPlaceholder")}
              />

              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold mb-4">{t("contact.emergencyContact")}</h3>
                <div className="space-y-4">
                  <Input
                    label={t("contact.emergencyName")}
                    defaultValue={patient?.emergencyContact?.name}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t("contact.emergencyPhone")}
                      type="tel"
                      defaultValue={patient?.emergencyContact?.phone}
                    />
                    <Input
                      label={t("contact.emergencyRelationship")}
                      defaultValue={patient?.emergencyContact?.relationship}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button>{t("save")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("security.title")}</CardTitle>
              <CardDescription>{t("security.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">{t("security.changePassword")}</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {t("security.changePasswordDescription")}
                </p>
                <Button variant="outline" className="mt-4">
                  {t("security.changePasswordButton")}
                </Button>
              </div>

              {/* MFA */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{t("security.mfa")}</h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      {t("security.mfaDescription")}
                    </p>
                  </div>
                  <Button variant={user?.mfaEnabled ? "outline" : "default"}>
                    {user?.mfaEnabled ? t("security.mfaDisable") : t("security.mfaEnable")}
                  </Button>
                </div>
              </div>

              {/* Sessions */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">{t("security.sessions")}</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {t("security.sessionsDescription")}
                </p>
                <Button variant="outline" className="mt-4 text-error hover:text-error">
                  {t("security.logoutAll")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("notifications.title")}</CardTitle>
              <CardDescription>{t("notifications.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: "caseUpdates", label: t("notifications.caseUpdates") },
                  { key: "quoteReady", label: t("notifications.quoteReady") },
                  { key: "deliveryUpdates", label: t("notifications.deliveryUpdates") },
                  { key: "maintenanceUpdates", label: t("notifications.maintenanceUpdates") },
                  { key: "marketing", label: t("notifications.marketing") },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <span>{item.label}</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Email
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        SMS
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <Button>{t("save")}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proxy Tab */}
        <TabsContent value="proxy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("proxy.title")}</CardTitle>
              <CardDescription>{t("proxy.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-neutral-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t("proxy.noProxy")}</p>
                <Button variant="outline" className="mt-4">
                  {t("proxy.addProxy")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
