"use client";

import { useTranslations } from "next-intl";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TestimonialsSection() {
  const t = useTranslations("testimonials");

  const testimonials = [
    {
      key: "testimonial1",
      initials: "MD",
      color: "bg-primary-100 text-primary-700",
    },
    {
      key: "testimonial2",
      initials: "JP",
      color: "bg-secondary-100 text-secondary-700",
    },
    {
      key: "testimonial3",
      initials: "SL",
      color: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <section id="temoignages" className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-navy-900">
            {t("title")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.key} className="hover:shadow-elevated transition-shadow">
              <CardContent className="p-6">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-neutral-600 mb-6 leading-relaxed">
                  &ldquo;{t(`${testimonial.key}.quote`)}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className={testimonial.color}>
                    <AvatarFallback className={testimonial.color}>
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-navy-900">
                      {t(`${testimonial.key}.author`)}
                    </div>
                    <div className="text-sm text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {t(`${testimonial.key}.location`)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
