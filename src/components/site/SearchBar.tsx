import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

export function SearchBar({ defaultValue = "", category, className, size = "default" }: { defaultValue?: string; category?: string; className?: string; size?: "default" | "lg" }) {
  const navigate = useNavigate();
  const [value, setValue] = useState(defaultValue);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim().slice(0, 120);
    navigate({ to: "/blog", search: { page: 1, q: q || undefined, category } });
  }

  return (
    <form role="search" onSubmit={onSubmit} className={cn("relative w-full", className)}>
      <label htmlFor="site-search" className="sr-only">Search articles</label>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        id="site-search"
        type="search"
        value={value}
        maxLength={120}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles, topics, ideas…"
        className={cn(
          "w-full rounded-full border bg-card pl-11 pr-28 shadow-[var(--shadow-card)] transition placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10",
          size === "lg" ? "h-14 text-base" : "h-11 text-sm",
        )}
      />
      <button
        type="submit"
        className={cn(
          "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90",
          size === "lg" ? "h-11" : "h-8",
        )}
      >
        Search
      </button>
    </form>
  );
}
