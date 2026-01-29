"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const leadFormSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  phone: z.string().min(10, "Téléphone requis"),
  zipCode: z.string().min(5, "Code postal requis"),
  hasPrescription: z.enum(["yes", "no", "dontKnow"]),
  concernsWho: z.enum(["myself", "relative"]),
  consent: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter la politique de confidentialité",
  }),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

export function LeadFormSection() {
  const t = useTranslations("leadForm");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      hasPrescription: "dontKnow",
      concernsWho: "myself",
      consent: false,
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    console.log("Form submitted:", data);
    // TODO: Integrate with API
  };

  return (
    <section id="eligibilite" className="py-20 bg-navy-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-neutral-400">{t("subtitle")}</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl p-8 shadow-elevated"
        >
          {/* Name Fields */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Input
              label={t("firstName")}
              placeholder="Jean"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              label={t("lastName")}
              placeholder="Dupont"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          {/* Contact Fields */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Input
              label={t("phone")}
              placeholder="06 12 34 56 78"
              type="tel"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Input
              label={t("zipCode")}
              placeholder="75001"
              error={errors.zipCode?.message}
              {...register("zipCode")}
            />
          </div>

          {/* Prescription Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              {t("hasPrescription")}
            </label>
            <RadioGroup
              value={watch("hasPrescription")}
              onValueChange={(value) =>
                setValue("hasPrescription", value as "yes" | "no" | "dontKnow")
              }
              className="flex flex-wrap gap-4"
            >
              <RadioGroupItem value="yes" label={t("yes")} />
              <RadioGroupItem value="no" label={t("no")} />
              <RadioGroupItem value="dontKnow" label={t("dontKnow")} />
            </RadioGroup>
          </div>

          {/* Concerns Who */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              {t("concernsWho")}
            </label>
            <RadioGroup
              value={watch("concernsWho")}
              onValueChange={(value) =>
                setValue("concernsWho", value as "myself" | "relative")
              }
              className="flex flex-wrap gap-4"
            >
              <RadioGroupItem value="myself" label={t("myself")} />
              <RadioGroupItem value="relative" label={t("relative")} />
            </RadioGroup>
          </div>

          {/* Consent */}
          <div className="mb-8">
            <Checkbox
              checked={watch("consent")}
              onCheckedChange={(checked) => setValue("consent", checked as boolean)}
              label={t("consent")}
              error={errors.consent?.message}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={isSubmitting}
          >
            <Send className="w-4 h-4 mr-2" />
            {t("submit")}
          </Button>

          {/* Note */}
          <p className="text-xs text-neutral-500 mt-4 text-center">
            {t("note")}
          </p>
        </form>
      </div>
    </section>
  );
}
