import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function validateSitemap(filePath) {
  console.log(`\nValidating: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8').trim();

  // 1. Check for scripts
  if (content.toLowerCase().includes('<script')) {
    throw new Error('FAIL: Unexpected <script> tag detected in sitemap!');
  }

  // 2. XML Declaration
  if (!content.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    throw new Error('FAIL: Missing or invalid XML declaration at top of file!');
  }

  // 3. Root urlset
  if (!content.includes('<urlset') || !content.endsWith('</urlset>')) {
    throw new Error('FAIL: Root element is not <urlset>!</urlset>');
  }

  // 4. Verify only url children exist
  const bodyWithoutHeader = content
    .replace('<?xml version="1.0" encoding="UTF-8"?>', '')
    .replace(/<urlset[^>]*>/, '')
    .replace('</urlset>', '')
    .trim();

  const nonUrlTags = bodyWithoutHeader
    .replace(/<url>[\s\S]*?<\/url>/g, '')
    .trim();

  if (nonUrlTags.length > 0) {
    throw new Error(`FAIL: Found unexpected tags inside <urlset>: "${nonUrlTags}"`);
  }

  // 5. Check each URL entry
  const urls = [...content.matchAll(/<url>([\s\S]*?)<\/url>/g)];
  console.log(`✓ Total <url> elements found: ${urls.length}`);

  if (urls.length !== 10) {
    throw new Error(`FAIL: Expected 10 URLs, but found ${urls.length}`);
  }

  urls.forEach((u, i) => {
    const block = u[1];
    const locMatch = block.match(/<loc>(.*?)<\/loc>/);
    const lastmodMatch = block.match(/<lastmod>(.*?)<\/lastmod>/);
    const changefreqMatch = block.match(/<changefreq>(.*?)<\/changefreq>/);
    const priorityMatch = block.match(/<priority>(.*?)<\/priority>/);

    if (!locMatch) {
      throw new Error(`FAIL: Missing <loc> at URL #${i + 1}`);
    }
    const loc = locMatch[1];
    if (!loc.startsWith('https://halka-pic.vercel.app')) {
      throw new Error(`FAIL: Invalid domain in <loc> at URL #${i + 1}: ${loc}`);
    }

    if (!lastmodMatch) {
      throw new Error(`FAIL: Missing <lastmod> at URL #${i + 1}`);
    }
    const lastmod = lastmodMatch[1];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) {
      throw new Error(`FAIL: Invalid date format in <lastmod> at URL #${i + 1}: ${lastmod}`);
    }

    console.log(`  [${i + 1}/10] ${loc} (lastmod: ${lastmod}, priority: ${priorityMatch ? priorityMatch[1] : 'N/A'})`);
  });

  console.log('✓ Validation PASSED: Clean, valid XML sitemap with 0 foreign elements.');
}

try {
  validateSitemap(path.join(rootDir, 'public', 'sitemap.xml'));
  validateSitemap(path.join(rootDir, 'dist', 'sitemap.xml'));
  console.log('\n========================================');
  console.log('ALL SITEMAP VALIDATION CHECKS PASSED!');
  console.log('========================================\n');
} catch (err) {
  console.error('\nSITEMAP VALIDATION ERROR:', err.message);
  process.exit(1);
}
