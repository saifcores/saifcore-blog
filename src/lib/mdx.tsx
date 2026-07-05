import type { ComponentProps } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Adr } from "@/components/mdx/adr";
import { mdxComponents } from "@/components/mdx";

type AdrLabels = {
  statusLabel: string;
  contextLabel: string;
  decisionLabel: string;
  consequencesLabel: string;
};

export async function renderMdx(source: string, adrLabels?: AdrLabels) {
  const components = {
    ...mdxComponents,
    Adr: (props: ComponentProps<typeof Adr>) => (
      <Adr {...props} {...adrLabels} />
    ),
  };

  const { content } = await compileMDX({
    source,
    components,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
  });

  return content;
}
