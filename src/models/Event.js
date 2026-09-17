const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    priceUSDC: { type: Number, required: true },
    imageUrl: String,
    date: Date,
    location: { type: String, default: 'Virtual' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);