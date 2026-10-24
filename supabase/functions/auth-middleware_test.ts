import {
  extractBearerToken,
  buildCorsHeaders,
  withAuth,
} from './auth-middleware.ts';
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

Deno.test('extractBearerToken - returns 401 on missing header', () => {
  const req = new Request('https://pethar.co.uk/api/transfer', {
    method: 'POST',
  });
  const result = extractBearerToken(req);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(result.status, 401);
    assertEquals(result.error.code, 'AUTH_HEADER_MISSING');
  }
});

Deno.test('extractBearerToken - returns 401 on malformed header', () => {
  const req = new Request('https://pethar.co.uk/api/transfer', {
    method: 'POST',
    headers: {
      Authorization: 'Basic invalid-credentials',
    },
  });
  const result = extractBearerToken(req);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(result.status, 401);
    assertEquals(result.error.code, 'AUTH_HEADER_MALFORMED');
  }
});

Deno.test('extractBearerToken - extracts clean bearer token', () => {
  const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M';
  const req = new Request('https://pethar.co.uk/api/transfer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sampleToken}`,
    },
  });
  const result = extractBearerToken(req);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.token, sampleToken);
  }
});

Deno.test('withAuth - handles CORS OPTIONS preflight with 204', async () => {
  const handler = withAuth(async () => {
    return new Response('should not reach here');
  });
  const req = new Request('https://pethar.co.uk/api/transfer', {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://pethar.co.uk',
    },
  });
  const res = await handler(req);
  assertEquals(res.status, 204);
  assertEquals(res.headers.get('Access-Control-Allow-Methods'), 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
});

Deno.test('withAuth - intercepts missing token and returns 401', async () => {
  const handler = withAuth(async () => {
    return new Response(JSON.stringify({ ok: true }));
  });
  const req = new Request('https://pethar.co.uk/api/transfer', {
    method: 'POST',
  });
  const res = await handler(req);
  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.code, 'AUTH_HEADER_MISSING');
});
