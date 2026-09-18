const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent } = require('../controllers/eventController');
const { upload, handleMulterError } = require('../config/cloudinary');

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all active events
 *     tags: [Events]
 */
router.get('/', getEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Events]
 */
router.get('/:id', getEventById);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event with image upload
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, priceUSDC]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priceUSDC:
 *                 type: number
 *               location:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               image:
 *                 type: string
 *                 format: binary
 */
router.post('/', upload.single('image'), handleMulterError, createEvent);

module.exports = router;