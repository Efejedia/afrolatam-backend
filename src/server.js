require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/db');

const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const giftRoutes = require('./routes/gifts');

connectDB();

const app = express();

/*
 * CORS
 *
 * Local Next.js frontend:
 * http://localhost:3000
 *
 * Production Next.js frontend:
 * Replace the URL below with your actual frontend domain.
 */
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS: Origin ${origin} is not allowed`)
      );
    },
    credentials: true,
  })
);

app.use(express.json());

// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'AfroLatam Connect API',
    customCss: '.swagger-ui .topbar { display: none }',
  })
);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'AfroLatam Connect API is running',
    docs: `${process.env.SERVER_URL}/api-docs`,
  });
});

// API routes
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/gifts', giftRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${process.env.SERVER_URL || `http://localhost:${PORT}`}`);
  console.log(
    `Swagger docs → ${
      process.env.SERVER_URL || `http://localhost:${PORT}`
    }/api-docs`
  );
});
