// Fill these when the real values are ready. Empty values hide the related UI safely.
export const CONFIG = {
  whatsapp: '',          // e.g. '9665XXXXXXXX' (digits only). Empty: WhatsApp buttons point to the demo page
  formEndpoint: 'https://services.leadconnectorhq.com/hooks/tQmSY3sfz7AuHHAuG9eE/webhook-trigger/6fc5d00a-1f74-4ac4-8c2d-f0bc9d8fa884', // GoHighLevel inbound webhook · workflow: SAAYT demo request
  // SAAYT API contact endpoint, e.g. 'https://api.saayt.app/v1/public/contact'. When set, the demo form posts here
  // instead: the message lands in the SAAYT admin (رسائل الموقع) and the API forwards it to the GoHighLevel webhook
  // (server env CONTACT_FORWARD_WEBHOOK). Empty: the form posts straight to formEndpoint exactly as before
  apiContactEndpoint: '',
  loginUrl: 'https://app.saayt.app', // client login (existing app subdomain)
  email: 'hello@saayt.app',
  gaId: 'G-85TPKXGR5S',  // Google Analytics 4 · loads in consent mode (analytics cookies only after the visitor agrees)
  social: {
    x: 'https://x.com/saaytapp',
    facebook: 'https://www.facebook.com/profile.php?id=61595387177941',
  } as Record<string, string>,
  noindex: process.env.NOINDEX === '1', // set on the temporary github.io preview
};
