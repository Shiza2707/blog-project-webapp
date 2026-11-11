import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { listCategories, listPosts } from "@/lib/blog.functions";
import { PostCard, PostCardSkeleton } from "@/components/site/PostCard";
import { SearchBar } from "@/components/site/SearchBar";
import { EmptyState } from "@/components/site/EmptyState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BlogSearch = { page: number; q: string | undefined; category: string | undefined };

const postsQuery = (s: BlogSearch) =>
  queryOptions({ queryKey: ["posts", s], queryFn: () => listPosts({ data: s }) });
const categoriesQuery = queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() });

export const Route = createFileRoute("/blog/")({
  validateSearch: (search: Record<string, unknown>): BlogSearch => {
    const page = Number(search.page);
    const q = typeof search.q === "string" && search.q.trim() ? search.q.trim().slice(0, 120) : undefined;
    const category = typeof search.category === "string" && /^[a-z0-9-]{1,80}$/.test(search.category) ? search.category : undefined;
    return { page: Number.isInteger(page) && page > 0 ? Math.min(page, 1000) : 1, q, category };
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    const [, categories] = await Promise.all([
      context.queryClient.ensureQueryData(postsQuery(deps)),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
    return { categoryName: categories.find((c) => c.slug === deps.category)?.name ?? null };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.categoryName ? `${loaderData.categoryName} articles — Meridian` : "All articles — Meridian";
    const description = loaderData?.categoryName
      ? `Browse every Meridian article about ${loaderData.categoryName.toLowerCase()}.`
      : "Browse every article published on Meridian. Search by keyword or filter by topic.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  pendingComponent: BlogSkeleton,
  component: BlogIndex,
});

function BlogIndex() {
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(postsQuery(search));
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const active = categories.find((c) => c.slug === search.category);

  return (
    <div className="container-page pb-8 pt-14 md:pt-20">
      <header className="max-w-3xl">
        <p className="eyebrow text-primary">The archive</p>
        <h1 className="mt-4 text-5xl font-medium md:text-6xl">{active ? active.name : "All articles"}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {active?.description || "Every story we've published, newest first."}
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-5 border-b pb-8">
        <SearchBar key={`${search.q}-${search.category}`} defaultValue={search.q ?? ""} category={search.category} className="max-w-xl" />
        <nav aria-label="Filter by category" className="flex flex-wrap gap-2">
          <CategoryChip label="All" active={!search.category} search={{ page: 1, q: search.q, category: undefined }} />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.name}
              count={c.post_count}
              active={search.category === c.slug}
              search={{ page: 1, q: search.q, category: c.slug }}
            />
          ))}
        </nav>
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {data.total} {data.total === 1 ? "article" : "articles"}
        {search.q ? <> matching “<span className="text-foreground">{search.q}</span>”</> : null}
      </p>

      {data.posts.length ? (
        <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {data.posts.map((p, i) => (
            <PostCard key={p.id} post={p} eager={i < 3} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={<SearchX className="size-5" />}
            title="No articles found"
            description={search.q ? "Try a different keyword or clear the filters." : "There are no published articles in this topic yet."}
            action={
              <Button asChild variant="outline">
                <Link to="/blog" search={{ page: 1, q: undefined, category: undefined }}>Clear filters</Link>
              </Button>
            }
          />
        </div>
      )}

      {data.pageCount > 1 && (
        <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Pagination">
          <Button asChild variant="outline" size="sm" className={cn(search.page <= 1 && "pointer-events-none opacity-40")}>
            <Link to="/blog" search={{ ...search, page: Math.max(1, search.page - 1) }} aria-disabled={search.page <= 1}>
              <ChevronLeft /> Previous
            </Link>
          </Button>
          {Array.from({ length: data.pageCount }, (_, i) => i + 1).map((n) => (
            <Button key={n} asChild size="sm" variant={n === search.page ? "default" : "ghost"} className="w-9">
              <Link to="/blog" search={{ ...search, page: n }} aria-current={n === search.page ? "page" : undefined}>
                {n}
              </Link>
            </Button>
          ))}
          <Button asChild variant="outline" size="sm" className={cn(search.page >= data.pageCount && "pointer-events-none opacity-40")}>
            <Link to="/blog" search={{ ...search, page: Math.min(data.pageCount, search.page + 1) }} aria-disabled={search.page >= data.pageCount}>
              Next <ChevronRight />
            </Link>
          </Button>
        </nav>
      )}
    </div>
  );
}

function CategoryChip({ label, count, active, search }: { label: string; count?: number; active: boolean; search: BlogSearch }) {
  return (
    <Link
      to="/blog"
      search={search}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:border-primary hover:text-primary",
      )}
    >
      {label}
      {count !== undefined && <span className={cn("font-mono text-[0.7rem]", active ? "opacity-80" : "opacity-60")}>{count}</span>}
    </Link>
  );
}

function BlogSkeleton() {
  return (
    <div className="container-page pt-20">
      <div className="h-14 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
