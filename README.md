# personal-website

My personal portfolio site, built to look and feel like Neovim with a Dracula color scheme. Tabline, file tree sidebar, statusline, command line easter eggs — the whole deal.

## Tech Stack

- **Framework**: [Astro 5](https://astro.build/) (static SSG, TypeScript)
- **Theme**: Dracula color palette, JetBrains Mono font
- **Deploy**: Cloudflare Pages via GitHub Actions
- **Package manager**: Bun

## Quick Start

```bash
bun install
bun dev        # http://localhost:4321
bun run build  # outputs to dist/
```

## Project Structure

```
src/
  components/   TabLine, FileTree, StatusLine, CommandLine
  layouts/      NeoVimLayout (full editor chrome), DashboardLayout (homepage)
  pages/        about.astro, experience.astro, contact.astro, blog/
  content/blog/ Markdown blog posts (Astro content collections)
  data/         Site config, nav items
  styles/       dracula.css, neovim.css, animations.css, global.css
  types.ts      Shared TypeScript interfaces
```

Each page has its own "language" personality — `about.ts`, `experience.lua`, `contact.sh`, `blog/` (directory listing).

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that builds with Astro and deploys to Cloudflare Pages. PRs get a build check but no deploy.

The workflow lives in `.github/workflows/deploy.yml` and expects `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets in the `cloudflare` GitHub environment.
