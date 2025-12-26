import express from 'express';
import Statistics from '../models/Statistics.js';
import WaterLog from '../models/WaterLog.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to get date string
const getDateString = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};

// Get daily statistics
router.get('/daily', authenticate, async (req, res) => {
    try {
        const { date } = req.query;
        const dateStr = date || getDateString();

        const stats = await Statistics.findOne({ userId: req.userId, date: dateStr });

        if (!stats) {
            return res.json({
                date: dateStr,
                totalAmount: 0,
                goalAmount: req.user.dailyGoal,
                goalAchieved: false,
                logsCount: 0,
                currentStreak: 0,
                bestStreak: 0
            });
        }

        res.json(stats);
    } catch (error) {
        console.error('Get daily stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get weekly statistics
router.get('/weekly', authenticate, async (req, res) => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);

        const stats = await Statistics.find({
            userId: req.userId,
            date: {
                $gte: getDateString(startDate),
                $lte: getDateString(endDate)
            }
        }).sort({ date: 1 });

        // Fill in missing days
        const weekData = [];
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
            const dateStr = getDateString(currentDate);

            const dayStat = stats.find(s => s.date === dateStr);
            weekData.push({
                date: dateStr,
                dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                totalAmount: dayStat?.totalAmount || 0,
                goalAmount: dayStat?.goalAmount || req.user.dailyGoal,
                goalAchieved: dayStat?.goalAchieved || false
            });
        }

        const totalAmount = weekData.reduce((sum, day) => sum + day.totalAmount, 0);
        const daysAchieved = weekData.filter(day => day.goalAchieved).length;
        const averageAmount = Math.round(totalAmount / 7);

        res.json({
            weekData,
            summary: {
                totalAmount,
                averageAmount,
                daysAchieved,
                goalPercentage: Math.round((daysAchieved / 7) * 100)
            }
        });
    } catch (error) {
        console.error('Get weekly stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get monthly statistics
router.get('/monthly', authenticate, async (req, res) => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(1); // First day of month

        const stats = await Statistics.find({
            userId: req.userId,
            date: {
                $gte: getDateString(startDate),
                $lte: getDateString(endDate)
            }
        }).sort({ date: 1 });

        const totalAmount = stats.reduce((sum, s) => sum + s.totalAmount, 0);
        const daysAchieved = stats.filter(s => s.goalAchieved).length;
        const daysTracked = stats.length;
        const averageAmount = daysTracked > 0 ? Math.round(totalAmount / daysTracked) : 0;

        res.json({
            monthData: stats,
            summary: {
                totalAmount,
                averageAmount,
                daysTracked,
                daysAchieved,
                goalPercentage: daysTracked > 0 ? Math.round((daysAchieved / daysTracked) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Get monthly stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get streak information
router.get('/streak', authenticate, async (req, res) => {
    try {
        const today = getDateString();
        const todayStats = await Statistics.findOne({ userId: req.userId, date: today });

        const allStats = await Statistics.find({ userId: req.userId }).sort({ date: -1 });

        const currentStreak = todayStats?.currentStreak || 0;
        const bestStreak = Math.max(...allStats.map(s => s.currentStreak || 0), 0);

        // Get streak history (last 30 days)
        const streakHistory = allStats.slice(0, 30).reverse().map(s => ({
            date: s.date,
            achieved: s.goalAchieved,
            amount: s.totalAmount
        }));

        res.json({
            currentStreak,
            bestStreak,
            streakHistory
        });
    } catch (error) {
        console.error('Get streak error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get hourly distribution for today
router.get('/hourly', authenticate, async (req, res) => {
    try {
        const today = getDateString();
        const logs = await WaterLog.find({ userId: req.userId, date: today });

        const hourlyData = Array(24).fill(0);

        logs.forEach(log => {
            const hour = new Date(log.timestamp).getHours();
            hourlyData[hour] += log.amount;
        });

        res.json({ hourlyData });
    } catch (error) {
        console.error('Get hourly stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
