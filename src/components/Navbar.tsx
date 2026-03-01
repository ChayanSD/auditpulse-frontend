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
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black text-indigo-600 tracking-tight">AuditPulse</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${pathname === link.href
                  ? "text-indigo-600"
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
                className="text-sm text-gray-600 hover:text-gray-900"
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
                  className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {t.nav.signup}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
