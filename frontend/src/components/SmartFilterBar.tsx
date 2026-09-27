import { useState } from "react";
import type { Chip } from "../api";

const FIELDS = ["location", "stack", "company", "title"] as const;
type Field = (typeof FIELDS)[number];

interface Props {
  chips: Chip[];
  knownValues: Record<Field, string[]>;
  onAdd: (chip: Chip) => void;
  onRemove: (index: number) => void;
}

export default function SmartFilterBar({ chips, knownValues, onAdd, onRemove }: Props) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = (): { label: string; apply: () => void }[] => {
    const v = text.trim();
    if (!v) return [];
    const colon = v.indexOf(":");
    if (colon > 0) {
      const field = v.slice(0, colon).toLowerCase() as Field;
      if (!FIELDS.includes(field)) return [];
      const q = v.slice(colon + 1).toLowerCase();
      if (field === "title") {
        if (!q) return [];
        return [{ label: `title contains "${q}"`, apply: () => onAdd({ field, value: q }) }];
      }
      return knownValues[field]
        .filter((x) => x.toLowerCase().includes(q))
        .slice(0, 8)
        .map((x) => ({ label: x, apply: () => onAdd({ field, value: x }) }));
    }
    return FIELDS.filter((f) => f.startsWith(v.toLowerCase())).map((f) => ({
      label: `${f}:`,
      apply: () => setText(`${f}:`),
    }));
  };

  const items = suggestions();

  return (
    <div className="flex flex-wrap items-start gap-2">
      {chips.map((c, i) => (
        <span
          key={i}
          className="rounded-full bg-indigo-50 py-1 pl-3 pr-1 text-sm"
        >
          <b className="text-indigo-700">{c.field}:</b> {c.value}
          <span className="ml-1 cursor-pointer text-gray-500" onClick={() => onRemove(i)}>
            ✕
          </span>
        </span>
      ))}
      <div className="relative">
        <input
          className="w-72 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm"
          placeholder="filter… try location:, stack:, company:"
          value={text}
          autoComplete="off"
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && items.length > 0) {
              items[0].apply();
              setText("");
            }
            if (e.key === "Escape") setOpen(false);
          }}
        />
        {open && items.length > 0 && (
          <div className="absolute z-10 mt-1 min-w-56 rounded-lg border border-gray-300 bg-white shadow-lg">
            {items.map((it, i) => (
              <div
                key={i}
                className="cursor-pointer px-3 py-1.5 text-sm hover:bg-indigo-50"
                onMouseDown={() => {
                  it.apply();
                  setText("");
                }}
              >
                {it.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
