import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function UserAvatar({ name, src, className }: { name?: string | null; src?: string | null; className?: string }) {
  return (
    <Avatar className={cn("size-9", className)}>
      {src ? <AvatarImage src={src} alt={name ?? ""} className="object-cover" /> : null}
      <AvatarFallback className="bg-primary-soft font-medium text-accent-foreground">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
