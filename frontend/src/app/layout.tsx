import type { Metadata } from "next";
import { Outfit, Lora } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "CapMobilité - Fauteuils Roulants Pris en Charge | Sur Prescription Médicale",
  description: "Fauteuils roulants pris en charge par l'Assurance Maladie sur prescription médicale. CapMobilité vous accompagne dans vos démarches administratives.",
  keywords: ["fauteuil roulant", "assurance maladie", "LPPR", "handicap", "mobilité"],
  authors: [{ name: "CapMobilité" }],
  openGraph: {
    title: "CapMobilité - Fauteuils Roulants Pris en Charge",
    description: "Fauteuils roulants pris en charge par l'Assurance Maladie sur prescription médicale.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${outfit.variable} ${lora.variable} font-sans text-navy-900 bg-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
