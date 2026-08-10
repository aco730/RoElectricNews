// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import sitemap from '@astrojs/sitemap';

import netlify from '@astrojs/netlify';

// Local (astro dev / astro build local): adaptor Node, admin scrie pe disc.
// Pe Netlify (build automat, seteaza NETLIFY=true): adaptor Netlify, admin blocat de middleware.
const peNetlify = Boolean(process.env.NETLIFY);

// https://astro.build/config
export default defineConfig({
  site: 'https://buildhubro.netlify.app',
  output: 'server',
  adapter: peNetlify ? netlify() : node({ mode: 'standalone' }),
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/api/'),
    }),
  ],
});