const express = require('express');
const router = express.Router();
const { createGift, claimGift } = require('../controllers/giftController');

/**
 * @swagger
 * /api/gifts:
 *   post:
 *     summary: Create a digital gift after payment
 *     tags: [Gifts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGift'
 *     responses:
 *       201:
 *         description: Gift created + claim code returned
 */
router.post('/', createGift);

/**
 * @swagger
 * /api/gifts/claim:
 *   post:
 *     summary: Claim a gift using a claim code
 *     tags: [Gifts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClaimGift'
 *     responses:
 *       200:
 *         description: Gift claimed successfully
 *       400:
 *         description: Already claimed or invalid data
 *       404:
 *         description: Invalid claim code
 */
router.post('/claim', claimGift);

module.exports = router;