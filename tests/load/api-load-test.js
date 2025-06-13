import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    errors: ['rate<0.1'], // Error rate must be below 10%
  },
};

const BASE_URL = 'http://localhost:8080';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
};

export function setup() {
  // Login and get auth token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const token = loginRes.json('token');
  return { token };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  // Test CRM endpoints
  testCRMEndpoints(headers);
  
  // Test Sales endpoints
  testSalesEndpoints(headers);
  
  // Test Invoicing endpoints
  testInvoicingEndpoints(headers);
  
  sleep(1);
}

function testCRMEndpoints(headers) {
  // Get contacts
  const contactsRes = http.get(`${BASE_URL}/api/crm/contacts`, { headers });
  check(contactsRes, {
    'contacts status is 200': (r) => r.status === 200,
    'contacts response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  // Get leads
  const leadsRes = http.get(`${BASE_URL}/api/crm/leads`, { headers });
  check(leadsRes, {
    'leads status is 200': (r) => r.status === 200,
    'leads response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  // Get opportunities
  const opportunitiesRes = http.get(`${BASE_URL}/api/crm/opportunities`, { headers });
  check(opportunitiesRes, {
    'opportunities status is 200': (r) => r.status === 200,
    'opportunities response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
}

function testSalesEndpoints(headers) {
  // Get products
  const productsRes = http.get(`${BASE_URL}/api/sales/products`, { headers });
  check(productsRes, {
    'products status is 200': (r) => r.status === 200,
    'products response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  // Get quotations
  const quotationsRes = http.get(`${BASE_URL}/api/sales/quotations`, { headers });
  check(quotationsRes, {
    'quotations status is 200': (r) => r.status === 200,
    'quotations response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  // Get orders
  const ordersRes = http.get(`${BASE_URL}/api/sales/orders`, { headers });
  check(ordersRes, {
    'orders status is 200': (r) => r.status === 200,
    'orders response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
}

function testInvoicingEndpoints(headers) {
  // Get invoices
  const invoicesRes = http.get(`${BASE_URL}/api/invoicing/invoices`, { headers });
  check(invoicesRes, {
    'invoices status is 200': (r) => r.status === 200,
    'invoices response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  // Get payments
  const paymentsRes = http.get(`${BASE_URL}/api/invoicing/payments`, { headers });
  check(paymentsRes, {
    'payments status is 200': (r) => r.status === 200,
    'payments response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
}

export function teardown(data) {
  // Cleanup if needed
  console.log('Load test completed');
}