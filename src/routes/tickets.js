const express = require('express');

const router = express.Router();

const {
  createTicket,
  getTicketById,
  getMyTickets,
} = require('../controllers/ticketController');

// ============================================================
// POST /api/tickets
// Create a ticket AFTER successful payment
// ============================================================
router.post('/', createTicket);

// ============================================================
// GET /api/tickets/me?ownerId=...
// Get all tickets belonging to a user
// IMPORTANT: This must come before /:id
// ============================================================
router.get('/me', getMyTickets);

// ============================================================
// GET /api/tickets/:id
// Get a single ticket by MongoDB ticket ID
// ============================================================
router.get('/:id', getTicketById);

module.exports = router;
