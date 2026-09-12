import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { SPECIALIZATION_OPTIONS } from "@/data/specializations";

type Props = {
  selected: string[];
  onChange: (values: string[]) => void;
};

export function SpecializationMultiSelect({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => {
    const savedOnly = selected.filter(
      (value) => !SPECIALIZATION_OPTIONS.some((option) => option.toLowerCase() === value.toLowerCase()),
    );
    return [...savedOnly, ...SPECIALIZATION_OPTIONS];
  }, [selected]);
  const visibleOptions = options.filter((option) => option.toLowerCase().includes(search.trim().toLowerCase()));

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  function toggle(value: string) {
    const isSelected = selected.some((item) => item.toLowerCase() === value.toLowerCase());
    onChange(isSelected ? selected.filter((item) => item.toLowerCase() !== value.toLowerCase()) : [...selected, value]);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="mt-2 flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-2 text-left outline-none focus:ring-2 focus:ring-primary/30"
      >
        <span className={selected.length ? "flex flex-wrap gap-1.5" : "text-muted-foreground"}>
          {selected.length ? selected.map((value) => (
            <span key={value} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {value}
              <X aria-hidden="true" className="h-3 w-3" />
            </span>
          )) : "Select one or more specializations"}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClick={(event) => event.stopPropagation()}
              placeholder="Search specialties..."
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="mt-2 max-h-64 overflow-y-auto pr-1">
            {visibleOptions.length ? visibleOptions.map((option) => {
              const checked = selected.some((item) => item.toLowerCase() === option.toLowerCase());
              return (
                <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted">
                  <span className={`flex h-4 w-4 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-white" : "border-border"}`}>
                    {checked && <Check className="h-3 w-3" />}
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => toggle(option)} className="sr-only" />
                  <span className="text-foreground">{option}</span>
                </label>
              );
            }) : <p className="px-3 py-4 text-sm text-muted-foreground">No specialty found.</p>}
          </div>
          <p className="px-2 pt-2 text-xs text-muted-foreground">Choose as many as apply. You can leave the rest unselected.</p>
        </div>
      )}
    </div>
  );
}
