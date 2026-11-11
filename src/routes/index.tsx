import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getHomeData } from "@/lib/blog.functions";
import { PostCard, PostCardSkeleton, PostRow } from "@/components/site/PostCard";
import { SearchBar } from "@/components/site/SearchBar";
import { Newsletter } from "@/components/site/Newsletter";
import { EmptyState } from "@/components/site/EmptyState";
import { Button } from "@/components/ui/button";

const homeQuery = queryOptions({ queryKey: ["home"], queryFn: () => getHomeData() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meridian — Thoughtful writing on building things" },
      { name: "description", content: "Read thoughtful articles on engineering, design, product and culture from the Meridian community." },
      { property: "og:title", content: "Meridian — Thoughtful writing on building things" },
      { property: "og:description", content: "Read thoughtful articles on engineering, design, product and culture from the Meridian community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  pendingComponent: HomeSkeleton,
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const [lead, ...restFeatured] = data.featured;
  const featuredIds = new Set(data.featured.map((p) => p.id));
  const latest = data.latest.filter((p) => !featuredIds.has(p.id)).concat(data.latest.filter((p) => featuredIds.has(p.id))).slice(0, 6);
  const topCategories = data.categories.slice(0, 6);

  return (
    <>
      <section className="container-page pb-16 pt-16 md:pt-24">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <p className="eyebrow text-primary">An independent publication</p>
          <h1 className="mt-5 text-5xl font-medium leading-[1.05] text-foreground md:text-7xl">
            Ideas worth <em className="font-normal italic text-primary">reading slowly.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Clear, practical writing on engineering, design and the craft of building products people love.
          </p>
          <SearchBar size="lg" className="mx-auto mt-9 max-w-xl" />
          {topCategories.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {topCategories.map((c) => (
                <Link
                  key={c.id}
                  to="/blog"
                  search={{ page: 1, q: undefined, category: c.slug }}
                  className="rounded-full border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-page" aria-labelledby="featured-heading">
        <div className="flex items-end justify-between border-b pb-4">
          <h2 id="featured-heading" className="text-3xl font-medium">Featured</h2>
          <Link to="/blog" className="group inline-flex items-center gap-1 text-sm font-medium text-primary">
            All articles <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
        {lead ? (
          <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
            <PostCard post={lead} variant="lead" eager />
            <div className="flex flex-col gap-10">
              {restFeatured.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState title="No featured stories yet" description="Featured articles chosen by the editors will appear here." />
          </div>
        )}
      </section>

      <section className="container-page mt-24 grid gap-16 lg:grid-cols-[1.7fr_1fr]">
        <div aria-labelledby="latest-heading">
          <h2 id="latest-heading" className="border-b pb-4 text-3xl font-medium">Latest articles</h2>
          {latest.length ? (
            <div className="mt-8">
              {latest.map((p) => (
                <PostRow key={p.id} post={p} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState title="Nothing published yet" description="New articles will show up here as soon as they're published." />
            </div>
          )}
          <Button asChild variant="outline" className="mt-8">
            <Link to="/blog">Browse the archive</Link>
          </Button>
        </div>

        <aside aria-labelledby="categories-heading" className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="categories-heading" className="border-b pb-4 text-3xl font-medium">Popular topics</h2>
          {data.categories.length ? (
            <ul className="mt-6 divide-y">
              {data.categories.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/blog"
                    search={{ page: 1, q: undefined, category: c.slug }}
                    className="group flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <div className="font-serif text-xl group-hover:text-primary">{c.name}</div>
                      {c.description && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{c.description}</p>}
                    </div>
                    <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      {c.post_count}
                      <ArrowUpRight className="size-3.5 opacity-0 transition group-hover:opacity-100" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">Topics will appear once categories are added.</p>
          )}
        </aside>
      </section>

      <Newsletter />
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="container-page py-24">
      <div className="mx-auto h-16 max-w-2xl animate-pulse rounded-xl bg-muted" />
      <div className="mt-20 grid gap-10 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
