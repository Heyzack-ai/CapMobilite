"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Send } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/auth.store";
import { getDevicesByPatientId, ticketCategoryLabels, ticketSeverityLabels } from "@/lib/mocks/data/devices";
import { getProductById } from "@/lib/mocks/data/products";

const ticketSchema = z.object({
  deviceId: z.string().min(1, "Veuillez sélectionner un équipement"),
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
  severity: z.string().min(1, "Veuillez indiquer la gravité"),
  description: z.string().min(20, "Veuillez décrire le problème (minimum 20 caractères)"),
  isSafetyIssue: z.boolean(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function NewMaintenancePage() {
  const t = useTranslations("patient.newTicket");
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDeviceId = searchParams.get("deviceId");
  const { user } = useAuthStore();

  const patientId = user?.id || "user-1";
  const devices = getDevicesByPatientId(patientId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      deviceId: preselectedDeviceId || "",
      category: "",
      severity: "",
      description: "",
      isSafetyIssue: false,
    },
  });

  const selectedDeviceId = watch("deviceId");
  const isSafetyIssue = watch("isSafetyIssue");

  const onSubmit = async (data: TicketFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Ticket data:", data);
    router.push("/maintenance");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/maintenance">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("back")}
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-neutral-500">{t("subtitle")}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("formTitle")}</CardTitle>
          <CardDescription>{t("formDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Device Selection */}
            <div className="space-y-2">
              <Label htmlFor="deviceId">{t("device")} *</Label>
              <Select
                value={selectedDeviceId}
                onValueChange={(value) => setValue("deviceId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectDevice")} />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => {
                    const product = getProductById(device.productId);
                    return (
                      <SelectItem key={device.id} value={device.id}>
                        {product?.name || "Équipement"} - {device.serialNumber}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.deviceId && (
                <p className="text-sm text-error">{errors.deviceId.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">{t("category")} *</Label>
              <Select
                value={watch("category")}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ticketCategoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-error">{errors.category.message}</p>
              )}
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity">{t("severity")} *</Label>
              <Select
                value={watch("severity")}
                onValueChange={(value) => setValue("severity", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectSeverity")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ticketSeverityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.severity && (
                <p className="text-sm text-error">{errors.severity.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t("description")} *</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder={t("descriptionPlaceholder")}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-error">{errors.description.message}</p>
              )}
            </div>

            {/* Safety Issue Checkbox */}
            <div className="p-4 border border-warning/30 bg-warning/5 rounded-lg">
              <Checkbox
                checked={isSafetyIssue}
                onCheckedChange={(checked) =>
                  setValue("isSafetyIssue", checked === true)
                }
                label={
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    {t("safetyIssue")}
                  </span>
                }
              />
              <p className="text-sm text-neutral-500 mt-2 ml-6">
                {t("safetyIssueDescription")}
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/maintenance">{t("cancel")}</Link>
              </Button>
              <Button type="submit" className="flex-1" loading={isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                {t("submit")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
