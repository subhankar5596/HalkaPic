import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOOLS_DATA } from '../src/types/tools.ts';

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

function generateToolShellHtml(tool) {
  const isHomepage = tool.id === 'compress-photo';
  
  const uploaderCard = isHomepage ? `
    <div class="w-full">
      <div class="relative w-full rounded-3xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white text-center p-8 sm:p-12 shadow-sm transition-all">
        <div class="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
          <div class="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg class="w-10 h-10 stroke-current stroke-2 fill-none" viewBox="0 0 24 24"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9m-4-4 4 4 4-4"/></svg>
          </div>
          <div class="space-y-1.5">
            <span class="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base shadow-md shadow-blue-600/25">
              Upload Photo
            </span>
            <p class="text-sm text-slate-500 font-medium pt-2">
              or <span class="text-blue-600 font-semibold underline decoration-blue-300">Drag & Drop Image Here</span>
            </p>
          </div>
          <div class="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">JPG</span>
            <span class="text-slate-300">•</span>
            <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">JPEG</span>
            <span class="text-slate-300">•</span>
            <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">PNG</span>
            <span class="text-slate-300">•</span>
            <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">WebP</span>
          </div>
          <div class="pt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/80">
            <span>🔒 Your photos stay on your device. Never uploaded to any server.</span>
          </div>
          <p class="text-[11px] text-slate-500">
            Tip: You can also paste an image with Ctrl+V or ⌘+V
          </p>
        </div>
      </div>
    </div>
  ` : `
    <div class="flex flex-col items-center justify-center py-20 space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm text-center p-8">
      <div class="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm font-semibold text-slate-600">Loading ${tool.name}...</span>
    </div>
  `;

  const howToUseSection = tool.howToUse && tool.howToUse.length > 0 ? `
    <section class="py-8 border-t border-slate-200/80">
      <div class="max-w-4xl mx-auto px-4 sm:px-6">
        <div class="text-center space-y-2 mb-8">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/60">
            <span>Step-by-Step Instructions</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">How to Use ${tool.name}</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${tool.howToUse.map(item => `
            <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <span class="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center mb-3">${item.step}</span>
                <h3 class="font-bold text-slate-900 text-base mb-1">${item.title}</h3>
                <p class="text-xs text-slate-500 leading-relaxed">${item.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  ` : '';

  return `<div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
      <a href="/" class="flex items-center gap-2.5 sm:gap-3 group focus:outline-none">
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
          <svg class="w-6 h-6 fill-none stroke-current stroke-[2.2]" viewBox="0 0 24 24"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9m-4-4 4 4 4-4"/></svg>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">Halka<span class="text-blue-600">Pic</span></span>
            <span class="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px] tracking-wider uppercase border border-blue-200/60">Free</span>
          </div>
          <span class="text-[10px] sm:text-xs text-slate-500 font-medium hidden xs:block">Make Your Photos Lighter, Instantly.</span>
        </div>
      </a>
      <nav class="hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600">
        <a href="/" class="px-3 py-1.5 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-colors ${isHomepage ? 'font-bold text-blue-700 bg-blue-50' : ''}">Compress Photo</a>
        <a href="/image-to-pdf" class="px-3 py-1.5 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-colors ${tool.id === 'image-to-pdf' ? 'font-bold text-blue-700 bg-blue-50' : ''}">Image to PDF</a>
        <a href="/signature-resizer" class="px-3 py-1.5 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-colors ${tool.id === 'signature-resizer' ? 'font-bold text-blue-700 bg-blue-50' : ''}">Signature Resizer</a>
        <a href="/passport-photo-maker" class="px-3 py-1.5 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-colors ${tool.id === 'passport-photo-maker' ? 'font-bold text-blue-700 bg-blue-50' : ''}">Passport Photo</a>
        <a href="/compress-pdf" class="px-3 py-1.5 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-colors ${tool.id === 'compress-pdf' ? 'font-bold text-blue-700 bg-blue-50' : ''}">Compress PDF</a>
        <a href="/pdf-to-jpg" class="px-3 py-1.5 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-colors ${tool.id === 'pdf-to-jpg' ? 'font-bold text-blue-700 bg-blue-50' : ''}">PDF to JPG</a>
        <a href="/merge-pdf" class="px-3 py-1.5 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-colors ${tool.id === 'merge-pdf' ? 'font-bold text-blue-700 bg-blue-50' : ''}">Merge PDF</a>
        <a href="/split-pdf" class="px-3 py-1.5 rounded-xl hover:text-blue-600 hover:bg-slate-50 transition-colors ${tool.id === 'split-pdf' ? 'font-bold text-blue-700 bg-blue-50' : ''}">Split PDF</a>
      </nav>
    </div>
  </header>
  <main class="flex-1">
    <section id="tool-root" class="pt-8 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6">
      <div class="space-y-12 sm:space-y-16">
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-bold border border-blue-200/60 shadow-xs">
            <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>100% In-Browser • Free • No Uploads</span>
          </div>
          <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">${tool.h1}</h1>
          <p class="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">${tool.tagline}</p>
          ${tool.introText ? `<p class="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed pt-1">${tool.introText}</p>` : ''}
        </div>
        <div class="max-w-3xl mx-auto">${uploaderCard}</div>
        ${howToUseSection}
      </div>
    </section>
  </main>
  <footer class="mt-auto border-t border-slate-200 bg-white text-slate-600 text-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
        <div>🔒 Photos processed locally on your device. Never saved on our servers.</div>
        <div>&copy; 2026 HalkaPic. All rights reserved.</div>
      </div>
    </div>
  </footer>
</div>`;
}

console.log('Generating pre-rendered static HTML entrypoints for all routes...');

// 1. Pre-render homepage root index.html
const homeTool = TOOLS_DATA['compress-photo'];
const homeShell = generateToolShellHtml(homeTool);
let updatedRootHtml = baseHtml.replace('<div id="root"></div>', `<div id="root">${homeShell}</div>`);
fs.writeFileSync(baseHtmlPath, updatedRootHtml, 'utf8');
console.log('✓ Injected pre-rendered static shell into dist/index.html (Instant LCP/FCP)');

// 2. Pre-render each secondary route
const secondaryToolKeys = Object.keys(TOOLS_DATA).filter(k => k !== 'compress-photo');

for (const toolId of secondaryToolKeys) {
  const tool = TOOLS_DATA[toolId];
  const targetDir = path.join(distDir, tool.path.replace(/^\//, ''));
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let html = baseHtml;
  // Replace title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${tool.pageTitle}</title>`);
  
  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${tool.metaDescription}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="https://halka-pic.vercel.app${tool.path}" />`
  );

  // Replace og:title & og:description
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${tool.pageTitle}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${tool.metaDescription}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="https://halka-pic.vercel.app${tool.path}" />`
  );

  // Replace twitter tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${tool.pageTitle}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${tool.metaDescription}" />`
  );

  // Inject route static shell
  const toolShell = generateToolShellHtml(tool);
  html = html.replace('<div id="root"></div>', `<div id="root">${toolShell}</div>`);

  const destFile = path.join(targetDir, 'index.html');
  fs.writeFileSync(destFile, html, 'utf8');
  console.log(`✓ Pre-rendered: ${destFile}`);
}

console.log('Static route entrypoints and instant shells generated successfully!');
