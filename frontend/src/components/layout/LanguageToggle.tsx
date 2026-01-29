"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Remove the current locale prefix and add new one
    const segments = pathname.split('/');
    const currentLocale = segments[1];

    // Check if current path has locale prefix
    if (currentLocale === 'fr' || currentLocale === 'en') {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    const newPath = segments.join('/') || '/';
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
      <button
        onClick={() => switchLocale("fr")}
        className={cn(
          "px-2 py-1 rounded-md text-[10px] font-bold transition-all uppercase",
          locale === "fr"
            ? "bg-white shadow-sm text-primary-600"
            : "text-neutral-500 hover:text-neutral-700"
        )}
      >
        FR
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={cn(
          "px-2 py-1 rounded-md text-[10px] font-bold transition-all uppercase",
          locale === "en"
            ? "bg-white shadow-sm text-primary-600"
            : "text-neutral-500 hover:text-neutral-700"
        )}
      >
        EN
      </button>
    </div>
  );
}
