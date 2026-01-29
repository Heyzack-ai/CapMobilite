"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { KeyRound, ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { resetPasswordRequestSchema, type ResetPasswordRequestData } from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordRequestData>({
    resolver: zodResolver(resetPasswordRequestSchema),
  });

  const onSubmit = async (data: ResetPasswordRequestData) => {
    try {
      // TODO: Call API to request password reset
      console.log("Requesting password reset for:", data.email);
      setSubmitted(true);
    } catch (err) {
      // Handle error
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardHeader className="space-y-1 text-center">
          <div className="w-16 h-16 bg-secondary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Mail className="w-8 h-8 text-secondary-600" />
          </div>
          <CardTitle className="text-2xl">{t("checkEmail")}</CardTitle>
          <CardDescription>
            Si un compte existe avec cette adresse email, vous recevrez un lien
            pour réinitialiser votre mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/connexion">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <KeyRound className="w-8 h-8 text-primary-600" />
        </div>
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>
          Entrez votre adresse email et nous vous enverrons un lien pour
          réinitialiser votre mot de passe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t("email")}
            type="email"
            placeholder="jean@exemple.fr"
            error={errors.email?.message}
            {...register("email")}
          />

          <Button type="submit" className="w-full" loading={isSubmitting}>
            {t("submit")}
          </Button>

          <div className="text-center">
            <Link
              href="/connexion"
              className="text-sm text-neutral-600 hover:text-primary-600"
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Retour à la connexion
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
