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
| `apiContactEndpoint` | SAAYT API contact endpoint (`https://api.saayt.app/v1/public/contact`). When set the form posts there instead of `formEndpoint`: the message shows in the SAAYT admin and the API forwards it to the CRM webhook (server env `CONTACT_FORWARD_WEBHOOK`; this site's origin must be in `CONTACT_ALLOWED_ORIGINS`). Empty keeps today's behaviour |
| `loginUrl` | App login link. Empty hides it |
| `email` | Contact email |

Also review
- `src/content/legal/` · privacy policy and terms are drafts that need a Saudi lawyer and real company details
- Prices are not published on purpose · the pricing page asks for a quote

## Site search and assistant

- Search: [Pagefind](https://pagefind.app) builds one index per language after `astro build` (`npm run build`). The header search button, `/` or Ctrl/Cmd+K opens it. In `npm run dev` there is no index, so test search with `npm run build && npm run preview`. What gets indexed: `pagefind.yml`
- Assistant: «مساعد صيت الآلي» answers from `src/data/faq.ar.json` and `src/data/faq.en.json` (each a list of `{ "q", "a", "tags", "link" }`). The first 4 questions are the starter questions. Write answers only from what the site says and link each to its page (`/pricing/`, `/en/pricing/`). `tags` are extra words visitors may type. When nothing matches it shows site search results, WhatsApp (when `whatsapp` is set) and the demo page. No AI, no storage and no cookies

## Deploy

- Live: https://saayt.app on GitHub Pages (custom domain set in repo Settings → Pages, DNS on Cloudflare)
- Demo form posts to a GoHighLevel inbound webhook (workflow "SAAYT website · Demo request") which creates the contact, tags it, adds a note, opens an opportunity and emails the team

## Structure

- `src/pages/` routes (Arabic) and `src/pages/en/` (English)
- `src/components/pages/` page templates shared by both languages
- `src/data/` all page copy in Arabic and English
- `src/content/blog/` articles · `src/content/legal/` legal pages
- `public/` images, video and brand files
