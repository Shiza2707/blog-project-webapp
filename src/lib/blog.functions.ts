import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { sanitizeSearch } from "./slug";
import {
  POST_SUMMARY_SELECT,
  type CategoryWithCount,
  type PostDetail,
  type PostSummary,
} from "./blog-types";

export const PAGE_SIZE = 9;

// Read-only client for public data; Row Level Security limits it to published content.
function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function fail(context: string, error: unknown): never {
  console.error(`[blog] ${context}`, error);
  throw new Error("We couldn't load this content right now. Please try again.");
}

async function categoriesWithCounts(): Promise<CategoryWithCount[]> {
  const sb = publicClient();
  const { data, error } = await sb
    .from("categories")
    .select("id, name, slug, description, posts(count)")
    .order("name");
  if (error) fail("categories", error);
  return (data ?? []).map((c) => {
    const counts = c.posts as unknown as { count: number }[] | null;
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      post_count: counts?.[0]?.count ?? 0,
    };
  });
}

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [featured, latest, categories] = await Promise.all([
    sb
      .from("posts")
      .select(POST_SUMMARY_SELECT)
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(3),
    sb
      .from("posts")
      .select(POST_SUMMARY_SELECT)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(6),
    categoriesWithCounts(),
  ]);
  if (featured.error) fail("featured", featured.error);
  if (latest.error) fail("latest", latest.error);
  return {
    featured: (featured.data ?? []) as unknown as PostSummary[],
    latest: (latest.data ?? []) as unknown as PostSummary[],
    categories: [...categories].sort((a, b) => b.post_count - a.post_count),
  };
});

export const getFeaturedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("posts")
    .select(POST_SUMMARY_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(6);
  if (error) fail("featured", error);
  return (data ?? []) as unknown as PostSummary[];
});

export const listCategories = createServerFn({ method: "GET" }).handler(() => categoriesWithCounts());

const listInput = z.object({
  page: z.number().int().min(1).max(1000).default(1),
  q: z.string().max(120).optional(),
  category: z.string().max(80).optional(),
});

export const listPosts = createServerFn({ method: "GET" })
  .inputValidator((input: z.input<typeof listInput>) => listInput.parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    let categoryId: string | null = null;
    if (data.category) {
      const { data: cat, error } = await sb
        .from("categories")
        .select("id")
        .eq("slug", data.category)
        .maybeSingle();
      if (error) fail("category lookup", error);
      if (!cat) return { posts: [] as PostSummary[], total: 0, page: data.page, pageCount: 0 };
      categoryId = cat.id;
    }

    const from = (data.page - 1) * PAGE_SIZE;
    let query = sb
      .from("posts")
      .select(POST_SUMMARY_SELECT, { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (categoryId) query = query.eq("category_id", categoryId);
    const q = data.q ? sanitizeSearch(data.q) : "";
    if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`);

    const { data: rows, error, count } = await query;
    if (error && error.code !== "PGRST103") fail("list posts", error);
    const total = count ?? 0;
    return {
      posts: (rows ?? []) as unknown as PostSummary[],
      total,
      page: data.page,
      pageCount: Math.ceil(total / PAGE_SIZE),
    };
  });

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(180) }).parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: post, error } = await sb
      .from("posts")
      .select(
        "id, title, slug, excerpt, content, featured_image, published_at, updated_at, tags, is_featured, meta_title, meta_description, category:categories(id, name, slug), author:profiles(id, name, avatar_url, bio)",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) fail("post", error);
    if (!post) return { post: null, related: [] as PostSummary[] };

    const detail = post as unknown as PostDetail;
    let relatedQuery = sb
      .from("posts")
      .select(POST_SUMMARY_SELECT)
      .eq("status", "published")
      .neq("id", detail.id)
      .order("published_at", { ascending: false })
      .limit(3);
    if (detail.category) relatedQuery = relatedQuery.eq("category_id", detail.category.id);
    const { data: related, error: relErr } = await relatedQuery;
    if (relErr) fail("related", relErr);

    let relatedPosts = (related ?? []) as unknown as PostSummary[];
    if (relatedPosts.length < 3) {
      const { data: more } = await sb
        .from("posts")
        .select(POST_SUMMARY_SELECT)
        .eq("status", "published")
        .not("id", "in", `(${[detail.id, ...relatedPosts.map((p) => p.id)].join(",")})`)
        .order("published_at", { ascending: false })
        .limit(3 - relatedPosts.length);
      relatedPosts = [...relatedPosts, ...((more ?? []) as unknown as PostSummary[])];
    }
    return { post: detail, related: relatedPosts };
  });
