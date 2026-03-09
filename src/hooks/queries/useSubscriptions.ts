import { useQuery } from "@tanstack/react-query";
import { subscriptions, auth } from "@/lib/api";
import { queryKeys } from "@/lib/react-query";

export function useSubscription(enabled = true) {
    return useQuery({
        queryKey: queryKeys.subscriptions.details(),
        queryFn: () => subscriptions.get(),
        enabled,
        // Don't show loading state when disabled - immediately return cached/default
        placeholderData: (previousData) => previousData,
    });
}

export function useTrialStatus(enabled = true) {
    return useQuery({
        queryKey: queryKeys.subscriptions.trialStatus(),
        queryFn: () => subscriptions.getTrialStatus(),
        enabled,
        staleTime: 1000 * 60, // Check trial status every minute
    });
}

export function useReferrals(enabled = true) {
    return useQuery({
        queryKey: queryKeys.subscriptions.referrals(),
        queryFn: () => subscriptions.listReferrals(),
        enabled,
    });
}

export function useLanguages(enabled = true) {
    return useQuery({
        queryKey: queryKeys.subscriptions.languages(),
        queryFn: () => subscriptions.getLanguages(),
        enabled,
        staleTime: 1000 * 60 * 60, // languages rarely change — cache 1 hour
    });
}

export function useCurrentUser(enabled = true) {
    return useQuery({
        queryKey: queryKeys.auth.user(),
        queryFn: () => auth.me(),
        enabled,
    });
}
