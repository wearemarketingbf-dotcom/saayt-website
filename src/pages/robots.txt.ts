import type { APIRoute } from 'astro';
import { CONFIG } from '../config';
export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString() || '').replace(/\/$/, '') + (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const body = CONFIG.noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${base}sitemap-index.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
