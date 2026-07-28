const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const questionService = require('./services/questionService');
const questionsRouter = require('./routes/questions');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/questions', questionsRouter);
app.use('/api/stats', statsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const stats = questionService.isLoaded ? questionService.getStats() : { status: 'loading' };
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    questionBank: stats
  });
});

// Serve frontend static build in production (Render Web Service)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Fallback for React SPA routing (any non-API request returns index.html)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Frontend bundle not built yet. Run npm run build in frontend/ or run npm run dev for local development.');
    }
  });
});

// Start Server and Pre-index Questions
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 SATmoggle Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
  
  // Asynchronously load and index questions.json in background so API is immediately responsive
  setTimeout(() => {
    try {
      questionService.loadQuestions();
    } catch (err) {
      console.error('Critical Error loading questions during startup:', err.message);
    }
  }, 100);
});

module.exports = app;
