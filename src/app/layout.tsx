import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/hooks/useI18n";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "AuditPulse — AI-Powered SEO Audits for Agencies",
  description: "Professional SEO audit reports powered by AI. Multi-language PDF reports, automated delivery, and white-label output for agencies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
