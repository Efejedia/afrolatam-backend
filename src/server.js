require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/db');

const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const giftRoutes = require('./routes/gifts');

const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'AfroLatam Connect API',
  customCss: '.swagger-ui .topbar { display: none }',
}));

app.get('/', (req, res) => {
  res.json({
    message: 'AfroLatam Connect API is running',
    docs: `${process.env.SERVER_URL}/api-docs`,
  });
});

app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/gifts', giftRoutes);

// Only connect to DB and start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on ${process.env.SERVER_URL}`);
    console.log(`Swagger docs → ${process.env.SERVER_URL}/api-docs`);
  });
}

module.exports = app;