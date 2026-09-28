import { useState } from "react";
import { api, type Company, type Source } from "../api";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("adminToken") ?? "");
  const [unlocked, setUnlocked] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");

  const saveToken = async () => {
    localStorage.setItem("adminToken", token);
    try {
      setMsg("");
      setCompanies(await api.companies());
      setSources(await api.sources());
      setUnlocked(true);
    } catch (e) {
      setUnlocked(false);
      setMsg(e instanceof Error ? e.message : "request failed");
    }
  };

  const refresh = async () => {
    try {
      setMsg("");
      setCompanies(await api.companies());
      setSources(await api.sources());
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "request failed");
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addCompany(name, url);
      setName("");
      setUrl("");
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "request failed");
    }
  };

  const rescan = async (id: number) => {
    try {
      await api.rescan(id);
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "request failed");
    }
  };

  const scanAll = async () => {
    try {
      const r = await api.scanAll();
      setMsg(`scanned ${r.scanned} sources`);
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "request failed");
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="mb-3 text-xl font-bold">Admin</h1>
      <div className="mb-3 flex gap-2">
        <input
          className="w-72 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
          type="password"
          placeholder="admin token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
          onClick={saveToken}
        >
          Unlock
        </button>
      </div>
      {msg && <p className="mb-3 text-sm text-red-700">{msg}</p>}
      {!unlocked && !msg && <p className="text-sm text-gray-500">Enter the admin token to continue.</p>}
      {unlocked && (
        <>
          <h2 className="mb-2 text-base font-bold">Add company</h2>
      <form onSubmit={add} className="mb-4 flex gap-2">
        <input
          className="w-48 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-96 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
          placeholder="careers page url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white">Add</button>
      </form>
      <h2 className="mb-2 text-base font-bold">
        Companies{" "}
        <button
          className="ml-2 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs"
          onClick={refresh}
        >
          Refresh
        </button>{" "}
        <button
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs"
          onClick={scanAll}
        >
          Scan now
        </button>
      </h2>
      <ul className="mb-4 list-disc pl-6 text-sm">
        {companies.map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
      <h2 className="mb-2 text-base font-bold">Sources</h2>
      <table className="w-full bg-white text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="px-3 py-2">ID</th>
            <th className="px-3 py-2">Provider</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Fails</th>
            <th className="px-3 py-2">Next scan</th>
            <th className="px-3 py-2">Error</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => (
            <tr key={s.id} className="border-t border-gray-100">
              <td className="px-3 py-2">{s.id}</td>
              <td className="px-3 py-2">
                {s.provider} ({s.board_token})
              </td>
              <td className="px-3 py-2">{s.status}</td>
              <td className="px-3 py-2">{s.fail_count}</td>
              <td className="px-3 py-2">{s.next_scan_at}</td>
              <td className="max-w-xs truncate px-3 py-2 text-red-700">{s.last_error}</td>
              <td className="px-3 py-2">
                <button
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs"
                  onClick={() => rescan(s.id)}
                >
                  Rescan
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </>
      )}
    </div>
  );
}
