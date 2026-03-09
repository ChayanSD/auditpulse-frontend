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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

function getInitials(name: string | undefined, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

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
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full hover:bg-gray-100"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-medium">
                          {user ? getInitials(user.full_name, user.email) : "?"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.full_name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.752-.43-.992l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                      </svg>
                      {t.nav.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
