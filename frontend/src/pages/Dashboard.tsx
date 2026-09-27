import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Chip, type Job, type MarkStatus } from "../api";
import MultiSelect from "../components/MultiSelect";
import SmartFilterBar from "../components/SmartFilterBar";

type Tab = "all" | MarkStatus;

function fieldMatch(job: Job, chip: Chip): boolean {
  const v = chip.value.toLowerCase();
  switch (chip.field) {
    case "location":
      return job.location.toLowerCase() === v;
    case "company":
      return job.department.toLowerCase().includes(v);
    case "title":
      return job.title.toLowerCase().includes(v);
    case "stack":
      return job.tags.split(",").some((t) => t.toLowerCase() === v);
  }
}

function matches(job: Job, chips: Chip[], loc: string[], stack: string[]): boolean {
  const byField = new Map<string, Chip[]>();
  for (const c of chips) byField.set(c.field, [...(byField.get(c.field) ?? []), c]);
  for (const group of byField.values()) {
    if (!group.some((c) => fieldMatch(job, c))) return false;
  }
  if (loc.length > 0 && !loc.includes(job.location)) return false;
  if (stack.length > 0 && !job.tags.split(",").some((t) => stack.includes(t))) return false;
  return true;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [intJobs, setIntJobs] = useState<Job[]>([]);
  const [appJobs, setAppJobs] = useState<Job[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [chips, setChips] = useState<Chip[]>([]);
  const [loc, setLoc] = useState<string[]>([]);
  const [stack, setStack] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.jobs(new URLSearchParams({ limit: "2000" })),
      api.marks("interested"),
      api.marks("applied"),
    ])
      .then(([all, int, app]) => {
        setJobs(all);
        setIntJobs(int);
        setAppJobs(app);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const marked = useMemo(() => {
    const m = new Map<number, MarkStatus>();
    intJobs.forEach((j) => m.set(j.id, "interested"));
    appJobs.forEach((j) => m.set(j.id, "applied"));
    return m;
  }, [intJobs, appJobs]);

  const knownValues = useMemo(
    () => ({
      location: [...new Set(jobs.map((j) => j.location))].sort(),
      stack: [...new Set(jobs.flatMap((j) => j.tags.split(",")).filter(Boolean))].sort(),
      company: [...new Set(jobs.map((j) => j.department))].sort(),
      title: [] as string[],
    }),
    [jobs],
  );

  const base = tab === "all" ? jobs : tab === "interested" ? intJobs : appJobs;
  const visible = base.filter((j) => matches(j, chips, loc, stack));

  const toggle = async (job: Job, kind: MarkStatus) => {
    try {
      if (marked.get(job.id) === kind) {
        await api.removeMark(job.id);
        setIntJobs(intJobs.filter((j) => j.id !== job.id));
        setAppJobs(appJobs.filter((j) => j.id !== job.id));
      } else {
        await api.setMark(job.id, kind);
        setIntJobs(
          kind === "interested"
            ? [...intJobs.filter((j) => j.id !== job.id), job]
            : intJobs.filter((j) => j.id !== job.id),
        );
        setAppJobs(
          kind === "applied"
            ? [...appJobs.filter((j) => j.id !== job.id), job]
            : appJobs.filter((j) => j.id !== job.id),
        );
      }
    } catch {
      navigate("/login");
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: `All (${jobs.length})` },
    { id: "interested", label: `☆ Interested (${intJobs.length})` },
    { id: "applied", label: `✓ Applied (${appJobs.length})` },
  ];

  return (
    <div>
      <div className="flex gap-1 border-b border-gray-200 bg-white px-4 pt-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`border-b-2 px-3.5 py-2 text-sm ${
              tab === t.id ? "border-gray-900 font-bold" : "border-transparent"
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white p-2.5 px-4">
        <SmartFilterBar
          chips={chips}
          knownValues={knownValues}
          onAdd={(c) => setChips([...chips, c])}
          onRemove={(i) => setChips(chips.filter((_, x) => x !== i))}
        />
        <MultiSelect label="Location" values={knownValues.location} selected={loc} onChange={setLoc} />
        <MultiSelect label="Stack" values={knownValues.stack} selected={stack} onChange={setStack} />
      </div>
      <p className="px-4 py-2 text-[13px] text-gray-500">{visible.length} jobs</p>
      <table className="w-full bg-white text-sm">
        <thead>
          <tr className="text-left">
            <th className="px-3 py-2"></th>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Location</th>
            <th className="px-3 py-2">Stack</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((j) => (
            <tr key={j.id} className="border-t border-gray-100 hover:bg-indigo-50/50">
              <td className="whitespace-nowrap px-3 py-2 text-lg">
                <span
                  title="Mark as interested"
                  className={`mr-2.5 cursor-pointer ${marked.get(j.id) === "interested" ? "text-yellow-600" : "text-gray-300"}`}
                  onClick={() => toggle(j, "interested")}
                >
                  ☆
                </span>
                <span
                  title="Mark as applied"
                  className={`cursor-pointer ${marked.get(j.id) === "applied" ? "text-green-700" : "text-gray-300"}`}
                  onClick={() => toggle(j, "applied")}
                >
                  ✓
                </span>
              </td>
              <td className="px-3 py-2">
                <a href={j.url} className="text-blue-700">
                  {j.title}
                </a>
                {!j.is_active && <span className="ml-2 text-xs text-red-700">⛔ no longer posted</span>}
              </td>
              <td className="px-3 py-2">{j.location}</td>
              <td className="px-3 py-2">
                {j.tags
                  .split(",")
                  .filter(Boolean)
                  .map((t) => (
                    <span key={t} className="mr-1 rounded bg-indigo-50 px-1.5 py-px text-xs">
                      {t}
                    </span>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
