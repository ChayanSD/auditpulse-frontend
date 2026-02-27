const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("ap_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getAuthToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("ap_token") : null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  company_name?: string;
  preferred_language: string;
  referral_code?: string;
}

export interface LoginData {
  username: string;  // OAuth2PasswordRequestForm uses 'username'
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  preferred_language: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export const auth = {
  register: (data: RegisterData) =>
    request<TokenResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: LoginData) => {
    const body = new URLSearchParams();
    body.append("username", data.username);
    body.append("password", data.password);
    return request<TokenResponse>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  },

  me: () => request<UserProfile>("/auth/me"),

  updateMe: (data: { full_name?: string; company_name?: string; preferred_language?: string }) =>
    request<UserProfile>("/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
};

// ─── Audits ──────────────────────────────────────────────────────────────────

export interface CreateAuditData {
  url: string;
  client_name?: string;
  client_email?: string;
  output_language: string;
}

export interface Audit {
  id: string;
  url: string;
  client_name?: string;
  client_email?: string;
  status: "pending" | "running" | "completed" | "failed";
  output_language: string;
  overall_score?: number;
  technical_score?: number;
  on_page_score?: number;
  performance_score?: number;
  mobile_score?: number;
  security_score?: number;
  pdf_url?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface AuditDetail extends Audit {
  raw_results?: Record<string, unknown>;
  ai_recommendations?: {
    executive_summary?: string;
    priority_recommendations?: Array<{
      title: string;
      description: string;
      impact: "high" | "medium" | "low";
      effort: "high" | "medium" | "low";
    }>;
    section_narratives?: Record<string, string>;
  };
}

export const audits = {
  create: (data: CreateAuditData) =>
    request<Audit>("/audits/", { method: "POST", body: JSON.stringify(data) }),

  list: (skip = 0, limit = 20) =>
    request<Audit[]>(`/audits/?skip=${skip}&limit=${limit}`),

  get: (id: string) => request<AuditDetail>(`/audits/${id}`),

  downloadUrl: (id: string) => `${API_BASE}/audits/${id}/download`,

  downloadPdf: async (id: string): Promise<{ blob: Blob; filename: string }> => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/audits/${id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || `Download failed: ${res.status}`);
    }
    const blob = await res.blob();
    const disposition = res.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="([^"]+)"/i);
    const filename = match?.[1] || `seo_audit_${id}.pdf`;
    return { blob, filename };
  },
};

// ─── Subscriptions ───────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  plan: "starter" | "professional" | "agency";
  status: string;
  audits_per_month: number;
  audits_used_this_month: number;
  free_months_remaining: number;
  current_period_end?: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
}

export interface Referral {
  id: string;
  referral_code: string;
  referred_email: string;
  is_converted: boolean;
  reward_granted: boolean;
  created_at: string;
}

export interface LanguageOption {
  code: string;
  name: string;
}

export const subscriptions = {
  get: () => request<Subscription>("/subscriptions/me"),

  createCheckout: (plan: string, successUrl: string, cancelUrl: string) =>
    request<{ checkout_url: string }>("/subscriptions/checkout", {
      method: "POST",
      body: JSON.stringify({ plan, success_url: successUrl, cancel_url: cancelUrl }),
    }),

  cancel: () => request("/subscriptions/cancel", { method: "POST" }),

  createReferral: (email: string) =>
    request<Referral>("/subscriptions/referrals", {
      method: "POST",
      body: JSON.stringify({ referred_email: email }),
    }),

  listReferrals: () => request<Referral[]>("/subscriptions/referrals"),

  getLanguages: () => request<LanguageOption[]>("/subscriptions/languages"),
};
