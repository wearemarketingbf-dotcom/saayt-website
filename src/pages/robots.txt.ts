import type { APIRoute } from 'astro';
import { CONFIG } from '../config';
export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString() || '').replace(/\/$/, '') + (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const path = new URL(base).pathname; // '/' on saayt.app, '/repo/' on the github.io preview
  const body = CONFIG.noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: ${path}admin/\n\nSitemap: ${base}sitemap-index.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
