const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { generateTicketCode } = require('../utils/generateCode');

// POST /api/tickets  → called after successful Pollar payment
const createTicket = async (req, res) => {
  try {
    const { eventId, ownerId, paymentTxHash } = req.body;

    if (!eventId || !ownerId) {
      return res.status(400).json({ message: 'eventId and ownerId are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const code = generateTicketCode();

    const ticket = await Ticket.create({
      code,
      qrData: code, // frontend can turn this into a QR
      event: eventId,
      ownerId,
      paymentTxHash: paymentTxHash || null,
      isGift: false,
    });

    const populated = await ticket.populate('event');

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tickets/me?ownerId=user@email.com
const getMyTickets = async (req, res) => {
  try {
    const { ownerId } = req.query;

    if (!ownerId) {
      return res.status(400).json({ message: 'ownerId is required' });
    }

    const tickets = await Ticket.find({
      $or: [{ ownerId }, { claimedBy: ownerId }],
    })
      .populate('event')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTicket, getMyTickets };