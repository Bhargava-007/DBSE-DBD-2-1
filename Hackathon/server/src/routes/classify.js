const express = require('express');
const router = express.Router();
const { classifyLocally } = require('../utils/classifier');

router.post('/', async (req, res) => {
  const { subject = '', description = '' } = req.body;
  const classifierUrl = process.env.CLASSIFIER_URL || 'http://localhost:8000';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${classifierUrl}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, description }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Classifier service responded with status ${response.status}`);
    }

    const data = await response.json();
    return res.json({ ...data, source: 'microservice' });
  } catch (err) {
    // Graceful fallback to local JavaScript keyword classifier
    const fallback = classifyLocally(subject, description);
    return res.json({ ...fallback, source: 'fallback_local' });
  }
});

module.exports = router;
