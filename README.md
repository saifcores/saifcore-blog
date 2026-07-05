# SAIFCORE Blog

Bilingual engineering publication for **SAIFCORE** — architecture guides, ADRs, and fintech insights. Built with **Next.js 16**, **MDX**, and **next-intl** (English / French).

Companion to the portfolio at [saifcore.tech](https://saifcore.tech).

---

## Features

| Area          | Details                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| **Content**   | MDX articles in `content/en/` and `content/fr/` — kinds: writing, code, design, adr, document, reflection |
| **Admin CMS** | `/admin` — password-protected editor; writes to disk locally or GitHub on Vercel                          |
| **Diagrams**  | Mermaid (flowcharts, C4) and Draw.io (`.drawio` + themed SVG exports)                                     |
| **Covers**    | Auto-generated SVG illustrations per article                                                              |
| **i18n**      | English (default) and French (`/` vs `/fr`)                                                               |
| **Theme**     | Light / dark / system with themed diagram variants                                                        |
| **RSS**       | `/feed.xml` (EN) and `/fr/feed.xml` (FR)                                                                  |
| **SEO**       | Per-page metadata, JSON-LD (`BlogPosting`), sitemap, robots                                               |

---

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command                   | Description                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| `npm run dev`             | Development server                                               |
| `npm run build`           | Sync icons, generate covers, export diagrams, production build   |
| `npm run start`           | Serve production build                                           |
| `npm run lint`            | ESLint                                                           |
| `npm run sync:icons`      | Resize `public/profile.png` → 32×32 favicon + 180×180 Apple icon |
| `npm run diagrams:export` | Export stale `.drawio` files to SVG via `drawio-headless`        |

---

## Environment variables

| Variable                    | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | Blog origin (e.g. `https://blog.saifcore.tech`)      |
| `NEXT_PUBLIC_PORTFOLIO_URL` | Portfolio link (e.g. `https://saifcore.tech`)        |
| `NEXT_PUBLIC_CALENDLY_URL`  | Optional “Book a call” button                        |
| `NEXT_PUBLIC_LINKEDIN_URL`  | Footer link                                          |
| `NEXT_PUBLIC_GITHUB_URL`    | Footer link                                          |
| `ADMIN_PASSWORD`            | Admin CMS password (required for `/admin`)           |
| `GITHUB_TOKEN`              | GitHub PAT with repo **Contents** write (Vercel CMS) |
| `GITHUB_REPO`               | Repo slug, e.g. `saifcores/saifcore-blog`            |
| `GITHUB_BRANCH`             | Branch for CMS commits (default: `main`)             |

---

## Admin CMS

Password-protected content manager at **`/admin`**.

```bash
# .env.local
ADMIN_PASSWORD=your-secure-password-here
```

| Route                      | Purpose                           |
| -------------------------- | --------------------------------- |
| `/admin/login`             | Sign in                           |
| `/admin`                   | Article list (draft / published)  |
| `/admin/posts/new`         | Create bilingual MDX article      |
| `/admin/posts/{slug}/edit` | Edit EN + FR, preview MDX, delete |

**Editor fields:** title, excerpt, kind, date, tags, related projects, cover path, draft flag, MDX body per locale.

**Drafts** are hidden from the public site, RSS, and sitemap until published.

> **Production (Vercel):** The server filesystem is read-only. Set `GITHUB_TOKEN`, `GITHUB_REPO`, and optionally `GITHUB_BRANCH` so saves commit MDX to GitHub. Without these, the admin UI loads but save/update returns an error.

Locally, CMS writes go to `content/*.mdx` on disk as before.

---

## Adding content

### New article

**Option A — Admin CMS:** `/admin/posts/new` (set `ADMIN_PASSWORD` in `.env.local`).

**Option B — Manual:**

1. Create `content/en/my-slug.mdx` and `content/fr/my-slug.mdx`
2. Frontmatter: `title`, `excerpt`, `kind`, `publishedAt`, `tags`, optional `draft: true`
3. Restart dev server — slug is picked up automatically

### Mermaid

````mdx
```mermaid
flowchart LR
  A --> B
```
````

Or `<Mermaid title="...">` component.

### Draw.io

1. Save source to `public/diagrams/my-diagram.drawio`
2. Export light SVG → `my-diagram.svg`
3. Export dark SVG → `my-diagram.dark.svg` (optional)
4. In MDX: `<Drawio src="/diagrams/my-diagram.drawio" title="..." />`

Run `npm run diagrams:export` to auto-export SVG from `.drawio` files.

---

## Project structure

```
content/{en,fr}/          MDX articles
public/
  profile.png             Avatar + favicon source
  diagrams/               Draw.io sources + SVG exports
  images/articles/        Generated cover illustrations
src/
  app/[locale]/           Pages (home, articles/[slug])
  components/mdx/         MDX components (Adr, Mermaid, Drawio, …)
  lib/posts.ts            Content loader
scripts/
  generate-covers.mjs     Cover SVG generator (runs on build)
  export-drawio.mjs       Draw.io → SVG export
```

---

## Deployment

1. Deploy to Vercel with `NEXT_PUBLIC_SITE_URL=https://blog.saifcore.tech`
2. Set `ADMIN_PASSWORD`, `GITHUB_TOKEN`, and `GITHUB_REPO=saifcores/saifcore-blog` in Vercel env vars
3. Set `NEXT_PUBLIC_BLOG_URL=https://blog.saifcore.tech` on the **portfolio** repo
4. Redeploy portfolio so article teasers link to the blog

---

## License

Private — © SAIFCORE
