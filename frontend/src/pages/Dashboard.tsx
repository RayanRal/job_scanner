import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Job } from "../api";

export default function Dashboard() {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [tag, setTag] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const navigate = useNavigate();

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams({ q, location, tag });
    try {
      setJobs(await api.jobs(params));
    } catch {
      navigate("/login");
    }
  };

  return (
    <div>
      <h1>Jobs</h1>
      <form onSubmit={search}>
        <input
          placeholder="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          placeholder="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          placeholder="tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
        <button>Filter</button>
      </form>
      <p>{jobs.length} jobs</p>
      <ul>
        {jobs.map((j) => (
          <li key={j.id}>
            <a href={j.url}>{j.title}</a> — {j.location} [{j.tags}]
          </li>
        ))}
      </ul>
    </div>
  );
}
