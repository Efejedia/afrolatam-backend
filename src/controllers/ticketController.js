const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { generateTicketCode } = require('../utils/generateCode');

// POST /api/tickets
const createTicket = async (req, res) => {
  try {
    const { eventId, ownerId, paymentTxHash } = req.body;

    // Required fields
    if (!eventId || !ownerId) {
      return res.status(400).json({
        message: 'eventId and ownerId are required',
      });
    }

    // Type validation
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

    // Validate MongoDB Event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        message: 'Invalid eventId',
      });
    }

    // Find event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
      });
    }

    // Prevent duplicate payment transactions
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

    // Generate ticket code
    const code = generateTicketCode();

    // Create ticket
    const ticket = await Ticket.create({
      code,
      qrData: code,
      event: eventId,
      ownerId,
      paymentTxHash: paymentTxHash || null,
      isGift: false,
    });

    // Populate event information
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

// GET /api/tickets/:id
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Get Ticket By ID:', id);

    // Validate ticket ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid ticket ID',
      });
    }

    // Find ticket and populate event
    const ticket = await Ticket.findById(id).populate('event');

    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket not found',
      });
    }

    return res.status(200).json({
      ticket,
    });
  } catch (error) {
    console.error('Get Ticket By ID Error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid ticket ID',
      });
    }

    return res.status(500).json({
      message: error.message || 'Internal server error',
    });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketById,
};
