export interface Job {
  id: number;
  title: string;
  location: string;
  department: string;
  url: string;
  tags: string;
}

export interface Company {
  id: number;
  name: string;
}

export interface Source {
  id: number;
  company_id: number;
  url: string;
  provider: string;
  board_token: string;
  status: string;
  next_scan_at: string;
  fail_count: number;
  last_error: string;
}

const adminToken = () => localStorage.getItem("adminToken") ?? "";

export const sessionToken = {
  get: () => localStorage.getItem("sessionToken"),
  set: (t: string) => localStorage.setItem("sessionToken", t),
  clear: () => localStorage.removeItem("sessionToken"),
};

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": adminToken(),
      ...(init?.headers ?? {}),
    },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function authed<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken.get() ?? ""}`,
      ...(init?.headers ?? {}),
    },
  });
  if (r.status === 401) {
    sessionToken.clear();
    throw new Error("not authenticated");
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export const api = {
  jobs: (params: URLSearchParams): Promise<Job[]> =>
    authed(`/api/jobs?${params}`),
  register: (email: string, password: string): Promise<{ token: string }> =>
    req("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string): Promise<{ token: string }> =>
    req("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: (): Promise<{ ok: boolean }> =>
    authed("/api/auth/logout", { method: "POST" }),
  companies: (): Promise<Company[]> => req("/api/admin/companies"),
  addCompany: (name: string, url: string): Promise<Source> =>
    req("/api/admin/companies", {
      method: "POST",
      body: JSON.stringify({ name, url }),
    }),
  sources: (): Promise<Source[]> => req("/api/admin/sources"),
  scanAll: (): Promise<{ scanned: number }> =>
    req("/api/admin/scan", { method: "POST" }),
  rescan: (id: number): Promise<{ queued: number }> =>
    req(`/api/admin/sources/${id}/scan`, { method: "POST" }),
};
