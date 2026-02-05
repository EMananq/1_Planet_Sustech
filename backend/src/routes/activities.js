const express = require('express');
const { db, firebaseInitialized } = require('../config/firebase');
const authMiddleware = require('../middleware/authMiddleware');
const { calculateEmission, calculateTotalEmissions, getAllActivityTypes } = require('../services/carbonCalculator');

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
 * GET /api/activities/types
 * Get all available activity types and their emission factors
 */
router.get('/types', (req, res) => {
  try {
    const types = getAllActivityTypes();
    res.json(types);
  } catch (error) {
    console.error('Get activity types error:', error);
    res.status(500).json({ error: 'Failed to get activity types' });
  }
});

/**
 * POST /api/activities
 * Create a new activity entry
 */
router.post('/', async (req, res) => {
  try {
    const { category, activityType, value, unit, date, notes } = req.body;
    const userId = req.user.userId;
    
    // Validation
    if (!category || !activityType || value === undefined || !unit) {
      return res.status(400).json({ error: 'Category, activityType, value, and unit are required' });
    }
    
    // Calculate emission
    const emission = calculateEmission(category, activityType, value, unit);
    
    // Create activity document
    const activityData = {
      userId,
      category,
      activityType,
      value: parseFloat(value),
      unit,
      co2Emission: emission.co2Emission,
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      createdAt: new Date()
    };
    
    const activityDoc = await db.collection('activities').add(activityData);
    
    // Update user's total emissions
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const currentTotal = userDoc.data().totalEmissions || 0;
      await userRef.update({
        totalEmissions: currentTotal + emission.co2Emission,
        lastActivity: new Date()
      });
    }
    
    res.status(201).json({
      message: 'Activity logged successfully',
      activity: {
        id: activityDoc.id,
        ...activityData,
        date: activityData.date.toISOString()
      }
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: error.message || 'Failed to create activity' });
  }
});

/**
 * GET /api/activities
 * Get user's activities with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, category, limit = 50 } = req.query;
    
    // Simple query - just filter by userId
    const snapshot = await db.collection('activities')
      .where('userId', '==', userId)
      .get();
    
    let activities = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateValue = data.date?.toDate?.() || new Date(data.date);
      activities.push({
        id: doc.id,
        ...data,
        date: dateValue.toISOString(),
        dateObj: dateValue,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
      });
    });
    
    // Apply filters in JavaScript
    if (startDate) {
      const start = new Date(startDate);
      activities = activities.filter(a => a.dateObj >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      activities = activities.filter(a => a.dateObj <= end);
    }
    if (category) {
      activities = activities.filter(a => a.category === category);
    }
    
    // Sort by date descending and limit
    activities.sort((a, b) => b.dateObj - a.dateObj);
    const filteredActivities = activities.slice(0, parseInt(limit));
    
    // Remove dateObj before sending
    filteredActivities.forEach(a => delete a.dateObj);
    
    res.json(filteredActivities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

/**
 * GET /api/activities/summary
 * Get emission summary for different time periods
 */
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = 'month', previous = 'false' } = req.query;
    const isPrevious = previous === 'true';
    
    // Calculate date ranges
    const now = new Date();
    let startDate, endDate;
    
    // Calculate period length in milliseconds
    let periodLength;
    switch (period) {
      case 'day':
        periodLength = 24 * 60 * 60 * 1000;
        break;
      case 'week':
        periodLength = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        periodLength = 30 * 24 * 60 * 60 * 1000;
        break;
      case 'year':
        periodLength = 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        periodLength = 30 * 24 * 60 * 60 * 1000;
    }
    
    if (isPrevious) {
      // Previous period: from (now - 2*periodLength) to (now - periodLength)
      endDate = new Date(now.getTime() - periodLength);
      startDate = new Date(now.getTime() - 2 * periodLength);
    } else {
      // Current period: from (now - periodLength) to now
      endDate = now;
      startDate = new Date(now.getTime() - periodLength);
    }
    
    // Simple query - filter in JS to avoid index requirements
    const snapshot = await db.collection('activities')
      .where('userId', '==', userId)
      .get();
    
    // Filter by date in JavaScript
    const activities = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateValue = data.date?.toDate?.() || new Date(data.date);
      if (dateValue >= startDate && dateValue <= endDate) {
        activities.push(data);
      }
    });
    
    const summary = calculateTotalEmissions(activities);
    
    res.json({
      period,
      isPrevious,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      activityCount: activities.length,
      ...summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

/**
 * GET /api/activities/trends
 * Get daily emission trends for charts
 */
router.get('/trends', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Simple query - filter in JS to avoid index requirements
    const snapshot = await db.collection('activities')
      .where('userId', '==', userId)
      .get();
    
    // Group by date
    const dailyTotals = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateValue = data.date?.toDate?.() || new Date(data.date);
      
      // Filter by date in JS
      if (dateValue < startDate) return;
      
      const dateStr = dateValue.toISOString().split('T')[0];
      
      if (!dailyTotals[dateStr]) {
        dailyTotals[dateStr] = {
          date: dateStr,
          total: 0,
          transport: 0,
          energy: 0,
          food: 0,
          waste: 0,
          consumption: 0
        };
      }
      
      dailyTotals[dateStr].total += data.co2Emission || 0;
      if (data.category) {
        dailyTotals[dateStr][data.category] = (dailyTotals[dateStr][data.category] || 0) + (data.co2Emission || 0);
      }
    });
    
    // Convert to array and round values
    const trends = Object.values(dailyTotals).map(day => ({
      ...day,
      total: Math.round(day.total * 100) / 100,
      transport: Math.round(day.transport * 100) / 100,
      energy: Math.round(day.energy * 100) / 100,
      food: Math.round(day.food * 100) / 100,
      waste: Math.round(day.waste * 100) / 100,
      consumption: Math.round(day.consumption * 100) / 100
    }));
    
    res.json(trends);
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: 'Failed to get trends' });
  }
});

/**
 * PUT /api/activities/:id
 * Update an activity
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, activityType, value, unit, date, notes } = req.body;
    const userId = req.user.userId;
    
    // Get existing activity
    const activityRef = db.collection('activities').doc(id);
    const activityDoc = await activityRef.get();
    
    if (!activityDoc.exists) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    if (activityDoc.data().userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this activity' });
    }
    
    // Calculate new emission if category/type/value changed
    let co2Emission = activityDoc.data().co2Emission;
    if (category && activityType && value !== undefined) {
      const emission = calculateEmission(category, activityType, value, unit);
      co2Emission = emission.co2Emission;
    }
    
    const updateData = {
      ...(category && { category }),
      ...(activityType && { activityType }),
      ...(value !== undefined && { value: parseFloat(value) }),
      ...(unit && { unit }),
      ...(date && { date: new Date(date) }),
      ...(notes !== undefined && { notes }),
      co2Emission,
      updatedAt: new Date()
    };
    
    await activityRef.update(updateData);
    
    res.json({ message: 'Activity updated successfully' });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

/**
 * DELETE /api/activities/:id
 * Delete an activity
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const activityRef = db.collection('activities').doc(id);
    const activityDoc = await activityRef.get();
    
    if (!activityDoc.exists) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    if (activityDoc.data().userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this activity' });
    }
    
    // Update user's total emissions
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const currentTotal = userDoc.data().totalEmissions || 0;
      const activityEmission = activityDoc.data().co2Emission || 0;
      await userRef.update({
        totalEmissions: Math.max(0, currentTotal - activityEmission)
      });
    }
    
    await activityRef.delete();
    
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;
