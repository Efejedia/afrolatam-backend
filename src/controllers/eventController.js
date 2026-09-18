const Event = require('../models/Event');

// GET /api/events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/events (with image upload)
const createEvent = async (req, res) => {
  try {
    const { title, description, priceUSDC, location, date } = req.body;

    if (!title || priceUSDC === undefined || priceUSDC === null || priceUSDC === '') {
      return res.status(400).json({ message: 'title and priceUSDC are required' });
    }

    const normalizedTitle = String(title).trim();
    const normalizedLocation = location ? String(location).trim() : 'Virtual';

    if (!normalizedTitle) {
      return res.status(400).json({ message: 'title cannot be empty' });
    }

    const price = Number(priceUSDC);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ message: 'priceUSDC must be a positive number' });
    }

    let imageUrl = null;
    let imagePublicId = null;
    if (req.file) {
      imageUrl = req.file.path || req.file.url || req.file.secure_url || null;
      imagePublicId = req.file.filename || req.file.public_id || null;
    }

    const event = await Event.create({
      title: normalizedTitle,
      description,
      priceUSDC: price,
      location: normalizedLocation,
      date: date ? new Date(date) : null,
      imageUrl,
      imagePublicId,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create Event Error:', error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.title && error.keyPattern.location) {
      return res.status(409).json({ message: 'An event with this title and location already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getEvents, getEventById, createEvent };