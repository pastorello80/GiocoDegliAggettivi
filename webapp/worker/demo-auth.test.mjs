import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import worker from './demo-auth.mjs';

const EMAIL = 'vitoagrosi@protonmail.com';
const PASSWORD = 'test-only-password:with-colon';
const auth = (email = EMAIL, password = PASSWORD) => `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`;
const hash = createHash('sha256').update(`${EMAIL}:${PASSWORD}`).digest('hex');
function fixture() {
  const calls = { assets: 0, limits: 0 };
  const env = {
    DEMO_CREDENTIALS_SHA256: hash,
    DEMO_LOGIN_LIMITER: { async limit() { calls.limits++; return { success: true }; } },
    ASSETS: { async fetch(request) {
      calls.assets++;
      assert.equal(request.headers.get('Authorization'), null);
      return new Response('private-demo-asset', { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=31536000' } });
    } },
  };
  return { env, calls };
}

test('all demo resources require credentials before assets are read', async () => {
  const { env, calls } = fixture();
  for (const path of ['/', '/index.html', '/assets/app.js', '/style.css', '/sw.js', '/manifest.webmanifest', '/icons/icon.png', '/any/path']) {
    const response = await worker.fetch(new Request(`https://demo.example${path}`), env);
    assert.equal(response.status, 401, path);
    assert.match(response.headers.get('WWW-Authenticate'), /^Basic /);
    assert.match(response.headers.get('Cache-Control'), /no-store/);
  }
  assert.equal(calls.assets, 0);
});

test('wrong email, wrong password, malformed and oversized headers are rejected', async () => {
  const { env, calls } = fixture();
  for (const authorization of [auth('other@example.com'), auth(EMAIL, 'wrong'), 'Bearer secret', 'Basic !!!!', 'Basic '+Buffer.from('no-separator').toString('base64'), 'Basic '+ 'A'.repeat(5000)]) {
    const response = await worker.fetch(new Request('https://demo.example/', { headers: { Authorization: authorization } }), env);
    assert.equal(response.status, 401);
  }
  assert.equal(calls.assets, 0);
  assert.equal(calls.limits, 6);
});

test('valid fixed credentials serve assets without forwarding credentials or allowing caches', async () => {
  const { env, calls } = fixture();
  const response = await worker.fetch(new Request('https://demo.example/assets/app.js', { headers: { Authorization: auth(EMAIL.toUpperCase()) } }), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'private-demo-asset');
  assert.match(response.headers.get('Cache-Control'), /no-store/);
  assert.equal(response.headers.get('Vary'), 'Authorization');
  assert.equal(calls.assets, 1);
  assert.equal(calls.limits, 0);
});

test('missing secrets or bindings fail closed; limiter errors cannot serve assets', async () => {
  for (const missing of ['DEMO_CREDENTIALS_SHA256', 'DEMO_LOGIN_LIMITER', 'ASSETS']) {
    const { env, calls } = fixture();
    delete env[missing];
    assert.equal((await worker.fetch(new Request('https://demo.example/', { headers: { Authorization: auth() } }), env)).status, 503);
    assert.equal(calls.assets, 0);
  }
  const { env, calls } = fixture();
  env.DEMO_LOGIN_LIMITER.limit = async () => { throw new Error('unavailable'); };
  assert.equal((await worker.fetch(new Request('https://demo.example/', { headers: { Authorization: auth(EMAIL, 'wrong') } }), env)).status, 503);
  assert.equal(calls.assets, 0);
});

test('failed credentials are rate limited, while valid credentials still work', async () => {
  const { env, calls } = fixture();
  env.DEMO_LOGIN_LIMITER.limit = async () => ({ success: false });
  const rejected = await worker.fetch(new Request('https://demo.example/', { headers: { Authorization: auth(EMAIL, 'wrong') } }), env);
  assert.equal(rejected.status, 429);
  assert.equal(rejected.headers.get('Retry-After'), '60');
  assert.equal(calls.assets, 0);
  assert.equal((await worker.fetch(new Request('https://demo.example/', { headers: { Authorization: auth() } }), env)).status, 200);
});

test('HTTP never handles credentials; authorized demo is read only and has no service worker', async () => {
  const { env, calls } = fixture();
  assert.equal((await worker.fetch(new Request('http://demo.example/', { headers: { Authorization: auth() } }), env)).status, 308);
  assert.equal((await worker.fetch(new Request('https://demo.example/', { method: 'POST', headers: { Authorization: auth() } }), env)).status, 405);
  assert.equal((await worker.fetch(new Request('https://demo.example/sw.js', { headers: { Authorization: auth() } }), env)).status, 410);
  const head = await worker.fetch(new Request('https://demo.example/', { method: 'HEAD', headers: { Authorization: auth() } }), env);
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal(calls.assets, 1);
});
