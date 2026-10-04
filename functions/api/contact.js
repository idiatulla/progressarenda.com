// Cloudflare Pages Function: POST /api/contact
// Sends the contact form to MAIL_TO through the Resend API (https://resend.com).
//
// Environment variables (Pages -> Settings -> Environment variables):
//   RESEND_API_KEY  (secret)  API key
//   MAIL_TO                   recipient(s), comma separated, e.g. progressarenda@mail.ru
//   MAIL_FROM                 sender on a domain verified in Resend, e.g. "Прогресс <noreply@progressarenda.com>"

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const esc = s =>
  String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s().-]{5,}$/;

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) {
    return json({ status: 'error', message: 'Mail is not configured' }, 500);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ status: 'error', message: 'Bad request' }, 400);
  }

  const name = String(form.get('your-name') || '').trim().slice(0, 200);
  const contact = String(form.get('your-email') || '').trim().slice(0, 200); // e-mail or phone
  const subject = String(form.get('your-subject') || '').trim().replace(/[\r\n]+/g, ' ').slice(0, 200);
  const message = String(form.get('your-message') || '').trim().slice(0, 5000);

  // honeypot: the form has no "website" field, so only bots fill it
  if (form.get('website')) return json({ status: 'ok' });

  const isEmail = EMAIL_RE.test(contact);
  if (!name || !(isEmail || PHONE_RE.test(contact))) {
    return json({ status: 'invalid', message: 'Invalid data' }, 422);
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: env.MAIL_TO.split(',').map(s => s.trim()),
      ...(isEmail ? { reply_to: contact } : {}),
      subject: `Сообщение с сайта progressarenda.com${subject ? ': ' + subject : ''}`,
      text: `Имя: ${name}\nE-mail/телефон: ${contact}\nТема: ${subject}\n\n${message}`,
      html: `<p><b>Имя:</b> ${esc(name)}<br><b>E-mail/телефон:</b> ${esc(contact)}<br><b>Тема:</b> ${esc(subject)}</p><p>${esc(message).replace(/\n/g, '<br>')}</p>`,
    }),
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return json({ status: 'error', message: 'Send failed' }, 502);
  }
  return json({ status: 'ok' });
}

export const onRequest = () => json({ status: 'error', message: 'Method not allowed' }, 405);
