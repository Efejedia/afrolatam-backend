const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { generateTicketCode } = require('../utils/generateCode');

// ============================================================
// POST /api/tickets
// Create a ticket ONLY after successful payment
// ============================================================
const createTicket = async (req, res) => {
  try {
    const { eventId, ownerId, paymentTxHash } = req.body;

    // ----------------------------------------------------------
    // Required fields
    // ----------------------------------------------------------
    if (!eventId || !ownerId || !paymentTxHash) {
      return res.status(400).json({
        message:
          'eventId, ownerId and paymentTxHash are required',
      });
    }

    // ----------------------------------------------------------
    // Type validation
    // ----------------------------------------------------------
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

    if (typeof paymentTxHash !== 'string') {
      return res.status(400).json({
        message: 'paymentTxHash must be a string',
      });
    }

    // ----------------------------------------------------------
    // Validate MongoDB Event ID
    // ----------------------------------------------------------
    if (!/^[0-9a-fA-F]{24}$/.test(eventId)) {
      return res.status(400).json({
        message: 'Invalid eventId',
      });
    }

    // ----------------------------------------------------------
    // Validate payment transaction hash
    // ----------------------------------------------------------
    const cleanedPaymentTxHash = paymentTxHash.trim();

    if (!cleanedPaymentTxHash) {
      return res.status(400).json({
        message: 'paymentTxHash cannot be empty',
      });
    }

    // ----------------------------------------------------------
    // Validate ownerId
    //
    // Your Ticket model currently expects an email address.
    // If ownerId is actually a wallet address, this validation
    // must be changed in the Ticket model.
    // ----------------------------------------------------------
    const cleanedOwnerId = ownerId.trim().toLowerCase();

    if (!cleanedOwnerId) {
      return res.status(400).json({
        message: 'ownerId cannot be empty',
      });
    }

    // ----------------------------------------------------------
    // Find event
    // ----------------------------------------------------------
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
      });
    }

    // ----------------------------------------------------------
    // Prevent the same payment from creating multiple tickets
    // ----------------------------------------------------------
    const existingTicket = await Ticket.findOne({
      paymentTxHash: cleanedPaymentTxHash,
    });

    if (existingTicket) {
      return res.status(409).json({
        message: 'This payment has already been used for a ticket',
        ticketId: existingTicket._id,
      });
    }

    // ----------------------------------------------------------
    // Generate unique ticket code
    // ----------------------------------------------------------
    const code = generateTicketCode();

    // ----------------------------------------------------------
    // Create ticket
    //
    // IMPORTANT:
    // paymentTxHash is always stored.
    // There is no ticket without a paymentTxHash.
    // ----------------------------------------------------------
    const ticket = await Ticket.create({
      code,
      qrData: code,
      event: eventId,
      ownerId: cleanedOwnerId,
      paymentTxHash: cleanedPaymentTxHash,
      isGift: false,
    });

    // ----------------------------------------------------------
    // Populate event information
    // ----------------------------------------------------------
    const populatedTicket = await ticket.populate('event');

    // ----------------------------------------------------------
    // Return created ticket
    // ----------------------------------------------------------
    return res.status(201).json({
      message: 'Payment confirmed. Ticket created successfully.',
      ticketId: ticket._id,
      ownerId: ticket.ownerId,
      paymentTxHash: ticket.paymentTxHash,
      ticket: populatedTicket,
    });
  } catch (error) {
    console.error('Create Ticket Error:', error);

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        message: 'Validation failed',
        errors,
      });
    }

    // Mongoose invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: `Invalid ${error.path}`,
      });
    }

    // Duplicate unique field
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate ticket or payment transaction',
      });
    }

    return res.status(500).json({
      message: error.message || 'Internal server error',
    });
  }
};


// ============================================================
// GET /api/tickets/:id
// Get one ticket by MongoDB ticket ID
// ============================================================
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    // ----------------------------------------------------------
    // Validate ticket ID
    // ----------------------------------------------------------
    if (!id) {
      return res.status(400).json({
        message: 'Ticket ID is required',
      });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        message: 'Invalid ticket ID',
      });
    }

    // ----------------------------------------------------------
    // Find ticket and populate event
    // ----------------------------------------------------------
    const ticket = await Ticket.findById(id).populate('event');

    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket not found',
      });
    }

    // ----------------------------------------------------------
    // Return ticket
    // ----------------------------------------------------------
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


// ============================================================
// GET /api/tickets/me?ownerId=user@email.com
// Get all tickets belonging to a user
// ============================================================
const getMyTickets = async (req, res) => {
  try {
    const { ownerId } = req.query;

    // ----------------------------------------------------------
    // Required ownerId
    // ----------------------------------------------------------
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

    const cleanedOwnerId = ownerId.trim().toLowerCase();

    if (!cleanedOwnerId) {
      return res.status(400).json({
        message: 'ownerId cannot be empty',
      });
    }

    // ----------------------------------------------------------
    // Find tickets owned by user OR claimed by user
    // ----------------------------------------------------------
    const tickets = await Ticket.find({
      $or: [
        { ownerId: cleanedOwnerId },
        { claimedBy: cleanedOwnerId },
      ],
    })
      .populate('event')
      .sort({ createdAt: -1 });

    return res.status(200).json(tickets);
  } catch (error) {
    console.error('Get My Tickets Error:', error);

    return res.status(500).json({
      message: error.message || 'Internal server error',
    });
  }
};


// ============================================================
// Exports
// ============================================================
module.exports = {
  createTicket,
  getTicketById,
  getMyTickets,
};
