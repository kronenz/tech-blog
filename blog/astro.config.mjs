// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkAnimflow from './src/plugins/remark-animflow';

// https://astro.build/config
export default defineConfig({
  site: 'https://tech-blog.example.com',
  integrations: [mdx(), react(), sitemap()],
  markdown: {
    remarkPlugins: [remarkAnimflow],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});