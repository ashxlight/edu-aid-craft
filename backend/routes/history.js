import express from 'express';
import { protect } from './auth.js';
import History from '../models/History.js';

const router = express.Router();

// @route   GET /api/history
// @desc    Get user's history and simple stats
router.get('/', protect, async (req, res) => {
  try {
    const historyItems = await History.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50 events

    // Calculate dynamic stats
    const totalCount = historyItems.length;
    const thisWeekCount = historyItems.filter(h => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(h.createdAt) > oneWeekAgo;
    }).length;

    // Formats Used count logic (for students only)
    const formatsSet = new Set();
    historyItems.forEach(h => {
      if (h.metadata?.formats) {
        h.metadata.formats.forEach(f => formatsSet.add(f));
      }
    });

    res.json({
      history: historyItems,
      stats: {
        total: totalCount,
        thisWeek: thisWeekCount,
        formatsCount: formatsSet.size
      }
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ message: 'Error fetching history' });
  }
});

export default router;
