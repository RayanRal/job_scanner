import { useState } from "react";
import { api, type Company, type Source } from "../api";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("adminToken") ?? "");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");

  const saveToken = () => {
    localStorage.setItem("adminToken", token);
    refresh();
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
    <div>
      <h1>Admin</h1>
      <div>
        <input
          type="password"
          placeholder="admin token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button onClick={saveToken}>Use token</button>
      </div>
      {msg && <p>{msg}</p>}
      <h2>Add company</h2>
      <form onSubmit={add}>
        <input
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="careers page url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button>Add</button>
      </form>
      <h2>
        Companies <button onClick={refresh}>Refresh</button>{" "}
        <button onClick={scanAll}>Scan now</button>
      </h2>
      <ul>
        {companies.map((c) => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
      <h2>Sources</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Provider</th>
            <th>Status</th>
            <th>Fails</th>
            <th>Next scan</th>
            <th>Error</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>
                {s.provider} ({s.board_token})
              </td>
              <td>{s.status}</td>
              <td>{s.fail_count}</td>
              <td>{s.next_scan_at}</td>
              <td>{s.last_error}</td>
              <td>
                <button onClick={() => rescan(s.id)}>Rescan</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
