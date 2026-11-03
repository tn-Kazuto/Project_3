/**
 * James Thew Culinary Portal - Flash Crowd / Spike Test (k6)
 * Scenario: Instantaneous surge 0 -> 300 VUs in 10 seconds (Simulating announcement of contest winner by Chef James Thew).
 * Focus: YARP rate limiting, connection queueing, and recovery.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const spikeErrors = new Rate('spike_errors');

export const options = {
  stages: [
    { duration: '10s', target: 20 },  // Idle state
    { duration: '10s', target: 300 }, // Sudden violent spike!
    { duration: '1m', target: 300 },  // Hold spike traffic
    { duration: '20s', target: 20 },  // Sharp falloff
    { duration: '30s', target: 0 },   // Complete cooldown
  ],
  thresholds: {
    spike_errors: ['rate<0.02'],      // Less than 2% dropped requests during spike
    http_req_duration: ['p(95)<1000'],
  },
};

const BASE_URL = __ENV.GATEWAY_URL || 'http://localhost:8000/api';

export default function () {
  const res = http.get(`${BASE_URL}/announcements`);
  check(res, {
    'Announcements accessible during spike': (r) => r.status === 200,
  }) || spikeErrors.add(1);

  sleep(0.2);
}

