#!/usr/bin/env node
// Auto-generate blog-search-index.ts from MDX blog files
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../content/blog');
const OUT_FILE = path.join(__dirname, '../components/blog-search-index.ts');

function getFrontmatter(content) {
  const match = content.match(/^---([\s\S]*?)---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) fm[key.trim()] = rest.join(':').trim().replace(/^['"]|['"]$/g, '');
  });
  return fm;
}

function getHeaders(content) {
  const headers = [];
  // 1. Match Markdown headers (e.g., #, ##, ###) anywhere in the line, even inside HTML tags
  const mdHeaderAnywhereRegex = /#\s*([\w\s'"\-:×#0-9!.,&()]+)(?=\n|$)/gim;
  let match;
  while ((match = mdHeaderAnywhereRegex.exec(content))) {
    if (match[1]) headers.push(match[1].replace(/\*\*|_/g, '').replace(/<[^>]+>/g, '').trim());
  }
  // 2. Match HTML headers <h1>, <h2>, <h3>, etc.
  const htmlHeaderRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gim;
  while ((match = htmlHeaderRegex.exec(content))) {
    if (match[1]) headers.push(match[1].replace(/<[^>]+>/g, '').replace(/\*\*|_/g, '').trim());
  }
  // 3. Match <div> with Markdown header inside (e.g., <div> # **Header** </div>)
  const divHeaderRegex = /<div[^>]*>[^#]*#\s*([\w\s'"\-:×#0-9!.,&()]+).*?<\/div>/gims;
  while ((match = divHeaderRegex.exec(content))) {
    if (match[1]) headers.push(match[1].replace(/\*\*|_/g, '').replace(/<[^>]+>/g, '').trim());
  }
  // Remove duplicates and empty
  return [...new Set(headers.filter(Boolean))];
}

function getAllMdxFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllMdxFiles(filePath));
    } else if (file.endsWith('.mdx')) {
      results.push(filePath);
    }
  });
  return results;
}

function slugFromFilePath(filePath) {
  return path.basename(filePath).replace(/\.mdx$/, '');
}

function main() {
  const files = getAllMdxFiles(BLOG_DIR);
  const index = files.map(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const fm = getFrontmatter(content);
    const headers = getHeaders(content);
    return {
      title: fm.title || path.basename(filePath),
      description: fm.description || "",
      slug: slugFromFilePath(filePath),
      headers: headers.slice(0, 5),
    };
  });
  const out = `// Blog search index for main-nav search bar\n// This file is auto-generated. Do not edit manually.\n\nexport const blogSearchIndex = ${JSON.stringify(index, null, 2)};\n`;
  fs.writeFileSync(OUT_FILE, out);
  console.log(`Wrote ${index.length} blog entries to blog-search-index.ts`);
}

main();
