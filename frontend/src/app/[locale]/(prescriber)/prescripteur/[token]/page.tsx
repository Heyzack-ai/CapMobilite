"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  User,
  Stethoscope,
  Send,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const prescriberSchema = z.object({
  rppsNumber: z.string().min(11, "Numéro RPPS invalide").max(11),
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  specialty: z.string().min(2, "Spécialité requise"),
  clinicalNotes: z.string().optional(),
});

type PrescriberFormData = z.infer<typeof prescriberSchema>;

type Step = "validate" | "form" | "upload" | "success";

export default function PrescriberPage() {
  const t = useTranslations("prescriber");
  const params = useParams();
  const token = params.token as string;

  const [step, setStep] = useState<Step>("validate");
  const [isValidating, setIsValidating] = useState(false);
  const [tokenData, setTokenData] = useState<{
    patientName: string;
    caseNumber: string;
    expiresAt: string;
  } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [referenceNumber, setReferenceNumber] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PrescriberFormData>({
    resolver: zodResolver(prescriberSchema),
  });

  const validateToken = async () => {
    setIsValidating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (token === "invalid") {
        throw new Error("Token invalide");
      }

      setTokenData({
        patientName: "Jean D.",
        caseNumber: "CAP-2024-0001",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setStep("form");
    } catch {
      setTokenData(null);
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmitForm = async (data: PrescriberFormData) => {
    console.log("Prescriber data:", data);
    setStep("upload");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const submitDocuments = async () => {
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setReferenceNumber(`REF-${Date.now()}`);
    setStep("success");
  };

  const getProgress = () => {
    switch (step) {
      case "validate":
        return 0;
      case "form":
        return 33;
      case "upload":
        return 66;
      case "success":
        return 100;
    }
  };

  // Validate step
  if (step === "validate") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-primary-600" />
            </div>
            <CardTitle>{t("validate.title")}</CardTitle>
            <CardDescription>{t("validate.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {tokenData === null && !isValidating ? (
              <div className="text-center py-4">
                <AlertTriangle className="w-12 h-12 text-error mx-auto mb-3" />
                <p className="text-error font-medium">{t("validate.invalid")}</p>
                <p className="text-sm text-neutral-500 mt-2">{t("validate.invalidDescription")}</p>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={validateToken}
                loading={isValidating}
              >
                {t("validate.button")}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className={step === "form" ? "text-primary-600 font-medium" : ""}>
                {t("steps.info")}
              </span>
              <span className={step === "upload" ? "text-primary-600 font-medium" : ""}>
                {t("steps.upload")}
              </span>
              <span className={step === "success" ? "text-success font-medium" : ""}>
                {t("steps.done")}
              </span>
            </div>
            <Progress value={getProgress()} />
          </CardContent>
        </Card>

        {/* Patient Info */}
        {tokenData && step !== "success" && (
          <Card className="bg-primary-50 border-primary-200">
            <CardContent className="p-4 flex items-center gap-3">
              <User className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-primary-700">
                  {t("patient")}: <strong>{tokenData.patientName}</strong>
                </p>
                <p className="text-sm text-primary-600">
                  {t("case")}: {tokenData.caseNumber}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Step */}
        {step === "form" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("form.title")}</CardTitle>
              <CardDescription>{t("form.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                <Input
                  label={t("form.rpps")}
                  placeholder="12345678901"
                  error={errors.rppsNumber?.message}
                  {...register("rppsNumber")}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t("form.firstName")}
                    error={errors.firstName?.message}
                    {...register("firstName")}
                  />
                  <Input
                    label={t("form.lastName")}
                    error={errors.lastName?.message}
                    {...register("lastName")}
                  />
                </div>

                <Input
                  label={t("form.specialty")}
                  placeholder="Médecine physique et réadaptation"
                  error={errors.specialty?.message}
                  {...register("specialty")}
                />

                <Textarea
                  label={t("form.notes")}
                  rows={4}
                  placeholder={t("form.notesPlaceholder")}
                  {...register("clinicalNotes")}
                />

                <Button type="submit" className="w-full" loading={isSubmitting}>
                  {t("form.continue")}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Upload Step */}
        {step === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("upload.title")}</CardTitle>
              <CardDescription>{t("upload.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/50 transition-colors">
                <Upload className="w-10 h-10 mx-auto mb-3 text-neutral-400" />
                <p className="font-medium">{t("upload.dropzone")}</p>
                <p className="text-sm text-neutral-500 mt-1">{t("upload.formats")}</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
                />
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {t("upload.browse")}
                  </label>
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                    >
                      <FileText className="w-5 h-5 text-primary-600" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-neutral-500">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                  ))}
                </div>
              )}

              <Button
                className="w-full"
                disabled={uploadedFiles.length === 0}
                onClick={submitDocuments}
              >
                <Send className="w-4 h-4 mr-2" />
                {t("upload.submit")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {step === "success" && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-semibold">{t("success.title")}</h2>
              <p className="text-neutral-500 mt-2">{t("success.description")}</p>

              <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-500">{t("success.reference")}</p>
                <p className="text-lg font-mono font-bold mt-1">{referenceNumber}</p>
              </div>

              <p className="text-sm text-neutral-500 mt-6">{t("success.note")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
