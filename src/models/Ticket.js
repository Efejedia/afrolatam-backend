const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    qrData: { type: String, required: true },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    ownerId: { type: String, required: true },
    isGift: { type: Boolean, default: false },
    claimCode: { type: String, unique: true, sparse: true },
    claimedBy: String,
    claimedAt: Date,
    paymentTxHash: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);