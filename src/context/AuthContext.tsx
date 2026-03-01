"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, UserProfile } from "@/lib/api";

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    login: (token: string, user: UserProfile) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("ap_token");
            if (token) {
                try {
                    const profile = await auth.me();
                    setUser(profile);
                } catch (err) {
                    console.error("Auth initialization failed:", err);
                    localStorage.removeItem("ap_token");
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    useEffect(() => {
        if (loading) return;

        const publicPaths = ["/", "/login", "/register"];
        const isPublicPath = publicPaths.includes(pathname);
        const token = typeof window !== "undefined" ? localStorage.getItem("ap_token") : null;

        if (!token && !isPublicPath) {
            // Not logged in and trying to access a protected page
            router.push("/login");
        } else if (token && isPublicPath && pathname !== "/") {
            // Logged in and trying to access login/register
            router.push("/dashboard");
        }
    }, [loading, pathname, user, router]);

    const login = (token: string, userProfile: UserProfile) => {
        localStorage.setItem("ap_token", token);
        setUser(userProfile);
        router.push("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("ap_token");
        setUser(null);
        router.push("/login");
    };

    const refreshUser = async () => {
        try {
            const profile = await auth.me();
            setUser(profile);
        } catch (err) {
            console.error("Failed to refresh user:", err);
            logout();
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
