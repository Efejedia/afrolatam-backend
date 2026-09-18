const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { generateTicketCode } = require('../utils/generateCode');

// POST /api/tickets
const createTicket = async (req, res) => {
  try {
    const { eventId, ownerId, paymentTxHash } = req.body;

    if (!eventId || !ownerId) {
      return res.status(400).json({
        message: 'eventId and ownerId are required',
      });
    }

    if (typeof eventId !== 'string') {
      return res.status(400).json({
        message: 'eventId must be a string',
      });
    }

    if (typeof ownerId !== 'string') {
      return res.status(400).json({
        message: 'ownerId must be a string',
      });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(eventId)) {
      return res.status(400).json({
        message: 'Invalid eventId',
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
      });
    }

    // Prevent duplicate payment transactions.
    if (paymentTxHash) {
      const existingTicket = await Ticket.findOne({
        paymentTxHash,
      });

      if (existingTicket) {
        return res.status(409).json({
          message: 'Duplicate paymentTxHash',
        });
      }
    }

    const code = generateTicketCode();

    const ticket = await Ticket.create({
      code,
      qrData: code,
      event: eventId,
      ownerId,
      paymentTxHash: paymentTxHash || null,
      isGift: false,
    });

    const populated = await ticket.populate('event');

    return res.status(201).json({
      message: 'Ticket created successfully',
      ticketId: ticket._id,
      ownerId: ticket.ownerId,
      ticket: populated,
    });
  } catch (error) {
    console.error('Create Ticket Error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        message: 'Validation failed',
        errors,
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: `Invalid ${error.path}`,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate ticket data',
      });
    }

    return res.status(500).json({
      message: error.message || 'Internal server error',
    });
  }
};

// GET /api/tickets/me?ownerId=user@email.com
const getMyTickets = async (req, res) => {
  try {
    const { ownerId } = req.query;

    if (!ownerId) {
      return res.status(400).json({
        message: 'ownerId is required',
      });
    }

    if (typeof ownerId !== 'string') {
      return res.status(400).json({
        message: 'ownerId must be a string',
      });
    }

    const tickets = await Ticket.find({
      $or: [{ ownerId }, { claimedBy: ownerId }],
    })
      .populate('event')
      .sort({ createdAt: -1 });

    return res.json(tickets);
  } catch (error) {
    console.error('Get My Tickets Error:', error);

    return res.status(500).json({
      message: error.message || 'Internal server error',
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
};
