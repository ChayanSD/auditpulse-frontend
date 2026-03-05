import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/hooks/useI18n";
import { AuthProvider } from "@/context/AuthContext";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AuditPulse — AI-Powered SEO Audits for Agencies",
  description: "Professional SEO audit reports powered by AI. Multi-language PDF reports, automated delivery, and white-label output for agencies.",
  icons: {
    icon: "/logo.svg",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <I18nProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" />
            </AuthProvider>
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
