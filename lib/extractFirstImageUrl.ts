import { siteConfig } from "@/config/site";

// Utility to extract the first image URL from MDX or Contentful content
// Handles both MDX (string) and Contentful rich text (object)

export function extractFirstImageUrl({ mdx, contentful }: { mdx?: string, contentful?: any }): string | null {
  // Helper to ensure absolute URL
  function toAbsolute(url: string): string {
    if (!url) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("//")) return "https:" + url;
    if (url.startsWith("/")) return siteConfig.url + url;
    return url;
  }
  // 1. MDX: look for <img src="..."> or ![alt](url)
  if (mdx) {
    const htmlImgMatch = mdx.match(/<img[^>]+src=["']([^"'>]+)["']/i);
    if (htmlImgMatch) return toAbsolute(htmlImgMatch[1]);
    const mdImgMatch = mdx.match(/!\[[^\]]*\]\(([^)]+)\)/);
    if (mdImgMatch) return toAbsolute(mdImgMatch[1]);
  }
  // 2. Contentful: traverse rich text for embedded-asset-block or image node
  if (contentful && typeof contentful === 'object' && Array.isArray(contentful.content)) {
    const queue = [...contentful.content];
    while (queue.length) {
      const node = queue.shift();
      if (!node) continue;
      if (node.nodeType === 'embedded-asset-block' && node.data?.target?.fields?.file?.url) {
        let url = node.data.target.fields.file.url;
        return toAbsolute(url);
      }
      if (node.nodeType === 'image' && node.data?.src) {
        return toAbsolute(node.data.src);
      }
      if (Array.isArray(node.content)) queue.push(...node.content);
    }
  }
  return null;
}
