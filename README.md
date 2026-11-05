# SAAYT صيت · Website

Marketing website for SAAYT (saayt.app) · Arabic first at `/` and English at `/en/`

Built with [Astro](https://astro.build) as a fully static site

## Run locally

```bash
npm ci
npm run dev      # http://localhost:4321
npm run build    # content from GoHighLevel (when its secrets are set), build, search index, SEO check · output in dist/
npm test         # the content fetch against a local fake
```

## Content and publishing

The content lives in **GoHighLevel** (the SAAYT sub-account, two custom objects) and is edited in the **SAAYT CMS** (Laravel, its own repo and sign-in). The website reads it at build time, so the live site never calls HighLevel

**Publish**: press «انشر التغييرات» in the CMS, or by hand in GitHub: Actions → Deploy saayt.app to GitHub Pages → Run workflow. A push to `main` publishes too. The run fetches the content, builds, runs the SEO check and deploys in a few minutes. If any step fails, nothing is deployed, the live site stays as it was and the failed run says what to fix

**The files in git are the fallback**: with no HighLevel secrets (local work, forks, CI without access) the build uses the committed files in `src/data/` and `src/content/`

| HighLevel record | File the build writes |
|---|---|
| `custom_objects.saayt_site_content` · `content_key` `home`, `scan`, `seo/pages` · `locale` `ar` or `en` | `src/data/{key}/{ar,en}.json` |
| same · `faq` | `src/data/faq.{ar,en}.json` (the assistant's answers; the first 4 are the starter questions) |
| same · `features/{slug}`, `industries/{slug}` | `src/data/{features,industries}/{ar,en}/{slug}.json` (slugs from `src/data/schema.ts`) |
| same · `settings`, `seo/site` · `locale` `all` | `src/data/settings.json`, `src/data/seo/site.json` |
| `custom_objects.saayt_documents` · `doc_type` `blog` or `legal`, `slug`, `locale`, `status` | `src/content/{blog,legal}/{ar,en}/{slug}.md` (front matter JSON + Markdown body) |

**What the fetch does** (`scripts/fetch-content.mjs`, `npm run content:fetch`, the first step of `npm run build`)
- Reads every record of both objects (search endpoint, page by page), joins long text saved in parts (`part` 1, 2, 3 …) and writes each file in one fixed format
- Skips drafts and removes a blog or legal file that has no published record; every article and legal page must be published in both languages
- Downloads every HighLevel media URL the content uses to `public/media/ghl-<hash>.<ext>` and points the content at that copy
- Stops the build before writing anything when a record does not fit, naming the file and the field (bad JSON, a wrong front matter field, a missing language, parts from an unfinished save …). Page fields are then checked by the site's own schemas in `src/data/*.ts` during `astro build`
- Retries on HighLevel rate limits (429) and server errors (5xx) as the HighLevel docs advise, then fails the run

**Settings for the team** (GitHub → Settings → Secrets and variables → Actions)
- Secrets: `GHL_TOKEN` (a Private Integration Token of the SAAYT sub-account with the scope `objects/record.readonly`) and `GHL_LOCATION_ID` (the sub-account id). Without them the deploy keeps using the files in git
- Optional variable: `GHL_API_VERSION` (the `Version` header, default `2021-07-28`)
- The CMS needs a GitHub token that can run this workflow (Actions: read and write on this repo) to press publish

**Working locally**
- `npm run build` uses the files in git
- `GHL_TOKEN=… GHL_LOCATION_ID=… npm run content:fetch` writes the HighLevel content into `src/` (commit it to refresh the fallback)
- `npm test` runs the fetch against a local fake: `node scripts/lib/ghl-fake.mjs /tmp/ghl` exports the current files as fake records, then `GHL_FAKE_DIR=/tmp/ghl npm run build` builds from them

**Contact messages** are personal data, so they never go into this repo or HighLevel content objects: the demo form sends them to the GoHighLevel CRM and the team email. The CMS page «رسائل التواصل» links to the CRM inbox set in Site settings (`crmInboxUrl`)

## Developer settings

Edit `src/config.ts` (not in the CMS)

| Key | What it does |
|---|---|
| `formEndpoint` | Webhook URL for the demo form (GoHighLevel or similar). Empty opens a prefilled email |
| `apiContactEndpoint` | SAAYT API contact endpoint (`https://api.saayt.app/v1/public/contact`). When set the form posts there instead of `formEndpoint`: the message shows in the SAAYT admin and the API forwards it to the CRM webhook (server env `CONTACT_FORWARD_WEBHOOK`; this site's origin must be in `CONTACT_ALLOWED_ORIGINS`). Empty keeps today's behaviour |
| `gaId` | Google Analytics 4, loaded in consent mode |

`whatsapp`, `loginUrl`, `email` and the socials come from `src/data/settings.json` (CMS: إعدادات الموقع)

Also review
- `src/content/legal/` · privacy policy and terms are drafts that need a Saudi lawyer and real company details
- Prices are published on the pricing page: per-branch bands from SAR 99 a month, the calculator and the founding offer live in `src/components/pages/PricingPage.astro` (a developer change, not in the CMS)

## SEO

- Each page has a canonical link, `ar-SA` and `en` alternates and `x-default` to Arabic; the sitemap lists the same pairs and leaves out noindex pages; `robots.txt` points to the sitemap
- Structured data: Organization and WebSite on every page, BreadcrumbList on inner pages, BlogPosting on articles, FAQPage where a page shows questions, Product with the real price on the pricing page. No ratings or reviews
- `npm run seo:check` (run at the end of `npm run build`) fails the build on a missing title or description, a title over 60 or a description over 160 characters (Arabic counted the same way), duplicate titles, an image without alt, an internal link or file that does not exist, a page without its language pair, broken structured data, and assistant FAQ links that are missing or in the wrong language

## Site search and assistant

- Search: [Pagefind](https://pagefind.app) builds one index per language after `astro build` (`npm run build`). The header search button, `/` or Ctrl/Cmd+K opens it. In `npm run dev` there is no index, so test search with `npm run build && npm run preview`. What gets indexed: `pagefind.yml`
- Assistant: «مساعد صيت الآلي» answers from `src/data/faq.ar.json` and `src/data/faq.en.json` (CMS: أسئلة المساعد الآلي; each a list of `{ "q", "a", "tags", "link" }`). The first 4 questions are the starter questions. Write answers only from what the site says and link each to its page (`/pricing/`, `/en/pricing/`). `tags` are extra words visitors may type. When nothing matches it shows site search results, WhatsApp (when `whatsapp` is set) and the demo page. No AI, no storage and no cookies

## Deploy

- Live: https://saayt.app on GitHub Pages (custom domain set in repo Settings → Pages, DNS on Cloudflare)
- Demo form posts to a GoHighLevel inbound webhook (workflow "SAAYT website · Demo request") which creates the contact, tags it, adds a note, opens an opportunity and emails the team

## Structure

- `src/pages/` routes (Arabic) and `src/pages/en/` (English)
- `src/components/pages/` page templates shared by both languages
- `src/data/` page copy, settings and SEO as JSON per language (edited in the SAAYT CMS), read and checked by the `.ts` files next to them
- `src/content/blog/` articles · `src/content/legal/` legal pages
- `scripts/fetch-content.mjs` content from GoHighLevel · `scripts/lib/` its file rules and the local fake · `scripts/tests/` its tests · `scripts/seo-check.mjs` the SEO check
- `public/` images, video and brand files · media from HighLevel is copied to `public/media/` at build time
