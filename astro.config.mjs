// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The real origin comes from PUBLIC_SITE_URL (set in CI or the host); see docs/02-engineering/pages-and-routing.md.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !page.includes('/styleguide') && !page.includes('/404') }),
  ],
  vite: { plugins: [tailwindcss()] },
});
