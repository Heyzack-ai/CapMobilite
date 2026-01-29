"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus, ArrowRight, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  registrationStep1Schema,
  registrationStep2Schema,
  registrationStep3Schema,
  type RegistrationStep1Data,
  type RegistrationStep2Data,
  type RegistrationStep3Data,
} from "@/lib/validations/auth";
import { useAuthStore } from "@/stores/auth.store";

type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<RegistrationStep1Data & RegistrationStep2Data & RegistrationStep3Data>>({});
  const { register: registerUser, isLoading } = useAuthStore();

  // Step 1 form
  const step1Form = useForm<RegistrationStep1Data>({
    resolver: zodResolver(registrationStep1Schema),
    defaultValues: formData,
  });

  // Step 2 form
  const step2Form = useForm<RegistrationStep2Data>({
    resolver: zodResolver(registrationStep2Schema),
    defaultValues: formData,
  });

  // Step 3 form
  const step3Form = useForm<RegistrationStep3Data>({
    resolver: zodResolver(registrationStep3Schema),
    defaultValues: {
      acceptTerms: false,
      acceptHealthDataConsent: false,
      acceptMarketing: false,
      ...formData,
    },
  });

  const handleStep1 = (data: RegistrationStep1Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2 = (data: RegistrationStep2Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleStep3 = async (data: RegistrationStep3Data) => {
    setError(null);
    const fullData = { ...formData, ...data };

    try {
      await registerUser({
        email: fullData.email!,
        password: fullData.password!,
        phone: fullData.phone!,
        firstName: fullData.firstName!,
        lastName: fullData.lastName!,
        dateOfBirth: fullData.dateOfBirth!,
        acceptTerms: Boolean(fullData.acceptTerms),
        acceptHealthDataConsent: Boolean(fullData.acceptHealthDataConsent),
        acceptMarketing: fullData.acceptMarketing ?? false,
      });
      router.push("/verification/email");
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const goBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const progress = (step / 3) * 100;

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>
          {t("haveAccount")}{" "}
          <Link
            href="/connexion"
            className="text-primary-600 hover:underline font-medium"
          >
            {t("login")}
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-neutral-500 mb-2">
            <span className={step >= 1 ? "text-primary-600 font-medium" : ""}>
              {t("step1")}
            </span>
            <span className={step >= 2 ? "text-primary-600 font-medium" : ""}>
              {t("step2")}
            </span>
            <span className={step >= 3 ? "text-primary-600 font-medium" : ""}>
              {t("step3")}
            </span>
          </div>
          <Progress value={progress} />
        </div>

        {error && (
          <div className="bg-error/10 text-error text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Step 1: Account */}
        {step === 1 && (
          <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
            <Input
              label={t("email")}
              type="email"
              placeholder="jean@exemple.fr"
              error={step1Form.formState.errors.email?.message}
              {...step1Form.register("email")}
            />

            <Input
              label={t("password")}
              type="password"
              placeholder="••••••••••••"
              helperText={t("passwordRequirements")}
              error={step1Form.formState.errors.password?.message}
              {...step1Form.register("password")}
            />

            <Input
              label={t("phone")}
              type="tel"
              placeholder="+33612345678"
              error={step1Form.formState.errors.phone?.message}
              {...step1Form.register("phone")}
            />

            <Button type="submit" className="w-full">
              Continuer
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {/* Step 2: Identity */}
        {step === 2 && (
          <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4">
            <Input
              label={t("firstName")}
              placeholder="Jean"
              error={step2Form.formState.errors.firstName?.message}
              {...step2Form.register("firstName")}
            />

            <Input
              label={t("lastName")}
              placeholder="Dupont"
              error={step2Form.formState.errors.lastName?.message}
              {...step2Form.register("lastName")}
            />

            <Input
              label={t("dateOfBirth")}
              type="date"
              error={step2Form.formState.errors.dateOfBirth?.message}
              {...step2Form.register("dateOfBirth")}
            />

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={goBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Button type="submit" className="flex-1">
                Continuer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Consents */}
        {step === 3 && (
          <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-4">
            <Checkbox
              checked={Boolean(step3Form.watch("acceptTerms"))}
              onCheckedChange={(checked) =>
                step3Form.setValue("acceptTerms", checked === true ? true : false)
              }
              label={t("acceptTerms")}
              error={step3Form.formState.errors.acceptTerms?.message}
            />

            <Checkbox
              checked={Boolean(step3Form.watch("acceptHealthDataConsent"))}
              onCheckedChange={(checked) =>
                step3Form.setValue("acceptHealthDataConsent", checked === true ? true : false)
              }
              label={t("acceptHealthData")}
              error={step3Form.formState.errors.acceptHealthDataConsent?.message}
            />

            <Checkbox
              checked={step3Form.watch("acceptMarketing") || false}
              onCheckedChange={(checked) =>
                step3Form.setValue("acceptMarketing", checked as boolean)
              }
              label={t("acceptMarketing")}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={goBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Button type="submit" className="flex-1" loading={isLoading}>
                <UserPlus className="w-4 h-4 mr-2" />
                {t("submit")}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
