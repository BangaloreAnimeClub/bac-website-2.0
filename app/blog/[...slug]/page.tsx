// Add a comment about Velite type generation if #site/content is not found
// If you're seeing "Cannot find module '#site/content'", ensure Velite has generated types.
// You might need to run `pnpm velite` or `npx velite`, or add it to your dev script.
import { posts } from "#site/content";
import { MDXContent } from "@/components/mdx-components";
import { notFound } from "next/navigation";

import "@/styles/mdx.css";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Tag } from "@/components/tag";
// import { sortPosts } from "@/lib/utils"; // sortPosts seems unused in the provided snippet
import { CommentSection } from "@/components/comment-section";
import { fetchBlogPostBySlugWithEntries, fetchBlogPosts as fetchContentfulPosts } from "@/lib/contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { type Document } from "@contentful/rich-text-types"; // Import Document type

// Define types for processed posts
interface SpotlightEntry {
  title: string;
  content: Document | null; // Use Document type
  author: string;
}

interface BaseProcessedPost {
  slug: string;
  slugAsParams: string;
  title: string;
  description?: string;
  date: string;
  published: boolean;
  tags?: string[];
  firstImageUrl?: string;
}

interface LocalProcessedPost extends BaseProcessedPost {
  source: "local";
  body: any; // MDX content from Velite
  spotlightEntries?: never;
}

interface ContentfulProcessedPost extends BaseProcessedPost {
  source: "contentful";
  body: Document | null; // Use Document type
  spotlightEntries: SpotlightEntry[];
}

type ProcessedPost = LocalProcessedPost | ContentfulProcessedPost;

// Infer the type of a single post from the Velite-generated 'posts' array
// This assumes '#site/content' will correctly provide a typed 'posts' array once Velite runs.
type VelitePost = (typeof posts)[number];

interface PostPageProps {
  params: {
    slug: string[];
  };
}

async function getPostFromParams(params: PostPageProps["params"]): Promise<ProcessedPost | null> {
  const slug = params?.slug?.join("/");
  // Explicitly type 'postInCallback' if 'posts' is not yet correctly typed by Velite generation
  // If 'posts' is correctly typed as VelitePost[], this explicit type for 'p' is not strictly needed
  // but doesn't hurt.
  const localPost: VelitePost | undefined = posts.find((p: VelitePost) => p.slugAsParams === slug);

  if (localPost) {
    // Ensure firstImageUrl is passed along for local posts
    // The structure of localPost (VelitePost) should align with BaseProcessedPost fields
    return { ...localPost, source: "local", firstImageUrl: localPost.firstImageUrl };
  }

  // Try Contentful if not found locally
  const entry = await fetchBlogPostBySlugWithEntries(slug);
  if (entry && entry.fields) {
    const fields = entry.fields;
    let spotlightEntries: SpotlightEntry[] = [];
    if (Array.isArray(fields.entries)) {
      spotlightEntries = fields.entries.map((e: any) => {
        if (e.fields) {
          return {
            title: e.fields.title || "",
            content: (e.fields.content as Document) || null, // Cast to Document
            author: e.fields.author?.fields?.name || "",
          };
        }
        return null;
      }).filter(Boolean) as SpotlightEntry[]; // Assert type after filtering nulls
    }
    return {
      slug: String(fields.slug ?? ""),
      slugAsParams: String(fields.slug ?? ""),
      date: String(fields.date ?? ""),
      title: String(fields.title ?? ""),
      description: typeof fields.description === "string" ? fields.description : undefined,
      tags: Array.isArray(fields.tags) ? fields.tags.filter((t: unknown): t is string => typeof t === "string") : [],
      published: true, // Assuming fetched Contentful posts are considered published
      body: (fields.content as Document) || null, // Cast to Document
      spotlightEntries,
      source: "contentful",
      firstImageUrl: undefined, // Contentful posts don't have firstImageUrl from this logic
    };
  }
  return null;
}

// function isContentfulDocument(doc: any): doc is { nodeType: string; content: any[] } {
//   return (
//     doc &&
//     typeof doc === "object" &&
//     doc.nodeType === "document" &&
//     Array.isArray(doc.content)
//   );
// }

// Custom renderer for Contentful rich text
const contentfulRenderOptions = {
  renderNode: {
    'embedded-asset-block': (node: any) => {
      const { file, title, description } = node.data.target.fields;
      const url = file?.url?.startsWith('http') ? file.url : `https:${file.url}`;
      return (
        <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
          <img
            src={url}
            alt={title || description || ''}
            style={{ maxWidth: '100%', borderRadius: '0.5rem', margin: '0 auto' }}
          />
        </div>
      );
    },
    'hr': () => <hr className="my-4 mt-8 mb-8 border-t-2" />,
    'paragraph': (node: any, children: any) => {
      if (node.content.length === 1 && node.content[0].value === '\n') {
        return <br />;
      }
      return <p>{children}</p>;
    },
  },
  renderText: (text: string) => {
    return text.split('\n').reduce((acc, segment, i) => {
      if (i === 0) return [segment];
      return [...acc, <br key={i} />, segment];
    }, [] as (string | JSX.Element)[]);
  },
};

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await getPostFromParams(params);

  if (!post) {
    return {};
  }

  let determinedImageUrl = siteConfig.preview_image; // Default to site's main preview image

  if (post.firstImageUrl) {
    const imagePath = post.firstImageUrl;
    // Check if it's already an absolute URL
    if (imagePath.startsWith('https://') || imagePath.startsWith('http://')) {
      determinedImageUrl = imagePath;
    } else {
      // Assume it's a relative path that needs to be made absolute.
      // Ideally, images in MDX should be referenced with root-relative paths (e.g., /images/my-image.png)
      // which correspond to files in your `public` directory.
      const siteUrl = siteConfig.url.endsWith('/') ? siteConfig.url.slice(0, -1) : siteConfig.url;
      const relativePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      determinedImageUrl = `${siteUrl}${relativePath}`;
    }
  } else if (post.source === 'contentful') {
    // Placeholder for Contentful-specific image extraction if needed in the future.
    // For now, Contentful posts will use the default image if post.firstImageUrl is not set.
    // If Contentful entries have a dedicated 'featuredImage' field, you could fetch and use its URL here.
    // Example: if (post.contentfulFeaturedImageUrl) { determinedImageUrl = post.contentfulFeaturedImageUrl; }
  }

  // console.log(`Final OG Image for ${post.slugAsParams}: ${determinedImageUrl}`); // Optional: for debugging locally or in build logs

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${siteConfig.url}/blog/${post.slugAsParams}`,
      images: [
        {
          url: determinedImageUrl, // Ensure this is absolute
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [determinedImageUrl], // Ensure this is absolute
    },
  };
}

export async function generateStaticParams(): Promise<
  PostPageProps["params"][]
> {
  // Local MDX posts
  // Add type for 'post' in map callback if 'posts' is not yet correctly typed.
  const localParams = posts.map((post: VelitePost) => ({ slug: post.slugAsParams.split("/") }));

  // Contentful posts
  const contentfulRaw = await fetchContentfulPosts();
  const contentfulParams = contentfulRaw
    .map((entry: any) => entry.fields?.slug)
    .filter((slug: any): slug is string => typeof slug === "string" && slug.length > 0)
    .map((slug: string) => ({ slug: slug.split("/") }));

  return [...localParams, ...contentfulParams];
}

export default async function PostPage({ params }: PostPageProps) {
  const post: ProcessedPost | null = await getPostFromParams(params);

  if (!post || !post.published) {
    notFound();
  }

  return (
    <article className="container py-6 prose dark:prose-invert max-w-3xl px-4">
      <h1 className="mb-2 text-3xl lg:text-4xl">{String(post.title)}</h1>
      <div className="flex gap-2 mb-2">
        {Array.isArray(post.tags) && post.tags.map((tag: string) => // Explicitly type 'tag'
          <Tag tag={tag} key={tag} />
        )}
      </div>
      {post.description ? (
        <p className="text-lg mt-0 mb-1 text-muted-foreground">{String(post.description)}</p>
      ) : null}
      <hr className="my-4 mt-2 mb-4" />
      {/* Show date as first element inside the first spotlight entry */}
      {post.source === "contentful" && post.date && (
        <div className="text-base text-muted-foreground mb-4 mt-4">
          📅 <b>Date:</b> {(new Date(post.date)).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      )}
      {post.source === "contentful" && Array.isArray(post.spotlightEntries) && post.spotlightEntries.length > 0 ? (
        <div>
          {post.spotlightEntries.map((entry: SpotlightEntry, idx: number) => ( // Explicitly type 'entry' and 'idx'
            <div key={idx} style={{marginBottom: '32px'}}>
              <div style={{marginBottom: '-10px', marginTop: '0px'}}>
                <h1 className="text-3xl font-extrabold">{entry.title}</h1>
              </div>
              
              {entry.content && ( // Check if entry.content is not null
                <div className="mb-2">
                  {documentToReactComponents(entry.content, contentfulRenderOptions)}
                </div>
              )}
              {entry.author && (
                <div className="text-base text-muted-foreground mb-2">
                  <b>Credits:</b> {entry.author}
                </div>
              )}
              <hr className="my-4 mt-8 mb-8 border-t-2" />
            </div>
          ))}
        </div>
      ) : null}
      {/* For Contentful blogs without spotlight entries, insert date as first element inside content */}
      {post.source === "contentful" && post.body && (!post.spotlightEntries || post.spotlightEntries.length === 0) && ( // Check if post.body is not null
        <>
          {post.date && (
            <div className="text-base text-muted-foreground mb-2">
              📅 <b>Last Updated:</b> {(new Date(post.date)).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          )}
          {documentToReactComponents(post.body, contentfulRenderOptions)}
        </>
      )}
      {post.source !== "contentful" && <MDXContent code={String(post.body)} />}
      <p className="text-md mt-2 mb-0 text-muted-foreground text-justify">
        <i>All content on this website is protected by copyright and may not be copied, distributed, or reproduced in any form without the express written consent from <span className="font-semibold">team@bac.moe</span>.</i>
      </p>
      <CommentSection slug={String(post.slug)} />
    </article>
  );
}
