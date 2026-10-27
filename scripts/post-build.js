import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const baseHtmlPath = path.join(distDir, 'index.html');
if (!fs.existsSync(baseHtmlPath)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(baseHtmlPath, 'utf8');

const ROUTES = [
  {
    path: '/image-to-pdf',
    title: 'Image to PDF Converter Online Free | HalkaPic',
    description: 'Convert multiple JPG, JPEG, PNG, and WebP images to a single PDF document in your browser. Arrange page order, pick A4 or Fit-to-Image with zero server uploads.',
  },
  {
    path: '/signature-resizer',
    title: 'Signature Resizer Online to 10KB, 20KB, 50KB | HalkaPic',
    description: 'Resize signature image dimensions in pixels and compress signature file size to 10KB, 20KB, 30KB, or 50KB for online exam & government job portals.',
  },
  {
    path: '/passport-photo-maker',
    title: 'Passport Size Photo Maker Online Free | HalkaPic',
    description: 'Crop, zoom, rotate and make standard 35x45mm or 2x2 inch passport size photos with clean background and 300 DPI high-resolution export.',
  },
  {
    path: '/compress-pdf',
    title: 'Compress PDF Online Free - Reduce PDF Size | HalkaPic',
    description: 'Compress PDF documents directly in your browser. Choose Low, Medium, or High compression without permanent server storage.',
  },
  {
    path: '/pdf-to-jpg',
    title: 'PDF to JPG Converter Online Free | HalkaPic',
    description: 'Convert PDF pages to high-quality JPG images directly in your browser. Preview pages, download individual images, or save all as a ZIP.',
  },
  {
    path: '/merge-pdf',
    title: 'Merge PDF Online Free - Combine PDF Files | HalkaPic',
    description: 'Combine multiple PDF files into one single document in your browser. Drag and drop reordering, 100% private and free.',
  },
  {
    path: '/split-pdf',
    title: 'Split PDF Online Free - Extract PDF Pages | HalkaPic',
    description: 'Split PDF files and extract custom page ranges (e.g. 1-3, 5) or separate all pages into a ZIP archive. Fast, free, and private.',
  },
];

console.log('Generating static HTML entrypoints for all tool routes...');

for (const route of ROUTES) {
  const targetDir = path.join(distDir, route.path.replace(/^\//, ''));
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let html = baseHtml;
  // Replace title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);
  
  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${route.description}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="https://halka-pic.vercel.app${route.path}" />`
  );

  // Replace og:title & og:description
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${route.title}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${route.description}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="https://halka-pic.vercel.app${route.path}" />`
  );

  // Replace twitter tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${route.title}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${route.description}" />`
  );

  const destFile = path.join(targetDir, 'index.html');
  fs.writeFileSync(destFile, html, 'utf8');
  console.log(`✓ Created: ${destFile}`);
}

console.log('Static route entrypoints generated successfully!');
