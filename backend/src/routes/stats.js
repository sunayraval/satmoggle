const express = require('express');
const router = express.Router();
const eloService = require('../services/eloService');

// POST /api/stats/elo/multiplayer - Calculate rating adjustments for a multiplayer match
router.post('/elo/multiplayer', (req, res) => {
  try {
    const { players, kFactor = 32 } = req.body;
    if (!players || !Array.isArray(players)) {
      return res.status(400).json({ success: false, error: 'Expected body with "players" array.' });
    }
    const results = eloService.calculateMultiplayer(players, kFactor);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/stats/elo/1v1 - Calculate rating adjustments for a 1v1 match
router.post('/elo/1v1', (req, res) => {
  try {
    const { ratingA, ratingB, scoreA, kFactor = 32 } = req.body;
    if (ratingA === undefined || ratingB === undefined || scoreA === undefined) {
      return res.status(400).json({ success: false, error: 'Expected ratingA, ratingB, and scoreA.' });
    }
    const result = eloService.calculate1v1(Number(ratingA), Number(ratingB), Number(scoreA), Number(kFactor));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
