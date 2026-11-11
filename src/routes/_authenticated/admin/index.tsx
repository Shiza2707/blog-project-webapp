import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileCheck2, FilePen, FileText, FolderPlus, Mail, PenSquare, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadError, PageHeader, StatusBadge } from "@/components/admin/AdminShell";
import { EmptyState } from "@/components/site/EmptyState";
import { adminStatsQuery } from "@/lib/admin-queries";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Meridian" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { profile } = useAuth();
  const { data, isPending, error, refetch } = useQuery(adminStatsQuery);

  const stats = [
    { label: "Total posts", value: data?.total, icon: FileText },
    { label: "Published", value: data?.published, icon: FileCheck2 },
    { label: "Drafts", value: data?.drafts, icon: FilePen },
    { label: "Registered users", value: data?.users, icon: Users },
  ];

  return (
    <>
      <PageHeader
        title={`Hello${profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}`}
        description="Here's what's happening across your publication."
        actions={
          <Button asChild>
            <Link to="/admin/posts/new"><PenSquare /> New post</Link>
          </Button>
        }
      />

      {error ? (
        <LoadError message={error.message} onRetry={() => void refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {s.label}
                  <s.icon className="size-4" />
                </div>
                {isPending ? <Skeleton className="mt-3 h-9 w-16" /> : <p className="mt-2 font-serif text-4xl">{s.value}</p>}
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <section className="rounded-2xl border bg-card shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="font-serif text-xl">Recent activity</h2>
                <Link to="/admin/posts" className="text-sm text-primary hover:underline">View all</Link>
              </div>
              {isPending ? (
                <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : data && data.recent.length ? (
                <ul className="divide-y">
                  {data.recent.map((p) => (
                    <li key={p.id}>
                      <Link to="/admin/posts/$id/edit" params={{ id: p.id }} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-muted/60">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Updated {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}
                            {p.category ? ` · ${p.category.name}` : ""}
                          </p>
                        </div>
                        <StatusBadge status={p.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-5">
                  <EmptyState title="No posts yet" description="Write your first article to get started." />
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
                <h2 className="font-serif text-xl">Quick actions</h2>
                <div className="mt-4 grid gap-2">
                  <Button asChild variant="outline" className="justify-start"><Link to="/admin/posts/new"><PenSquare /> Write a new post</Link></Button>
                  <Button asChild variant="outline" className="justify-start"><Link to="/admin/categories"><FolderPlus /> Manage categories</Link></Button>
                  <Button asChild variant="outline" className="justify-start"><Link to="/admin/users"><Users /> View users</Link></Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">Subscribers <Mail className="size-4" /></div>
                  {isPending ? <Skeleton className="mt-3 h-8 w-12" /> : <p className="mt-2 font-serif text-3xl">{data?.subscribers}</p>}
                </div>
                <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">Categories <FolderPlus className="size-4" /></div>
                  {isPending ? <Skeleton className="mt-3 h-8 w-12" /> : <p className="mt-2 font-serif text-3xl">{data?.categories}</p>}
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}
