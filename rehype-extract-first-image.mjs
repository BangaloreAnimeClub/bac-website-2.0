
import { visit } from "unist-util-visit";

export default function rehypeExtractFirstImage() {
  return (tree, file) => {
    let firstImageUrl = null;

    visit(tree, "element", (node) => {
      if (node.tagName === "img" && node.properties && node.properties.src) {
        if (!firstImageUrl) {
          firstImageUrl = node.properties.src;
          // Store it in file.data for Velite to pick up
          if (file.data && file.data.frontmatter) {
            file.data.frontmatter.firstImageUrl = firstImageUrl;
          } else if (file.data) {
            file.data.firstImageUrl = firstImageUrl;
          } else {
            // Fallback if file.data is not what we expect
            // This might happen depending on how Velite/Rehype interact
            file.data = { firstImageUrl };
          }
          return false; // Stop visiting after finding the first image
        }
      }
    });
  };
}
