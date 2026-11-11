import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock } from "lucide-react";
import { getPostBySlug } from "@/lib/blog.functions";
import { readingTime } from "@/lib/slug";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/components/site/Markdown";
import { PostCard } from "@/components/site/PostCard";
import { UserAvatar } from "@/components/site/UserAvatar";
import { Newsletter } from "@/components/site/Newsletter";
import { Skeleton } from "@/components/ui/skeleton";

const postQuery = (slug: string) =>
  queryOptions({ queryKey: ["post", slug], queryFn: () => getPostBySlug({ data: { slug } }) });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!data.post) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return { meta: [{ title: "Article unavailable — Meridian" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${post.meta_title || post.title} — Meridian`;
    const description = post.meta_description || post.excerpt;
    const image = post.featured_image?.startsWith("https://") ? post.featured_image : null;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: post.meta_title || post.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        ...(post.published_at ? [{ property: "article:published_time", content: post.published_at }] : []),
        ...(post.category ? [{ property: "article:section", content: post.category.name }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
      ],
    };
  },
  pendingComponent: PostSkeleton,
  notFoundComponent: PostNotFound,
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  const post = data.post!;
  const authorName = post.author?.name || "Meridian Editorial";

  return (
    <>
      <article className="pt-12 md:pt-16">
        <header className="container-page max-w-3xl! text-center">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> All articles
          </Link>
          {post.category && (
            <div className="mt-8">
              <Link
                to="/blog"
                search={{ page: 1, q: undefined, category: post.category.slug }}
                className="eyebrow text-primary hover:underline"
              >
                {post.category.name}
              </Link>
            </div>
          )}
          <h1 className="mt-4 text-4xl font-medium leading-[1.1] md:text-6xl">{post.title}</h1>
          {post.excerpt && <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">{post.excerpt}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2.5">
              <UserAvatar name={authorName} src={post.author?.avatar_url} className="size-8" />
              <span className="font-medium text-foreground">{authorName}</span>
            </span>
            <span aria-hidden>·</span>
            <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {readingTime(post.content)} min read</span>
          </div>
        </header>

        {post.featured_image && (
          <div className="container-page mt-12 max-w-5xl!">
            <img
              src={post.featured_image}
              alt={post.title}
              width={1600}
              height={912}
              className="aspect-[16/9] w-full rounded-2xl object-cover"
            />
          </div>
        )}

        <div className="container-page mt-14 max-w-[42rem]!">
          <Markdown content={post.content} />

          {post.tags.length > 0 && (
            <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t}>
                  <Link
                    to="/blog"
                    search={{ page: 1, q: t, category: undefined }}
                    className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground hover:bg-primary-soft hover:text-accent-foreground"
                  >
                    #{t}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <section aria-label="About the author" className="mt-12 flex gap-5 rounded-2xl border bg-card p-6">
            <UserAvatar name={authorName} src={post.author?.avatar_url} className="size-14 text-base" />
            <div>
              <p className="eyebrow text-muted-foreground">Written by</p>
              <p className="mt-1 font-serif text-xl">{authorName}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {post.author?.bio || "Stories from the Meridian editorial team — practical writing for people who build things."}
              </p>
            </div>
          </section>
        </div>
      </article>

      {data.related.length > 0 && (
        <section className="container-page mt-24" aria-labelledby="related-heading">
          <h2 id="related-heading" className="border-b pb-4 text-3xl font-medium">Keep reading</h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {data.related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      <Newsletter />
    </>
  );
}

function PostSkeleton() {
  return (
    <div className="container-page max-w-3xl! pt-20 text-center">
      <Skeleton className="mx-auto h-4 w-24" />
      <Skeleton className="mx-auto mt-6 h-12 w-full" />
      <Skeleton className="mx-auto mt-3 h-12 w-2/3" />
      <Skeleton className="mt-12 aspect-[16/9] w-full rounded-2xl" />
    </div>
  );
}

function PostNotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow text-primary">Not found</p>
      <h1 className="mt-3 text-4xl font-medium md:text-5xl">This article isn't available.</h1>
      <p className="mt-4 text-muted-foreground">It may have been unpublished or the link is incorrect.</p>
      <Link to="/blog" className="mt-8 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Browse articles
      </Link>
    </div>
  );
}
