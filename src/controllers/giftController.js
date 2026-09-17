const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { generateTicketCode, generateClaimCode } = require('../utils/generateCode');

// POST /api/gifts  → create a gift after payment
const createGift = async (req, res) => {
  try {
    const { eventId, ownerId, paymentTxHash } = req.body;

    if (!eventId || !ownerId) {
      return res.status(400).json({ message: 'eventId and ownerId are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const code = generateTicketCode();
    const claimCode = generateClaimCode();

    const ticket = await Ticket.create({
      code,
      qrData: code,
      event: eventId,
      ownerId, // the person who paid
      isGift: true,
      claimCode,
      paymentTxHash: paymentTxHash || null,
    });

    res.status(201).json({
      message: 'Gift created successfully',
      claimCode,
      shareLink: `${process.env.SERVER_URL}/claim?code=${claimCode}`,
      ticket,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/gifts/claim
const claimGift = async (req, res) => {
  try {
    const { claimCode, claimedBy } = req.body;

    if (!claimCode || !claimedBy) {
      return res.status(400).json({ message: 'claimCode and claimedBy are required' });
    }

    const ticket = await Ticket.findOne({ claimCode, isGift: true });

    if (!ticket) {
      return res.status(404).json({ message: 'Invalid claim code' });
    }

    if (ticket.claimedBy) {
      return res.status(400).json({ message: 'This gift has already been claimed' });
    }

    ticket.claimedBy = claimedBy;
    ticket.claimedAt = new Date();
    await ticket.save();

    const populated = await ticket.populate('event');

    res.json({
      message: 'Gift claimed successfully',
      ticket: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createGift, claimGift };