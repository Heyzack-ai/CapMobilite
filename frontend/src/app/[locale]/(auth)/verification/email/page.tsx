"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { verificationCodeSchema, type VerificationCodeData } from "@/lib/validations/auth";

export default function EmailVerificationPage() {
  const t = useTranslations("auth.verify");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerificationCodeData>({
    resolver: zodResolver(verificationCodeSchema),
  });

  const onSubmit = async (data: VerificationCodeData) => {
    setError(null);
    try {
      // TODO: Call API to verify email
      console.log("Verifying email with code:", data.code);
      router.push("/verification/telephone");
    } catch (err) {
      setError("Code invalide. Veuillez réessayer.");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    try {
      // TODO: Call API to resend code
      console.log("Resending verification code");
      setResendCooldown(60);

      // Countdown timer
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary-600" />
        </div>
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>{t("emailSent")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-error/10 text-error text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label={t("enterCode")}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
            error={errors.code?.message}
            {...register("code")}
          />

          <Button type="submit" className="w-full" loading={isSubmitting}>
            {t("submit")}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? "animate-spin" : ""}`} />
              {resendCooldown > 0
                ? `${t("resend")} (${resendCooldown}s)`
                : t("resend")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
