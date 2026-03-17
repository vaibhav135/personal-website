import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://vaibhav135.dev',
  output: 'static',
  integrations: [sitemap(), mdx(), react()],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
});