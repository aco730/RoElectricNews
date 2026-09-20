// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import sitemap from '@astrojs/sitemap';

import netlify from '@astrojs/netlify';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// Local (astro dev / astro build local): adaptor Node, admin scrie pe disc.
// Pe Netlify (build automat, seteaza NETLIFY=true): adaptor Netlify, admin blocat de middleware.
const peNetlify = Boolean(process.env.NETLIFY);

// https://astro.build/config
export default defineConfig({
  site: 'https://roelectricnews.netlify.app',
  output: 'server',
  adapter: peNetlify ? netlify() : node({ mode: 'standalone' }),

  integrations: [sitemap({
    filter: (page) => !page.includes('/admin') && !page.includes('/api/'),
  }), react()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        // Matches the CMS project's own "@/*" -> project-root convention, so
        // components ported from cms/components|lib keep working unmodified.
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      watch: {
        // These live at the project root (raw photo/video archives, several
        // GB each) and are never imported by any page — watching them makes
        // Vite's file watcher (and Tailwind's content scan) crawl gigabytes
        // on every change, causing multi-second "program reload"s across
        // the whole site. None of this is source code, so it's safe to
        // exclude entirely from dev-server watching.
        ignored: [
          '**/_arhiva-business/**',
          '**/baza-date-poze/**',
          '**/poze-noi/**',
          '**/portofoliu poze solar electric panel/**',
          '**/execută content nou/**',
          '**/electric NEWS/**',
          '**/Firmă montaj fotovoltaic stocare zona Făgăraș/**',
        ],
      },
    },
  },
});