import { ToolId, TOOLS_DATA } from '../types/tools';

const PATH_TO_TOOL: Record<string, ToolId> = {
  '/': 'compress-photo',
  '/compress-photo': 'compress-photo',
  '/image-to-pdf': 'image-to-pdf',
  '/signature-resizer': 'signature-resizer',
  '/passport-photo-maker': 'passport-photo-maker',
  '/compress-pdf': 'compress-pdf',
  '/pdf-to-jpg': 'pdf-to-jpg',
  '/merge-pdf': 'merge-pdf',
  '/split-pdf': 'split-pdf',
};

const TOOL_TO_PATH: Record<ToolId, string> = {
  'compress-photo': '/',
  'image-to-pdf': '/image-to-pdf',
  'signature-resizer': '/signature-resizer',
  'passport-photo-maker': '/passport-photo-maker',
  'compress-pdf': '/compress-pdf',
  'pdf-to-jpg': '/pdf-to-jpg',
  'merge-pdf': '/merge-pdf',
  'split-pdf': '/split-pdf',
};

export function getCurrentToolFromUrl(): ToolId {
  if (typeof window === 'undefined') return 'compress-photo';

  const rawPath = window.location.pathname.toLowerCase().replace(/\/+/g, '/').replace(/\/+$/, '');
  const path = (rawPath.startsWith('/') ? rawPath : `/${rawPath}`) || '/';
  if (PATH_TO_TOOL[path]) {
    return PATH_TO_TOOL[path];
  }

  // Check URL search param e.g. ?tool=signature-resizer
  const params = new URLSearchParams(window.location.search);
  const toolParam = params.get('tool') as ToolId;
  if (toolParam && TOOLS_DATA[toolParam]) {
    return toolParam;
  }

  // Check hash e.g. #/signature-resizer
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().replace(/\/+/g, '/').replace(/\/+$/, '');
  if (hash && PATH_TO_TOOL[`/${hash}`]) {
    return PATH_TO_TOOL[`/${hash}`];
  }

  return 'compress-photo';
}

export function updatePageMeta(toolId: ToolId) {
  if (typeof document === 'undefined') return;

  const data = TOOLS_DATA[toolId] || TOOLS_DATA['compress-photo'];
  document.title = data.pageTitle;

  // Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', data.metaDescription);

  // Update Canonical Link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  const cleanPath = data.path === '/' ? '' : data.path;
  canonical.setAttribute('href', `https://halkapic.com${cleanPath}`);
}

export function navigateToTool(toolId: ToolId) {
  if (typeof window === 'undefined') return;

  const targetPath = TOOL_TO_PATH[toolId] || '/';
  if (window.location.pathname !== targetPath) {
    window.history.pushState({ toolId }, '', targetPath);
  }

  updatePageMeta(toolId);
  window.dispatchEvent(new CustomEvent('halkapic-route-change', { detail: { toolId } }));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
