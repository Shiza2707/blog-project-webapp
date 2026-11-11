import { Link } from "@tanstack/react-router";
import { ExternalLink, FileText, FolderTree, LayoutDashboard, LogOut, Mail, Menu, PenSquare, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { UserAvatar } from "@/components/site/UserAvatar";
import { useSignOut } from "@/components/site/Navbar";
import { useAuth } from "@/hooks/use-auth";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/posts", label: "Posts", icon: FileText, exact: false },
  { to: "/admin/posts/new", label: "Write a post", icon: PenSquare, exact: true },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, exact: true },
  { to: "/admin/users", label: "Users", icon: Users, exact: true },
  { to: "/admin/subscribers", label: "Subscribers", icon: Mail, exact: true },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { profile, user } = useAuth();
  const signOut = useSignOut();
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-6">
        <Logo tone="inverse" className="text-xl" />
        <span className="eyebrow ml-2 rounded bg-sidebar-accent px-1.5 py-0.5 text-[0.6rem] text-sidebar-foreground">Admin</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin">
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeOptions={{ exact: item.exact }}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:font-medium data-[status=active]:text-sidebar-accent-foreground"
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
        <Link to="/" onClick={onNavigate} className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-sidebar-accent">
          <ExternalLink className="size-4" /> View site
        </Link>
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={profile?.name || user?.email} src={profile?.avatar_url} className="size-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-accent-foreground">{profile?.name || "Admin"}</p>
            <p className="truncate text-xs">{user?.email}</p>
          </div>
          <button onClick={() => void signOut()} className="rounded-md p-2 hover:bg-sidebar-accent" aria-label="Sign out">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-secondary/60">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <SidebarContent />
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Logo className="text-xl" />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open admin menu"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-0 p-0">
            <SheetTitle className="sr-only">Admin menu</SheetTitle>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-medium md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: "draft" | "published" }) {
  return status === "published" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success">
      <span className="size-1.5 rounded-full bg-success" /> Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning">
      <span className="size-1.5 rounded-full bg-warning" /> Draft
    </span>
  );
}

export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
      <p className="font-medium text-destructive">Something went wrong</p>
      <p className="mt-1 text-muted-foreground">{message}</p>
      {onRetry && <Button size="sm" variant="outline" className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
