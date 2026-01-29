"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { 
  User, MapPin, Shield, Bell, Users, Plus, Trash2, 
  Mail, Phone, CheckCircle, Clock, XCircle, FileText, Loader2 
} from "lucide-react";
import { toast } from "@/lib/toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth.store";
import { 
  useCurrentUser, 
  useUpdateProfile,
  useNotificationPreferences, 
  useUpdateNotificationPreferences,
  useMyProxies,
  useInviteProxy,
  useRevokeProxy,
  useConsents,
  useRevokeConsent
} from "@/lib/api/hooks";

export default function ProfilePage() {
  const t = useTranslations("patient.profile");
  const { user: authUser } = useAuthStore();
  
  // API hooks
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { mutate: updateProfile, isPending: updatingProfile } = useUpdateProfile();
  const { data: notifPrefs, isLoading: notifLoading } = useNotificationPreferences();
  const { mutate: updateNotifPrefs, isPending: updatingNotifs } = useUpdateNotificationPreferences();
  const { data: proxiesData, isLoading: proxiesLoading } = useMyProxies();
  const { mutate: inviteProxy, isPending: invitingProxy } = useInviteProxy();
  const { mutate: revokeProxy, isPending: revokingProxy } = useRevokeProxy();
  const { data: consentsData, isLoading: consentsLoading } = useConsents();
  const { mutate: revokeConsent, isPending: revokingConsent } = useRevokeConsent();

  // Local state
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRelationship, setInviteRelationship] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || "",
    street: user?.address?.street || "",
    postalCode: user?.address?.postalCode || "",
    city: user?.address?.city || "",
    deliveryNotes: user?.address?.deliveryNotes || "",
    emergencyName: user?.emergencyContact?.name || "",
    emergencyPhone: user?.emergencyContact?.phone || "",
    emergencyRelationship: user?.emergencyContact?.relationship || "",
  });

  const proxies = proxiesData?.data || [];
  const consents = consentsData?.data || [];

  const handleSaveProfile = () => {
    updateProfile({
      phone: formData.phone,
      address: {
        street: formData.street,
        postalCode: formData.postalCode,
        city: formData.city,
      },
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
        relationship: formData.emergencyRelationship,
      },
    }, {
      onSuccess: () => {
        toast.success(t("saved"));
        setEditMode(false);
      },
      onError: () => {
        toast.error(t("saveError"));
      },
    });
  };

  const handleInviteProxy = () => {
    if (!inviteEmail || !inviteRelationship) return;
    inviteProxy({
      email: inviteEmail,
      relationship: inviteRelationship,
    }, {
      onSuccess: () => {
        toast.success(t("proxy.inviteSent"));
        setShowInviteDialog(false);
        setInviteEmail("");
        setInviteRelationship("");
      },
      onError: () => {
        toast.error(t("proxy.inviteError"));
      },
    });
  };

  const handleRevokeProxy = (proxyId: string) => {
    if (!confirm(t("proxy.confirmRevoke"))) return;
    revokeProxy(proxyId, {
      onSuccess: () => toast.success(t("proxy.revoked")),
      onError: () => toast.error(t("proxy.revokeError")),
    });
  };

  const handleRevokeConsent = (consentId: string) => {
    if (!confirm(t("consent.confirmRevoke"))) return;
    revokeConsent(consentId, {
      onSuccess: () => toast.success(t("consent.revoked")),
      onError: () => toast.error(t("consent.revokeError")),
    });
  };

  const handleNotifChange = (key: string, value: boolean) => {
    if (!notifPrefs) return;
    updateNotifPrefs({
      ...notifPrefs,
      [key]: value,
    } as Parameters<typeof updateNotifPrefs>[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
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
          <TabsTrigger value="consents" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">{t("tabs.consents")}</span>
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
              {userLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t("personal.firstName")}
                      defaultValue={user?.firstName || authUser?.firstName}
                      readOnly
                    />
                    <Input
                      label={t("personal.lastName")}
                      defaultValue={user?.lastName || authUser?.lastName}
                      readOnly
                    />
                  </div>
                  <Input
                    label={t("personal.email")}
                    type="email"
                    defaultValue={user?.email || authUser?.email}
                    readOnly
                  />
                  <Input
                    label={t("personal.phone")}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editMode}
                  />
                  <Input
                    label={t("personal.dateOfBirth")}
                    type="date"
                    defaultValue={user?.dateOfBirth}
                    readOnly
                  />
                  <Input
                    label={t("personal.nir")}
                    defaultValue={user?.nir ? `${user.nir.slice(0, 3)} *** *** *** **` : ""}
                    readOnly
                    helperText={t("personal.nirHelp")}
                  />
                  <div className="pt-4 flex gap-2">
                    {editMode ? (
                      <>
                        <Button onClick={handleSaveProfile} disabled={updatingProfile}>
                          {updatingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          {t("save")}
                        </Button>
                        <Button variant="outline" onClick={() => setEditMode(false)}>
                          {t("cancel")}
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" onClick={() => setEditMode(true)}>
                        {t("edit")}
                      </Button>
                    )}
                  </div>
                </>
              )}
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
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                disabled={!editMode}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t("contact.postalCode")}
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  disabled={!editMode}
                />
                <Input
                  label={t("contact.city")}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!editMode}
                />
              </div>
              <Input
                label={t("contact.country")}
                defaultValue="France"
                readOnly
              />
              <Input
                label={t("contact.deliveryNotes")}
                value={formData.deliveryNotes}
                onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                placeholder={t("contact.deliveryNotesPlaceholder")}
                disabled={!editMode}
              />

              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold mb-4">{t("contact.emergencyContact")}</h3>
                <div className="space-y-4">
                  <Input
                    label={t("contact.emergencyName")}
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    disabled={!editMode}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={t("contact.emergencyPhone")}
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      disabled={!editMode}
                    />
                    <Input
                      label={t("contact.emergencyRelationship")}
                      value={formData.emergencyRelationship}
                      onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                      disabled={!editMode}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                {editMode ? (
                  <>
                    <Button onClick={handleSaveProfile} disabled={updatingProfile}>
                      {updatingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {t("save")}
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      {t("cancel")}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setEditMode(true)}>
                    {t("edit")}
                  </Button>
                )}
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
              {notifLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Global Email/SMS toggles */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-neutral-50">
                    <div>
                      <span className="font-medium">{t("notifications.emailEnabled")}</span>
                      <p className="text-sm text-neutral-500">{t("notifications.emailEnabledDesc")}</p>
                    </div>
                    <Switch
                      checked={notifPrefs?.emailEnabled ?? true}
                      onCheckedChange={(v) => handleNotifChange('emailEnabled', v)}
                      disabled={updatingNotifs}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-neutral-50">
                    <div>
                      <span className="font-medium">{t("notifications.smsEnabled")}</span>
                      <p className="text-sm text-neutral-500">{t("notifications.smsEnabledDesc")}</p>
                    </div>
                    <Switch
                      checked={notifPrefs?.smsEnabled ?? true}
                      onCheckedChange={(v) => handleNotifChange('smsEnabled', v)}
                      disabled={updatingNotifs}
                    />
                  </div>
                  
                  <div className="border-t my-4"></div>
                  
                  {/* Individual notification types */}
                  {[
                    { key: 'caseUpdates' as const, label: t("notifications.caseUpdates") },
                    { key: 'quoteNotifications' as const, label: t("notifications.quoteReady") },
                    { key: 'deliveryAlerts' as const, label: t("notifications.deliveryUpdates") },
                    { key: 'maintenanceReminders' as const, label: t("notifications.maintenanceUpdates") },
                    { key: 'marketingEmails' as const, label: t("notifications.marketing") },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <span className="font-medium">{item.label}</span>
                      <Switch
                        checked={notifPrefs?.[item.key] ?? true}
                        onCheckedChange={(v) => handleNotifChange(item.key, v)}
                        disabled={updatingNotifs}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proxy Tab */}
        <TabsContent value="proxy" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("proxy.title")}</CardTitle>
                <CardDescription>{t("proxy.description")}</CardDescription>
              </div>
              <Button onClick={() => setShowInviteDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t("proxy.addProxy")}
              </Button>
            </CardHeader>
            <CardContent>
              {proxiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : proxies.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t("proxy.noProxy")}</p>
                  <p className="text-sm mt-2">{t("proxy.noProxyDescription")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proxies.map((proxyRel) => (
                    <div
                      key={proxyRel.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {proxyRel.proxy?.firstName && proxyRel.proxy?.lastName 
                              ? `${proxyRel.proxy.firstName} ${proxyRel.proxy.lastName}` 
                              : proxyRel.proxy?.email || t("proxy.unknown")}
                          </p>
                          <p className="text-sm text-neutral-500">{proxyRel.relationship}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={proxyRel.status === 'ACTIVE' ? 'default' : 'secondary'}
                          className="gap-1"
                        >
                          {proxyRel.status === 'ACTIVE' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : proxyRel.status === 'REVOKED' ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {t(`proxy.status.${proxyRel.status.toLowerCase()}`)}
                        </Badge>
                        {proxyRel.status === 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeProxy(proxyRel.id)}
                            disabled={revokingProxy}
                          >
                            <Trash2 className="w-4 h-4 text-error" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consents Tab */}
        <TabsContent value="consents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("consent.title")}</CardTitle>
              <CardDescription>{t("consent.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {consentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : consents.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t("consent.noConsents")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consents.map((consent) => (
                    <div
                      key={consent.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{t(`consent.types.${consent.consentType}`)}</p>
                        <p className="text-sm text-neutral-500">
                          {t(`consent.typeDescriptions.${consent.consentType}`)}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {t("consent.grantedOn", { date: new Date(consent.grantedAt).toLocaleDateString() })}
                          {" · "}{t("consent.version", { version: consent.version })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeConsent(consent.id)}
                        disabled={revokingConsent}
                      >
                        {t("consent.revoke")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Proxy Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("proxy.inviteTitle")}</DialogTitle>
            <DialogDescription>{t("proxy.inviteDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              label={t("proxy.inviteEmail")}
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@example.com"
            />
            <Input
              label={t("proxy.relationship")}
              value={inviteRelationship}
              onChange={(e) => setInviteRelationship(e.target.value)}
              placeholder={t("proxy.relationshipPlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              {t("cancel")}
            </Button>
            <Button 
              onClick={handleInviteProxy} 
              disabled={invitingProxy || !inviteEmail || !inviteRelationship}
            >
              {invitingProxy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("proxy.sendInvite")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
