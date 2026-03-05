import { useQuery } from "@tanstack/react-query";
import { audits } from "@/lib/api";
import { queryKeys } from "@/lib/react-query";

export function useAuditsList(skip = 0, limit = 20, enabled = true) {
    return useQuery({
        queryKey: queryKeys.audits.list(skip, limit),
        queryFn: () => audits.list(skip, limit),
        enabled,
        // Automatically refetch every 4 seconds if any audit is pending/running
        refetchInterval: (query) => {
            const list = query.state.data;
            if (!list) return false;
            const hasPending = list.some(
                (audit) => audit.status === "pending" || audit.status === "running"
            );
            return hasPending ? 4000 : false;
        },
    });
}

export function useAuditDetail(id: string, enabled = true) {
    return useQuery({
        queryKey: queryKeys.audits.detail(id),
        queryFn: () => audits.get(id),
        enabled: !!id && enabled,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data) return false;
            return (data.status === "pending" || data.status === "running") ? 4000 : false;
        },
    });
}
