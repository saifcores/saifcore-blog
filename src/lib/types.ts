export type ArticleKind = "writing" | "code" | "design" | "adr" | "document";

export type PostFrontmatter = {
  title: string;
  excerpt: string;
  kind: ArticleKind;
  publishedAt: string;
  cover?: string;
  tags?: string[];
  relatedProjects?: string[];
};

export type PostMeta = PostFrontmatter & {
  slug: string;
  coverImage: string;
  readingTime: string;
};

export type Post = {
  meta: PostMeta;
  content: string;
};
