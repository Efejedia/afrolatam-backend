const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AfroLatam Connect API',
      version: '1.0.0',
      description: 'Backend API for AfroLatam Connect – Tickets, Gifts & Events (Pollar Hackathon 2026)',
      contact: {
        name: 'AfroLatam Connect',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Event: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            priceUSDC: { type: 'number' },
            imageUrl: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            location: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        Ticket: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            code: { type: 'string', example: 'ALC-A7K9X2' },
            qrData: { type: 'string' },
            event: { $ref: '#/components/schemas/Event' },
            ownerId: { type: 'string' },
            isGift: { type: 'boolean' },
            claimCode: { type: 'string', example: 'GIFT-B3M8P1' },
            claimedBy: { type: 'string' },
            claimedAt: { type: 'string', format: 'date-time' },
            paymentTxHash: { type: 'string' },
          },
        },
        CreateTicket: {
          type: 'object',
          required: ['eventId', 'ownerId'],
          properties: {
            eventId: { type: 'string' },
            ownerId: { type: 'string', example: 'user@email.com' },
            paymentTxHash: { type: 'string' },
          },
        },
        CreateGift: {
          type: 'object',
          required: ['eventId', 'ownerId'],
          properties: {
            eventId: { type: 'string' },
            ownerId: { type: 'string' },
            paymentTxHash: { type: 'string' },
          },
        },
        ClaimGift: {
          type: 'object',
          required: ['claimCode', 'claimedBy'],
          properties: {
            claimCode: { type: 'string', example: 'GIFT-B3M8P1' },
            claimedBy: { type: 'string', example: 'friend@email.com' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;