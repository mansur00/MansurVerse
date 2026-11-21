import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const siteStage = import.meta.env.PUBLIC_SITE_STAGE ?? 'development';
  const isDevelopment = siteStage !== 'production';

  if (isDevelopment) {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  const sitemapUrl = site ? new URL('sitemap-index.xml', site).href : '/sitemap-index.xml';
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
