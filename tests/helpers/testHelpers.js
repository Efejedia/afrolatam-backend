const Event = require('../../src/models/Event');
const Ticket = require('../../src/models/Ticket');
const { generateTicketCode, generateClaimCode } = require('../../src/utils/generateCode');

const createTestEvent = async (overrides = {}) => {
  const eventData = {
    title: 'Test Event',
    description: 'Test Description',
    priceUSDC: 100,
    location: 'Virtual',
    date: new Date(Date.now() + 86400000),
    isActive: true,
    ...overrides,
  };
  return await Event.create(eventData);
};

const createTestTicket = async (eventId, overrides = {}) => {
  const ticketData = {
    code: generateTicketCode(),
    qrData: generateTicketCode(),
    event: eventId,
    ownerId: 'test@example.com',
    isGift: false,
    paymentTxHash: '0x123',
    ...overrides,
  };
  return await Ticket.create(ticketData);
};

const createTestGift = async (eventId, overrides = {}) => {
  const giftData = {
    code: generateTicketCode(),
    qrData: generateTicketCode(),
    event: eventId,
    ownerId: 'giver@example.com',
    isGift: true,
    claimCode: generateClaimCode(),
    paymentTxHash: '0x456',
    ...overrides,
  };
  return await Ticket.create(giftData);
};

const createTestClaimedGift = async (eventId, claimedBy = 'receiver@example.com', overrides = {}) => {
  const gift = await createTestGift(eventId, { ...overrides, claimedBy, claimedAt: new Date() });
  return gift;
};

const validEventPayload = (overrides = {}) => ({
  title: 'Test Event',
  priceUSDC: 100,
  description: 'Test Description',
  location: 'Virtual',
  date: new Date(Date.now() + 86400000).toISOString(),
  ...overrides,
});

const validTicketPayload = (eventId, overrides = {}) => ({
  eventId: eventId.toString(),
  ownerId: 'test@example.com',
  paymentTxHash: '0x123',
  ...overrides,
});

const validGiftPayload = (eventId, overrides = {}) => ({
  eventId: eventId.toString(),
  ownerId: 'giver@example.com',
  paymentTxHash: '0x456',
  ...overrides,
});

const validClaimPayload = (claimCode, overrides = {}) => ({
  claimCode,
  claimedBy: 'receiver@example.com',
  ...overrides,
});

module.exports = {
  createTestEvent,
  createTestTicket,
  createTestGift,
  createTestClaimedGift,
  validEventPayload,
  validTicketPayload,
  validGiftPayload,
  validClaimPayload,
};