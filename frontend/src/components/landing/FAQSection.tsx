"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const t = useTranslations("faq");

  const faqs = [
    { key: "q1" },
    { key: "q2" },
    { key: "q3" },
    { key: "q4" },
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-navy-900">
            {t("title")}
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.key}
              value={faq.key}
              className="bg-neutral-50 rounded-xl px-6 border-none"
            >
              <AccordionTrigger className="text-left text-navy-900 hover:no-underline py-5">
                {t(`${faq.key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 pb-5">
                {t(`${faq.key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
