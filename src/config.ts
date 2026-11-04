// Contact email, WhatsApp, login link, CRM inbox link and socials are edited in the CMS (إعدادات الموقع)
// and saved in src/data/settings.json. Empty values hide the related UI safely.
// The form endpoints, analytics and preview switch below stay here for developers only
import { SETTINGS } from './data/site';

export const CONFIG = {
  whatsapp: SETTINGS.whatsapp,   // e.g. '9665XXXXXXXX' (digits only). Empty: WhatsApp buttons point to the demo page
  formEndpoint: 'https://services.leadconnectorhq.com/hooks/tQmSY3sfz7AuHHAuG9eE/webhook-trigger/6fc5d00a-1f74-4ac4-8c2d-f0bc9d8fa884', // GoHighLevel inbound webhook · workflow: SAAYT demo request
  // SAAYT API contact endpoint, e.g. 'https://api.saayt.app/v1/public/contact'. When set, the demo form posts here
  // instead: the message lands in the SAAYT admin (رسائل الموقع) and the API forwards it to the GoHighLevel webhook
  // (server env CONTACT_FORWARD_WEBHOOK). Empty: the form posts straight to formEndpoint exactly as before
  apiContactEndpoint: '',
  loginUrl: SETTINGS.loginUrl,   // client login (existing app subdomain). Empty hides it
  email: SETTINGS.email,
  // Link to the CRM conversations inbox, shown on the CMS page «رسائل التواصل». Empty hides the link
  // Contact messages are never stored in this repo: they stay in GoHighLevel and email
  crmInboxUrl: SETTINGS.crmInboxUrl,
  gaId: 'G-85TPKXGR5S',  // Google Analytics 4 · loads in consent mode (analytics cookies only after the visitor agrees)
  social: Object.fromEntries(Object.entries(SETTINGS.social).filter(([, v]) => !!v)) as Record<string, string>,
  noindex: process.env.NOINDEX === '1', // set on the temporary github.io preview
};
