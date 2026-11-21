import { createHash, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';

const REALM = 'Demo privata - Gioco degli Aggettivi';

function protectedResponse(request, body, status, extra = {}) {
  return new Response(request.method === 'HEAD' ? null : body, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Vary': 'Authorization',
      ...extra,
    },
  });
}

function validCredentials(authorization, expectedHash) {
  if (!authorization || authorization.length > 4096) return false;
  const encoded = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(authorization)?.[1];
  if (!encoded) return false;
  const value = Buffer.from(encoded, 'base64').toString('utf8');
  const separator = value.indexOf(':');
  if (separator < 1) return false;
  const email = value.slice(0, separator).trim().toLowerCase();
  const password = value.slice(separator + 1);
  const actual = createHash('sha256').update(`${email}:${password}`, 'utf8').digest();
  return timingSafeEqual(actual, Buffer.from(expectedHash, 'hex'));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
      url.protocol = 'https:';
      return protectedResponse(request, null, 308, { Location: url.href });
    }

    if (!/^[a-f0-9]{64}$/.test(env.DEMO_CREDENTIALS_SHA256 ?? '') || !env.DEMO_LOGIN_LIMITER || !env.ASSETS) {
      return protectedResponse(request, 'Demo temporaneamente non disponibile.', 503);
    }

    const authorization = request.headers.get('Authorization');
    if (!validCredentials(authorization, env.DEMO_CREDENTIALS_SHA256)) {
      if (authorization) {
        try {
          const result = await env.DEMO_LOGIN_LIMITER.limit({
            key: `demo-login:${request.headers.get('CF-Connecting-IP') ?? 'unknown'}`,
          });
          if (!result.success) {
            return protectedResponse(request, 'Troppi tentativi. Riprova tra un minuto.', 429, { 'Retry-After': '60' });
          }
        } catch {
          return protectedResponse(request, 'Accesso temporaneamente non disponibile.', 503);
        }
      }
      return protectedResponse(request, 'Inserisci email e password dedicate alla demo.', 401, {
        'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      });
    }

    if (!['GET', 'HEAD'].includes(request.method)) {
      return protectedResponse(request, 'Metodo non consentito.', 405, { Allow: 'GET, HEAD' });
    }
    // Questa bozza protetta non installa un service worker né offre copie offline.
    if (url.pathname === '/sw.js') return protectedResponse(request, '', 410);

    const headers = new Headers(request.headers);
    headers.delete('Authorization');
    const asset = await env.ASSETS.fetch(new Request(request, { headers }));
    const response = new Response(request.method === 'HEAD' ? null : asset.body, asset);
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    response.headers.set('Vary', 'Authorization');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
    return response;
  },
};
