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

    if (!title || !priceUSDC) {
      return res.status(400).json({ message: 'title and priceUSDC are required' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path || req.file.url || req.file.secure_url || null;
    }

    const event = await Event.create({
      title,
      description,
      priceUSDC: Number(priceUSDC),
      location: location || 'Virtual',
      date: date ? new Date(date) : null,
      imageUrl, // ✅ use imageUrl, not image
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getEvents, getEventById, createEvent };