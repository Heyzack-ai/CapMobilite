"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useAuthStore } from "@/stores/auth.store";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data);
      // Redirect based on user role
      const { user } = useAuthStore.getState();
      if (user && ['ADMIN', 'OPS_AGENT', 'BILLING_AGENT', 'TECHNICIAN'].includes(user.role)) {
        router.push("/admin/tableau-de-bord");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(t("error"));
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>
          {t("noAccount")}{" "}
          <Link
            href="/inscription"
            className="text-primary-600 hover:underline font-medium"
          >
            {t("register")}
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-error/10 text-error text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label={t("email")}
            type="email"
            placeholder="jean@exemple.fr"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label={t("password")}
            type="password"
            placeholder="••••••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex justify-end">
            <Link
              href="/mot-de-passe-oublie"
              className="text-sm text-primary-600 hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <Button type="submit" className="w-full" loading={isLoading}>
            <LogIn className="w-4 h-4 mr-2" />
            {t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
