/**
 * James Thew Culinary Portal - Standard Load Test (k6)
 * Scenario: 200 concurrent virtual users browsing public recipes, tips, FAQ, and submitting feedback.
 * Performance Target: P95 <= 500ms, Error Rate < 1% (PERF-01)
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Warm up & ramp up to 50 VUs
    { duration: '3m', target: 200 },  // Ramp up to 200 VUs
    { duration: '7m', target: 200 },  // Plateau at 200 VUs (Standard peak load)
    { duration: '3m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    errors: ['rate<0.01'],             // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.GATEWAY_URL || 'http://localhost:8000/api';

export default function () {
  group('1. Public Homepage & FAQ Browsing', function () {
    const faqRes = http.get(`${BASE_URL}/faqs`);
    check(faqRes, {
      'FAQ status is 200': (r) => r.status === 200,
      'FAQ returns 7 items': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && body.data.length === 7;
        } catch (e) {
          return false;
        }
      },
    }) || errorRate.add(1);

    sleep(1);
  });

  group('2. Public Recipes Browsing (Redis Cached)', function () {
    const recipesRes = http.get(`${BASE_URL}/recipes?isFree=true&pageSize=12`);
    check(recipesRes, {
      'Recipes status is 200': (r) => r.status === 200,
      'Recipes response time <= 300ms': (r) => r.timings.duration <= 300,
    }) || errorRate.add(1);

    sleep(1);
  });

  group('3. Content Gatekeeping Verification (Unauthorized Member Recipe)', function () {
    // Attempting to access members-only recipe without auth token
    const vipRes = http.get(`${BASE_URL}/recipes/999`, {
      headers: { 'Accept': 'application/json' },
    });
    // Expected 401 Unauthorized or 403 Forbidden or 404 (if not existing)
    check(vipRes, {
      'Gatekeeping prevents unauthorized access (401/403/404)': (r) => [401, 403, 404].includes(r.status),
    }) || errorRate.add(1);

    sleep(0.5);
  });

  group('4. Contests & Public Announcements', function () {
    const contestRes = http.get(`${BASE_URL}/contests`);
    check(contestRes, {
      'Contests status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    const announceRes = http.get(`${BASE_URL}/announcements`);
    check(announceRes, {
      'Announcements status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);
  });
}

