"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isLoggedIn = !!user;

  const navLinks = isLoggedIn
    ? [
      { href: "/dashboard", label: t.nav.dashboard },
      { href: "/audits", label: t.nav.audits },
      { href: "/pricing", label: t.nav.pricing },
      { href: "/settings", label: t.nav.settings },
    ]
    : [{ href: "/pricing", label: t.nav.pricing }];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-gray-900">AuditPulse</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${pathname === link.href
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {isLoggedIn ? (
              <button
                onClick={logout}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                {t.nav.logout}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  {t.nav.signup}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile links */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${pathname === link.href
                ? "bg-gray-900 text-white"
                : "border border-gray-200 bg-white text-gray-700"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
