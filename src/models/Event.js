const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    priceUSDC: { type: Number, required: true },
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    date: Date,
    location: { type: String, default: 'Virtual' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, minimize: false }
);

eventSchema.index({ title: 1, location: 1 }, { unique: true });

module.exports = mongoose.model('Event', eventSchema);