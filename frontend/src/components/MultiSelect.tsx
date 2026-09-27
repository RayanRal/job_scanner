import { useState } from "react";

interface Props {
  label: string;
  values: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function MultiSelect({ label, values, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  return (
    <div className="relative">
      <button
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
        onClick={() => setOpen(!open)}
      >
        {label} {selected.length > 0 && <b>({selected.length})</b>} ▾
      </button>
      {open && (
        <div className="absolute z-10 mt-1 min-w-40 rounded-lg border border-gray-300 bg-white p-2 shadow-lg">
          {values.map((v) => (
            <label key={v} className="block cursor-pointer px-1 py-0.5 text-sm">
              <input
                type="checkbox"
                className="mr-2"
                checked={selected.includes(v)}
                onChange={() => toggle(v)}
              />
              {v}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
