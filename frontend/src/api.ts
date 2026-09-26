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

const token = () => localStorage.getItem("adminToken") ?? "";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": token(),
      ...(init?.headers ?? {}),
    },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export const api = {
  jobs: (params: URLSearchParams): Promise<Job[]> =>
    fetch(`/api/jobs?${params}`).then((r) => r.json()),
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
