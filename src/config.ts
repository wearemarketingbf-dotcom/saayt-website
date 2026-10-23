// Fill these when the real values are ready. Empty values hide the related UI safely.
export const CONFIG = {
  whatsapp: '',          // e.g. '9665XXXXXXXX' (digits only). Empty: WhatsApp buttons point to the demo page
  formEndpoint: 'https://services.leadconnectorhq.com/hooks/tQmSY3sfz7AuHHAuG9eE/webhook-trigger/6fc5d00a-1f74-4ac4-8c2d-f0bc9d8fa884', // GoHighLevel inbound webhook · workflow: SAAYT demo request
  loginUrl: 'https://app.saayt.app', // client login (existing app subdomain)
  email: 'hello@saayt.app',
  noindex: process.env.NOINDEX === '1', // set on the temporary github.io preview
};
