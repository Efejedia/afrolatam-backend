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
    docs: 'http://localhost:5000/api-docs',
  });
});

app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/gifts', giftRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs → http://localhost:${PORT}/api-docs`);
});