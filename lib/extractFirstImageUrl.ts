// Utility to extract the first image URL from MDX or Contentful content
// Handles both MDX (string) and Contentful rich text (object)

export function extractFirstImageUrl({ mdx, contentful }: { mdx?: string, contentful?: any }): string | null {
  // 1. MDX: look for <img src="..."> or ![alt](url)
  if (mdx) {
    // Try HTML <img src="...">
    const htmlImgMatch = mdx.match(/<img[^>]+src=["']([^"'>]+)["']/i);
    if (htmlImgMatch) return htmlImgMatch[1];
    // Try Markdown ![alt](url)
    const mdImgMatch = mdx.match(/!\[[^\]]*\]\(([^)]+)\)/);
    if (mdImgMatch) return mdImgMatch[1];
  }
  // 2. Contentful: traverse rich text for embedded-asset-block or image node
  if (contentful && typeof contentful === 'object' && Array.isArray(contentful.content)) {
    const queue = [...contentful.content];
    while (queue.length) {
      const node = queue.shift();
      if (!node) continue;
      if (node.nodeType === 'embedded-asset-block' && node.data?.target?.fields?.file?.url) {
        let url = node.data.target.fields.file.url;
        if (!url.startsWith('http')) url = 'https:' + url;
        return url;
      }
      if (node.nodeType === 'image' && node.data?.src) {
        return node.data.src;
      }
      if (Array.isArray(node.content)) queue.push(...node.content);
    }
  }
  return null;
}
