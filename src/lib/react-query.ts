import { DefaultOptions, QueryClient } from "@tanstack/react-query";

export const queryConfig: DefaultOptions = {
    queries: {
        refetchOnWindowFocus: true,
        retry: false,
        staleTime: 1000 * 30, // 30 seconds
    },
};

export const queryClient = new QueryClient({
    defaultOptions: queryConfig,
});

export const queryKeys = {
    auth: {
        all: ["auth"] as const,
        user: () => [...queryKeys.auth.all, "user"] as const,
    },
    audits: {
        all: ["audits"] as const,
        list: (skip: number, limit: number) => [...queryKeys.audits.all, skip, limit] as const,
        detail: (id: string) => [...queryKeys.audits.all, id] as const,
    },
    subscriptions: {
        all: ["subscriptions"] as const,
        details: () => [...queryKeys.subscriptions.all, "details"] as const,
        languages: () => [...queryKeys.subscriptions.all, "languages"] as const,
        referrals: () => [...queryKeys.subscriptions.all, "referrals"] as const,
    },
};
