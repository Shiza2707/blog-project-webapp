export type CategoryRef = { id: string; name: string; slug: string };
export type AuthorRef = { id: string; name: string; avatar_url: string | null; bio?: string | null };

export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string | null;
  tags: string[];
  is_featured: boolean;
  category: CategoryRef | null;
  author: AuthorRef | null;
};

export type PostDetail = PostSummary & {
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  updated_at: string;
};

export type CategoryWithCount = CategoryRef & { description: string | null; post_count: number };

export const POST_SUMMARY_SELECT =
  "id, title, slug, excerpt, featured_image, published_at, tags, is_featured, category:categories(id, name, slug), author:profiles(id, name, avatar_url)";
