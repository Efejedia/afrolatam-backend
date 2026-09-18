const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },

    qrData: {
      type: String,
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },

    ownerId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 254,
    },

    isGift: {
      type: Boolean,
      default: false,
    },

    claimCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    claimedBy: String,

    claimedAt: Date,

    paymentTxHash: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

ticketSchema.index(
  { paymentTxHash: 1 },
  {
    unique: true,
    partialFilterExpression: {
      paymentTxHash: { $type: 'string', $ne: '' },
    },
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);
