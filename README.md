# SAAYT صيت · Website

Marketing website for SAAYT (saayt.app) · Arabic first at `/` and English at `/en/`

Built with [Astro](https://astro.build) as a fully static site

## Run locally

```bash
npm ci
npm run dev      # http://localhost:4321
npm run build    # output in dist/
```

## Editing the site

Content, SEO and contact settings are edited at **https://saayt.app/admin/** with [Sveltia CMS](https://sveltiacms.app) (free, open source). It reads and writes the files in this repo, Arabic and English side by side

**Sign in**
1. You need write access to `wearemarketingbf-dotcom/saayt-website` on GitHub
2. Make a token: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate. Repository access: only `saayt-website`. Permissions: Contents → Read and write. Pick an expiry (90 days is fine). If the organization asks to approve fine-grained tokens, an owner approves it once. A classic token with the `repo` scope also works
3. Open `/admin/`, choose «تسجيل الدخول باستخدام رمز الوصول» and paste the token. It stays in that browser only

**Collections**

| In the CMS | Files | What it holds |
|---|---|---|
| المدونة | `src/content/blog/{ar,en}/*.md` | Articles: title, description, date, link (slug), reading time, tags, cover image with alt text, optional SEO, body. Each article needs both languages with the same link |
| المزايا | `src/data/features/{ar,en}/*.json` | The five feature pages, plus the short name and line used in the menu, footer and cards |
| القطاعات | `src/data/industries/{ar,en}/*.json` | The six industry pages, their name and photo |
| الصفحات القانونية | `src/content/legal/{ar,en}/*.md` | Privacy policy and terms (drafts for a Saudi lawyer; the note at the top stays hidden) |
| الصفحة الرئيسية | `src/data/home/{ar,en}.json` | Every homepage section, the hero video and the film |
| أسئلة الفحص المجاني | `src/data/scan/{ar,en}.json` | Free scan questions, weights and tips |
| أسئلة المساعد الآلي | `src/data/faq.{ar,en}.json` | The assistant's answers (see below) |
| SEO الصفحات | `src/data/seo/pages/{ar,en}.json` | Title, description, social image and noindex for the pages without their own entry (about, pricing, how it works, security, demo, thanks, free scan and the blog, features and industries index pages) |
| إعدادات SEO العامة | `src/data/seo/site.json` | Site name, default social image, X handle, Organization details for structured data |
| إعدادات الموقع | `src/data/settings.json` | Contact email, WhatsApp, login link, CRM inbox link, city, social accounts. Empty hides the related button |
| الوسائط | `public/media/` | Images (converted to WebP on upload) and short MP4 videos up to 15 MB. Every content image has an alt text field |

Home, feature, industry, article and legal entries carry their own SEO group. Titles show a character counter (60 max, descriptions 160 max)

**Publishing**: every save is a commit to `main`, and the deploy workflow publishes it within a few minutes. The build runs the SEO check (below); if it fails, the live site stays as it was and the failed run in GitHub Actions says what to fix

**Contact messages** («رسائل التواصل» in the CMS top bar) are personal data, so they never go into this repo. The demo form sends them to GoHighLevel and the team email. That CMS page explains this and links to the CRM inbox once «رابط صندوق رسائل الـ CRM» is filled in Site settings

## Developer settings

Edit `src/config.ts` (not in the CMS)

| Key | What it does |
|---|---|
| `formEndpoint` | Webhook URL for the demo form (GoHighLevel or similar). Empty opens a prefilled email |
| `apiContactEndpoint` | SAAYT API contact endpoint (`https://api.saayt.app/v1/public/contact`). When set the form posts there instead of `formEndpoint`: the message shows in the SAAYT admin and the API forwards it to the CRM webhook (server env `CONTACT_FORWARD_WEBHOOK`; this site's origin must be in `CONTACT_ALLOWED_ORIGINS`). Empty keeps today's behaviour |
| `gaId` | Google Analytics 4, loaded in consent mode |

`whatsapp`, `loginUrl`, `email`, `crmInboxUrl` and the socials come from `src/data/settings.json` (CMS: إعدادات الموقع)

Also review
- `src/content/legal/` · privacy policy and terms are drafts that need a Saudi lawyer and real company details
- Prices are published on the pricing page: per-branch bands from SAR 99 a month, the calculator and the founding offer live in `src/components/pages/PricingPage.astro` (a developer change, not in the CMS)
- The CMS is pinned to one Sveltia version in `public/admin/index.html` with an integrity hash; to upgrade, change the version and the hash together

## SEO

- Each page has a canonical link, `ar-SA` and `en` alternates and `x-default` to Arabic; the sitemap lists the same pairs and leaves out noindex pages and `/admin/`; `robots.txt` points to the sitemap and blocks `/admin/`
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
- `src/data/` page copy, settings and SEO as JSON per language (edited in the CMS), read and checked by the `.ts` files next to them
- `public/admin/` the CMS (`config.yml` lists every collection and field) · `scripts/seo-check.mjs` the SEO check
- `src/content/blog/` articles · `src/content/legal/` legal pages
- `public/` images, video and brand files · CMS uploads go to `public/media/`
