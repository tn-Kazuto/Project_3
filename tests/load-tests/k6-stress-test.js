/**
 * James Thew Culinary Portal - Saturation & Stress Test (k6)
 * Scenario: Scale load beyond 200 VUs up to 600 VUs to determine system saturation breakpoint.
 * Focus: Gateway reverse proxy, DB Connection Pool exhaustion, and Redis cache offload.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('stress_errors');

export const options = {
  stages: [
    { duration: '2m', target: 200 },  // Normal baseline
    { duration: '3m', target: 400 },  // Double load
    { duration: '3m', target: 600 },  // Stress threshold (600 VUs)
    { duration: '2m', target: 600 },  // Maintain peak stress
    { duration: '3m', target: 0 },    // Cooldown & recovery
  ],
  thresholds: {
    stress_errors: ['rate<0.05'],     // Under heavy stress, error rate must remain under 5%
    http_req_duration: ['p(95)<1500'], // P95 under extreme stress under 1500ms
  },
};

const BASE_URL = __ENV.GATEWAY_URL || 'http://localhost:8000/api';

export default function () {
  // Heavy query search simulation
  const res = http.get(`${BASE_URL}/recipes?keyword=chicken&isFree=true`);
  check(res, {
    'Status is 200 or 429': (r) => r.status === 200 || r.status === 429,
  }) || errorRate.add(1);

  sleep(0.5);
}

