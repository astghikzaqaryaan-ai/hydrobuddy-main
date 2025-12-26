import express from 'express';
import { body, validationResult } from 'express-validator';
import WaterLog from '../models/WaterLog.js';
import Statistics from '../models/Statistics.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to get date string
const getDateString = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};

// Helper to update statistics
const updateStatistics = async (userId, date, goalAmount) => {
    const logs = await WaterLog.find({ userId, date }).sort({ timestamp: 1 });

    const totalAmount = logs.reduce((sum, log) => sum + log.amount, 0);
    const goalAchieved = totalAmount >= goalAmount;

    const firstDrinkTime = logs.length > 0 ? logs[0].timestamp : null;
    const lastDrinkTime = logs.length > 0 ? logs[logs.length - 1].timestamp : null;

    // Calculate streak
    let currentStreak = 0;
    let bestStreak = 0;

    const allStats = await Statistics.find({ userId }).sort({ date: -1 });

    if (goalAchieved) {
        currentStreak = 1;
        const yesterday = new Date(date);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getDateString(yesterday);

        const yesterdayStats = allStats.find(s => s.date === yesterdayStr);
        if (yesterdayStats && yesterdayStats.goalAchieved) {
            currentStreak = yesterdayStats.currentStreak + 1;
        }
    }

    bestStreak = Math.max(...allStats.map(s => s.currentStreak || 0), currentStreak);

    await Statistics.findOneAndUpdate(
        { userId, date },
        {
            totalAmount,
            goalAmount,
            goalAchieved,
            logsCount: logs.length,
            firstDrinkTime,
            lastDrinkTime,
            currentStreak,
            bestStreak
        },
        { upsert: true, new: true }
    );
};

// Log water intake
router.post('/log',
    authenticate,
    body('amount').isInt({ min: 1, max: 5000 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { amount } = req.body;
            const date = getDateString();

            const waterLog = new WaterLog({
                userId: req.userId,
                amount,
                date
            });

            await waterLog.save();
            await updateStatistics(req.userId, date, req.user.dailyGoal);

            res.status(201).json({ waterLog });
        } catch (error) {
            console.error('Log water error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Get today's intake
router.get('/today', authenticate, async (req, res) => {
    try {
        const date = getDateString();
        const logs = await WaterLog.find({ userId: req.userId, date });
        const totalAmount = logs.reduce((sum, log) => sum + log.amount, 0);

        res.json({
            logs,
            totalAmount,
            goalAmount: req.user.dailyGoal,
            percentage: Math.min((totalAmount / req.user.dailyGoal) * 100, 100)
        });
    } catch (error) {
        console.error('Get today error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get history
router.get('/history', authenticate, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const logs = await WaterLog.find({
            userId: req.userId,
            timestamp: { $gte: startDate }
        }).sort({ timestamp: -1 });

        res.json({ logs });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update daily goal
router.put('/goal',
    authenticate,
    body('goalAmount').isInt({ min: 500, max: 10000 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { goalAmount } = req.body;
            req.user.dailyGoal = goalAmount;
            await req.user.save();

            // Update today's statistics
            const date = getDateString();
            await updateStatistics(req.userId, date, goalAmount);

            res.json({ dailyGoal: goalAmount });
        } catch (error) {
            console.error('Update goal error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

export default router;
