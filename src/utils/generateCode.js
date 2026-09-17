const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

const generateTicketCode = () => `ALC-${nanoid()}`;
const generateClaimCode = () => `GIFT-${nanoid()}`;

module.exports = { generateTicketCode, generateClaimCode };