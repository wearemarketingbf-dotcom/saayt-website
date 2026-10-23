# SAAYT صيت · Website

Marketing website for SAAYT (saayt.app) · Arabic first at `/` and English at `/en/`

Built with [Astro](https://astro.build) as a fully static site

## Run locally

```bash
npm ci
npm run dev      # http://localhost:4321
npm run build    # output in dist/
```

## Settings to fill before launch

Edit `src/config.ts`

| Key | What it does |
|---|---|
| `whatsapp` | WhatsApp number (digits only). Empty hides WhatsApp buttons |
| `formEndpoint` | Webhook URL for the demo form (GoHighLevel or similar). Empty opens a prefilled email |
| `loginUrl` | App login link. Empty hides it |
| `email` | Contact email |

Also review
- `src/content/legal/` · privacy policy and terms are drafts that need a Saudi lawyer and real company details
- Prices are not published on purpose · the pricing page asks for a quote

## Deploy

- Preview: GitHub Pages via `.github/workflows/deploy.yml` (noindex while on github.io)
- Production: point saayt.app to the host and build with `SITE_URL=https://saayt.app BASE_PATH=/` and without `NOINDEX`

## Structure

- `src/pages/` routes (Arabic) and `src/pages/en/` (English)
- `src/components/pages/` page templates shared by both languages
- `src/data/` all page copy in Arabic and English
- `src/content/blog/` articles · `src/content/legal/` legal pages
- `public/` images, video and brand files
