import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vaibhavbisht.dev',
  output: 'static',
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
});
