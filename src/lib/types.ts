export type ArticleKind =
  | "writing"
  | "code"
  | "design"
  | "adr"
  | "document"
  | "reflection";

export type PostFrontmatter = {
  title: string;
  excerpt: string;
  kind: ArticleKind;
  publishedAt: string;
  draft?: boolean;
  cover?: string;
  tags?: string[];
  relatedProjects?: string[];
};

export type LocaleCode = "en" | "fr";

export type AdminLocalePost = {
  frontmatter: PostFrontmatter;
  content: string;
  exists: boolean;
};

export type AdminPostPair = {
  slug: string;
  locales: Record<LocaleCode, AdminLocalePost | null>;
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
