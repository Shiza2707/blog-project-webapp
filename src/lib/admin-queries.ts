import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AdminPost = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  is_featured: boolean;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  category: { id: string; name: string } | null;
  author: { id: string; name: string } | null;
};

const ADMIN_POST_SELECT =
  "id, title, slug, status, is_featured, published_at, updated_at, created_at, category:categories(id, name), author:profiles(id, name)";

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export const adminStatsQuery = queryOptions({
  queryKey: ["admin", "stats"],
  queryFn: async () => {
    const count = (status?: "draft" | "published") => {
      let q = supabase.from("posts").select("id", { count: "exact", head: true });
      if (status) q = q.eq("status", status);
      return q;
    };
    const [total, published, drafts, users, subscribers, categories, recent] = await Promise.all([
      count(),
      count("published"),
      count("draft"),
      supabase.rpc("admin_list_users"),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("posts").select(ADMIN_POST_SELECT).order("updated_at", { ascending: false }).limit(6),
    ]);
    for (const r of [total, published, drafts, users, subscribers, categories, recent]) {
      if (r.error) throw new Error(r.error.message);
    }
    return {
      total: total.count ?? 0,
      published: published.count ?? 0,
      drafts: drafts.count ?? 0,
      users: users.data?.length ?? 0,
      subscribers: subscribers.count ?? 0,
      categories: categories.count ?? 0,
      recent: (recent.data ?? []) as unknown as AdminPost[],
    };
  },
});

export const adminPostsQuery = queryOptions({
  queryKey: ["admin", "posts"],
  queryFn: async () =>
    check(await supabase.from("posts").select(ADMIN_POST_SELECT).order("updated_at", { ascending: false })) as unknown as AdminPost[],
});

export const adminPostQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "post", id],
    queryFn: async () => check(await supabase.from("posts").select("*").eq("id", id).maybeSingle()),
  });

export const adminCategoriesQuery = queryOptions({
  queryKey: ["admin", "categories"],
  queryFn: async () =>
    check(await supabase.from("categories").select("id, name, slug, description, created_at, posts(count)").order("name")).map((c) => ({
      ...c,
      post_count: (c.posts as unknown as { count: number }[])?.[0]?.count ?? 0,
    })),
});

export const adminUsersQuery = queryOptions({
  queryKey: ["admin", "users"],
  queryFn: async () => check(await supabase.rpc("admin_list_users")),
});

export const adminSubscribersQuery = queryOptions({
  queryKey: ["admin", "subscribers"],
  queryFn: async () =>
    check(await supabase.from("newsletter_subscribers").select("id, email, created_at").order("created_at", { ascending: false })),
});
