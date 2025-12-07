// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import remarkAnimflow from './src/plugins/remark-animflow';

// https://astro.build/config
export default defineConfig({
  site: 'https://tech-blog.example.com',
  output: 'server', // SSR 모드 (개별 페이지에서 prerender: true로 정적 생성)
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  integrations: [mdx(), react(), sitemap()],
  markdown: {
    remarkPlugins: [remarkAnimflow],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});