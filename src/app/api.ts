// Central API client for AeroDesk Travel Karachi (Django Backend)

const API_BASE = (import.meta as any).env?.VITE_API_URL || "/api";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  initials: string;
}

export interface SelectedFlightContext {
  airline: string;
  code: string;
  dep: string;
  arr: string;
  depTime: string;
  arrTime: string;
  duration: string;
  stops: number;
  price: number;
  cls: string;
  pax: number;
  date: string;
  promoDiscount?: number;
}

export function getAuthToken(): string | null {
  return localStorage.getItem("aerodesk_token");
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem("aerodesk_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: AuthUser) {
  localStorage.setItem("aerodesk_token", token);
  localStorage.setItem("aerodesk_user", JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem("aerodesk_token");
  localStorage.removeItem("aerodesk_user");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errText = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      errText = data.error || data.detail || JSON.stringify(data);
    } catch {
      // ignore json parse error
    }
    throw new Error(errText);
  }

  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () =>
    request<{ detail: string }>("/auth/logout/", {
      method: "POST",
    }),
  me: () => request<AuthUser>("/auth/me/"),

  // Dashboard
  getDashboard: (period = "1Y") =>
    request<any>(`/dashboard/?period=${encodeURIComponent(period)}`),

  // Bookings
  getBookings: (params?: { status?: string; airline?: string; date?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== "All") qs.set("status", params.status);
    if (params?.airline && params.airline !== "All Airlines") qs.set("airline", params.airline);
    if (params?.date) qs.set("date", params.date);
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return request<any[]>(`/bookings/${query}`);
  },
  createBooking: (payload: Record<string, any> | FormData) =>
    request<any>("/bookings/", {
      method: "POST",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }),
  updateBookingStatus: (refOrId: string | number, status: string) =>
    request<any>(`/bookings/${encodeURIComponent(String(refOrId))}/update_status/`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
  deleteBooking: (refOrId: string | number) =>
    request<void>(`/bookings/${encodeURIComponent(String(refOrId))}/`, {
      method: "DELETE",
    }),
  getExportBookingsUrl: (params?: { status?: string; airline?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== "All") qs.set("status", params.status);
    if (params?.airline && params.airline !== "All Airlines") qs.set("airline", params.airline);
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return `${API_BASE}/bookings/export_csv/${query}`;
  },

  // Flight POS
  searchFlights: (params: {
    from: string;
    to: string;
    cabin_class: string;
    promo_code?: string;
  }) => {
    const qs = new URLSearchParams({
      from: params.from,
      to: params.to,
      cabin_class: params.cabin_class,
      ...(params.promo_code ? { promo_code: params.promo_code } : {}),
    });
    return request<{ flights: any[]; promo_applied: number }>(`/pos/search/?${qs.toString()}`);
  },
  validatePromo: (code: string) =>
    request<{ valid: boolean; code: string; discount_amount: number; description: string }>("/pos/promo/", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  // Flight Segments
  getSegments: (params?: { search?: string; airline?: string; route?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.airline && params.airline !== "All Airlines") qs.set("airline", params.airline);
    if (params?.route && params.route !== "All Routes") qs.set("route", params.route);
    if (params?.status && params.status !== "All Statuses") qs.set("status", params.status);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return request<any[]>(`/segments/${query}`);
  },
  createSegment: (payload: Record<string, any>) =>
    request<any>("/segments/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateSegment: (idOrSegId: string | number, payload: Record<string, any>) =>
    request<any>(`/segments/${encodeURIComponent(String(idOrSegId))}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  duplicateSegment: (idOrSegId: string | number) =>
    request<any>(`/segments/${encodeURIComponent(String(idOrSegId))}/duplicate/`, {
      method: "POST",
    }),
  deleteSegment: (idOrSegId: string | number) =>
    request<void>(`/segments/${encodeURIComponent(String(idOrSegId))}/`, {
      method: "DELETE",
    }),

  // Sub Agents
  getAgents: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return request<any[]>(`/agents/${query}`);
  },
  createAgent: (payload: Record<string, any>) =>
    request<any>("/agents/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateAgent: (id: number, payload: Record<string, any>) =>
    request<any>(`/agents/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteAgent: (id: number) =>
    request<void>(`/agents/${id}/`, {
      method: "DELETE",
    }),

  // Reports & Settings
  getReports: () => request<any>("/reports/"),
  getSettings: () => request<{ settings: any; promos: any[] }>("/settings/"),
  updateSettings: (payload: Record<string, any>) =>
    request<{ settings: any }>("/settings/", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
