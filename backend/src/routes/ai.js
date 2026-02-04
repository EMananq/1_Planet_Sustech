const express = require('express');
const { db, firebaseInitialized } = require('../config/firebase');
const authMiddleware = require('../middleware/authMiddleware');
const { generateRecommendations, chat } = require('../services/aiService');
const { calculateTotalEmissions } = require('../services/carbonCalculator');

const router = express.Router();

// Middleware to check if Firebase is initialized
const checkFirebase = (req, res, next) => {
  if (!firebaseInitialized || !db) {
    return res.status(503).json({ 
      error: 'Database not configured. Please setup Firebase credentials.',
      setup: 'Add your serviceAccountKey.json to backend/src/config/'
    });
  }
  next();
};

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(checkFirebase);

/**
 * GET /api/ai/recommendations
 * Get AI-powered personalized recommendations
 */
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's recent activities (last 30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Simple query - filter in JS to avoid index requirements
    const snapshot = await db.collection('activities')
      .where('userId', '==', userId)
      .get();
    
    const activities = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateValue = data.date?.toDate?.() || new Date(data.date);
      if (dateValue >= startDate) {
        activities.push(data);
      }
    });
    
    // Calculate emission summary
    const emissionData = calculateTotalEmissions(activities);
    emissionData.activityCount = activities.length;
    emissionData.period = 'Last 30 days';
    
    // Generate recommendations
    const recommendations = await generateRecommendations(emissionData);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * POST /api/ai/chat
 * Chat with AI assistant about carbon footprint
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get user's emission context
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Simple query - filter in JS to avoid index requirements
    const snapshot = await db.collection('activities')
      .where('userId', '==', userId)
      .get();
    
    const activities = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateValue = data.date?.toDate?.() || new Date(data.date);
      if (dateValue >= startDate) {
        activities.push(data);
      }
    });
    
    const context = calculateTotalEmissions(activities);
    
    // Get AI response
    const response = await chat(message, context);
    
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

/**
 * POST /api/ai/ask
 * Ask a specific question about user's data
 */
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user.userId;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Get user's full emission data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Simple query - filter in JS to avoid index requirements
    const snapshot = await db.collection('activities')
      .where('userId', '==', userId)
      .get();
    
    const activities = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateValue = data.date?.toDate?.() || new Date(data.date);
      if (dateValue >= startDate) {
        activities.push(data);
      }
    });
    
    const emissionData = calculateTotalEmissions(activities);
    emissionData.activityCount = activities.length;
    
    // Get AI response to specific question
    const response = await generateRecommendations(emissionData, question);
    
    res.json(response);
  } catch (error) {
    console.error('Ask error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

module.exports = router;
