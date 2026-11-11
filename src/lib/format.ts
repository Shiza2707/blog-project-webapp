import { format } from "date-fns";

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return format(new Date(value), "MMM d, yyyy");
}

export function initials(name: string | null | undefined): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
