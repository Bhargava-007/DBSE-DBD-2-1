const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config(); // Also check current dir
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const initEssentials = require('./initEssentials');

const ticketsRouter = require('./routes/tickets');
const customersRouter = require('./routes/customers');
const agentsRouter = require('./routes/agents');
const statsRouter = require('./routes/stats');
const classifyRouter = require('./routes/classify');
const devRouter = require('./routes/dev');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tickets', ticketsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/classify', classifyRouter);
app.use('/api/dev', devRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'server', port: PORT });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error Middleware]:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    status,
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  await initEssentials();

  app.listen(PORT, () => {
    console.log(`[Server] Support desk backend running on http://localhost:${PORT}`);
  });
};

startServer();
