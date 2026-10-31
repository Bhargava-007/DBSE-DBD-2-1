const express = require('express');
const router = express.Router();
const { seedDatabase, clearDemoData } = require('../utils/seedData');

// Middleware to check DEV_MODE
const checkDevMode = (req, res, next) => {
  if (process.env.DEV_MODE !== 'true') {
    return res.status(403).json({ error: 'Dev mode endpoints are disabled in production' });
  }
  next();
};

router.use(checkDevMode);

// POST /api/dev/seed - Load demo data
router.post('/seed', async (req, res, next) => {
  try {
    const result = await seedDatabase();
    res.json({
      message: 'Demo data successfully loaded',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/dev/seed - Clear demo data
router.delete('/seed', async (req, res, next) => {
  try {
    const result = await clearDemoData();
    res.json({
      message: 'Demo data successfully cleared',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

