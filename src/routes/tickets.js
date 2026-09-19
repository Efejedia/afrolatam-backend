const express = require('express');
const router = express.Router();

const {
  createTicket,
  getMyTickets,
  getTicketById,
} = require('../controllers/ticketController');

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a ticket after successful Pollar payment
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTicket'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Missing or invalid required fields
 *       404:
 *         description: Event not found
 */
router.post('/', createTicket);

/**
 * @swagger
 * /api/tickets/me:
 *   get:
 *     summary: Get all tickets for a user
 *     tags: [Tickets]
 *     parameters:
 *       - in: query
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Email or wallet address of the user
 *     responses:
 *       200:
 *         description: List of user tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 */
router.get('/me', getMyTickets);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get a ticket by ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ticket ID
 *     responses:
 *       200:
 *         description: Ticket found successfully
 *       400:
 *         description: Invalid ticket ID
 *       404:
 *         description: Ticket not found
 */
router.get('/:id', getTicketById);

module.exports = router;
