"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export function Navbar() {
  const { t } = useI18n();
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = !!user;

  const navLinks = isLoggedIn
    ? [
      { href: "/dashboard", label: t.nav.dashboard },
      { href: "/audits", label: t.nav.audits },
      { href: "/pricing", label: t.nav.pricing },
      { href: "/settings", label: t.nav.settings },
    ]
    : [{ href: "/pricing", label: t.nav.pricing }];

  useEffect(() => {
    const targets = ["/dashboard", "/audits", "/audits/new", "/settings", "/pricing"];
    targets.forEach((href) => router.prefetch(href));
  }, [router]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo.svg"
              alt="AuditPulse Logo"
              width={150}
              height={24}
              priority
              className="h-6 w-auto"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50/50 p-1">
            {loading ? (
              <>
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </>
            ) : (
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  onMouseEnter={() => router.prefetch(link.href)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${pathname === link.href
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {link.label}
                </Link>
              ))
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            {loading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-16 rounded-md" />
                <Skeleton className="h-9 w-20 rounded-md" />
              </div>
            ) : isLoggedIn ? (
              <Button variant="outline" size="sm" onClick={logout} className="hidden md:inline-flex">
                {t.nav.logout}
              </Button>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">{t.nav.login}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">{t.nav.signup}</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-2">
            <Separator />
            <div className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === link.href
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between px-3 pt-2 gap-4">
              <LanguageSwitcher />
              {!isLoggedIn && !loading && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">{t.nav.login}</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">{t.nav.signup}</Link>
                  </Button>
                </div>
              )}
              {isLoggedIn && !loading && (
                <Button variant="outline" size="sm" onClick={logout}>
                  {t.nav.logout}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
