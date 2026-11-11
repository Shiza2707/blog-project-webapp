import { Link } from "@tanstack/react-router";
import type { PostSummary } from "@/lib/blog-types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "./UserAvatar";

function Meta({ post }: { post: PostSummary }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <UserAvatar name={post.author?.name ?? "Meridian Editorial"} src={post.author?.avatar_url} className="size-6 text-[0.6rem]" />
      <span className="font-medium text-foreground">{post.author?.name || "Meridian Editorial"}</span>
      <span aria-hidden>·</span>
      <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
    </div>
  );
}

function Cover({ post, className, eager }: { post: PostSummary; className?: string; eager?: boolean }) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-muted", className)}>
      {post.featured_image ? (
        <img
          src={post.featured_image}
          alt=""
          width={1600}
          height={912}
          loading={eager ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary-soft font-serif text-4xl text-accent-foreground">
          {post.title.charAt(0)}
        </div>
      )}
    </div>
  );
}

export function PostCard({ post, variant = "default", eager }: { post: PostSummary; variant?: "default" | "lead"; eager?: boolean }) {
  const lead = variant === "lead";
  return (
    <article className="group relative flex flex-col">
      <Cover post={post} eager={eager} className={lead ? "aspect-[16/10]" : "aspect-[16/10]"} />
      <div className={cn("flex flex-1 flex-col", lead ? "mt-6" : "mt-5")}>
        {post.category && (
          <Link
            to="/blog"
            search={{ page: 1, q: undefined, category: post.category.slug }}
            className="eyebrow relative z-10 w-fit text-primary hover:underline"
          >
            {post.category.name}
          </Link>
        )}
        <h3 className={cn("mt-2.5 font-medium leading-snug text-foreground", lead ? "text-3xl md:text-4xl" : "text-xl")}>
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="link-underline after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className={cn("mt-3 text-muted-foreground", lead ? "text-lg leading-relaxed" : "line-clamp-2 text-[0.95rem] leading-relaxed")}>
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto pt-5">
          <Meta post={post} />
        </div>
      </div>
    </article>
  );
}

export function PostRow({ post }: { post: PostSummary }) {
  return (
    <article className="group relative grid grid-cols-[1fr_7rem] gap-5 border-b py-6 first:pt-0 last:border-0 sm:grid-cols-[1fr_10rem]">
      <div>
        {post.category && <span className="eyebrow text-primary">{post.category.name}</span>}
        <h3 className="mt-2 text-xl font-medium leading-snug">
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="link-underline after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 hidden text-[0.95rem] text-muted-foreground sm:block">{post.excerpt}</p>
        <div className="mt-3 text-sm text-muted-foreground">
          <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
        </div>
      </div>
      <Cover post={post} className="aspect-square sm:aspect-[4/3]" />
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-[16/10] w-full rounded-xl" />
      <Skeleton className="mt-5 h-3 w-20" />
      <Skeleton className="mt-3 h-6 w-4/5" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
  );
}
