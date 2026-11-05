import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomUUID } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const endpoint = __ENV.TRANSFER_URL;
const accessToken = __ENV.ACCESS_TOKEN;
const recipient = __ENV.RECIPIENT;

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: Number(__ENV.VUS || 50) },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  if (!endpoint || !accessToken || !recipient) {
    throw new Error('TRANSFER_URL, ACCESS_TOKEN, and RECIPIENT are required');
  }

  const response = http.post(
    endpoint,
    JSON.stringify({
      recipient,
      amount: 0.01,
      currency: 'AKD',
      pin: __ENV.TRANSFER_PIN,
      idempotency_key: randomUUID(),
    }),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  check(response, {
    'returns an application response': (res) => res.status >= 200 && res.status < 500,
    'does not expose server errors': (res) => !res.body.includes('Postgrest') && !res.body.includes('SQL'),
  });
  sleep(1);
}
