const express = require('express');
const router = express.Router();
const questionService = require('../services/questionService');

// GET /api/questions/stats/summary
router.get('/stats/summary', (req, res) => {
  try {
    const stats = questionService.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/questions/random?subject=both&difficulty=MIXED&count=10
router.get('/random', (req, res) => {
  try {
    const { subject = 'both', difficulty = 'MIXED', count = '10' } = req.query;
    const numCount = Math.min(Math.max(parseInt(count, 10) || 10, 1), 50); // limit 1 to 50
    const questions = questionService.getRandomQuestions({
      subject,
      difficulty,
      count: numCount
    });
    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/questions/batch - Retrieve questions by IDs
router.post('/batch', (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, error: 'Expected body with "ids" array.' });
    }
    const questions = questionService.getBatchByIds(ids);
    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/questions/:id - Retrieve a specific question
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const question = questionService.getQuestionById(id);
    if (!question) {
      return res.status(404).json({ success: false, error: `Question with ID ${id} not found.` });
    }
    res.json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
