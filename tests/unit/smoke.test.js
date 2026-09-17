const request = require('supertest');
const app = require('../../src/server');
const { connectTestDB, disconnectTestDB, clearTestDB } = require('../helpers/db');
const { createTestEvent } = require('../helpers/testHelpers');

describe('Smoke Tests - Test Infrastructure Verification', () => {
  beforeAll(async () => {
    await connectTestDB();
  }, 30000);

  afterAll(async () => {
    await disconnectTestDB();
  }, 30000);

  afterEach(async () => {
    await clearTestDB();
  }, 10000);

  test('GET / should return API info', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('AfroLatam Connect API');
    expect(response.body).toHaveProperty('docs');
  });

  test('GET /api/events should return empty array initially', async () => {
    const response = await request(app).get('/api/events');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  test('Test database connection works and is isolated', async () => {
    const event = await createTestEvent({ title: 'Smoke Test Event' });
    
    expect(event).toHaveProperty('_id');
    expect(event.title).toBe('Smoke Test Event');
    expect(event.priceUSDC).toBe(100);
    
    const response = await request(app).get('/api/events');
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe('Smoke Test Event');
  });

  test('Test helpers generate valid codes', () => {
    const { generateTicketCode, generateClaimCode } = require('../../src/utils/generateCode');
    
    const ticketCode = generateTicketCode();
    const claimCode = generateClaimCode();
    
    expect(ticketCode).toMatch(/^ALC-[A-Z0-9]{6}$/);
    expect(claimCode).toMatch(/^GIFT-[A-Z0-9]{6}$/);
  });

  test('POST /api/events creates event without image', async () => {
    const payload = {
      title: 'API Smoke Test Event',
      priceUSDC: 50,
      description: 'Created via API test',
      location: 'Test Location',
      date: new Date(Date.now() + 86400000).toISOString(),
    };

    const response = await request(app)
      .post('/api/events')
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.title).toBe(payload.title);
    expect(response.body.priceUSDC).toBe(payload.priceUSDC);
  });
});