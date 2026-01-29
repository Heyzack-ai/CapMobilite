import Link from "next/link";
import { Activity } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-navy-900">
            CapMobilité
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-neutral-500">
        &copy; {new Date().getFullYear()} CapMobilité. Tous droits réservés.
      </footer>
    </div>
  );
}
