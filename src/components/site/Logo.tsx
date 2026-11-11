import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "default" }: { className?: string; tone?: "default" | "inverse" }) {
  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex items-baseline gap-1.5 font-serif text-2xl font-medium tracking-tight",
        tone === "inverse" ? "text-ink-foreground" : "text-foreground",
        className,
      )}
      aria-label="Meridian home"
    >
      Meridian
      <span className="inline-block size-2 rounded-full bg-primary transition-transform group-hover:scale-125" aria-hidden />
    </Link>
  );
}
