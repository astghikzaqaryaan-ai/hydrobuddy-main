import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import WaterLog from '../models/WaterLog.js';
import Statistics from '../models/Statistics.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to get date string
const getDateString = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};

// Get friends list with their progress
router.get('/', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('friends', '-password');
        const today = getDateString();

        const friendsWithProgress = await Promise.all(
            user.friends.map(async (friend) => {
                const todayStats = await Statistics.findOne({ userId: friend._id, date: today });
                const todayLogs = await WaterLog.find({ userId: friend._id, date: today }).sort({ timestamp: 1 });

                const totalDrank = todayStats?.totalAmount || 0;
                const goalPercentage = todayStats ? Math.round((todayStats.totalAmount / todayStats.goalAmount) * 100) : 0;

                let status = 'bad';
                if (goalPercentage >= 100) status = 'excellent';
                else if (goalPercentage >= 50) status = 'good';

                const firstDrinkTime = todayLogs.length > 0
                    ? new Date(todayLogs[0].timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                    : '--:--';

                const lastDrinkTime = todayLogs.length > 0
                    ? new Date(todayLogs[todayLogs.length - 1].timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                    : '--:--';

                return {
                    id: friend._id,
                    name: friend.name,
                    email: friend.email,
                    avatar: friend.avatar,
                    totalDrank,
                    goalPercentage,
                    firstDrinkTime,
                    lastDrinkTime,
                    status
                };
            })
        );

        res.json({ friends: friendsWithProgress });
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Search users
router.get('/search', authenticate, async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Query too short' });
        }

        const users = await User.find({
            _id: { $ne: req.userId },
            $or: [
                { email: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        })
            .select('name email avatar')
            .limit(10);

        res.json({ users });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send friend request
router.post('/request',
    authenticate,
    body('friendId').notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { friendId } = req.body;

            if (friendId === req.userId.toString()) {
                return res.status(400).json({ error: 'Cannot add yourself' });
            }

            const friend = await User.findById(friendId);
            if (!friend) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Check if already friends
            if (req.user.friends.includes(friendId)) {
                return res.status(400).json({ error: 'Already friends' });
            }

            // Check if request already sent
            const existingRequest = friend.friendRequests.find(
                r => r.from.toString() === req.userId.toString()
            );

            if (existingRequest) {
                return res.status(400).json({ error: 'Request already sent' });
            }

            // Add friend request
            friend.friendRequests.push({ from: req.userId });
            await friend.save();

            res.json({ message: 'Friend request sent' });
        } catch (error) {
            console.error('Send friend request error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Get pending friend requests
router.get('/requests', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('friendRequests.from', 'name email avatar');
        res.json({ requests: user.friendRequests });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Accept friend request
router.post('/accept/:requestId', authenticate, async (req, res) => {
    try {
        const { requestId } = req.params;

        const user = await User.findById(req.userId);
        const requestIndex = user.friendRequests.findIndex(
            r => r._id.toString() === requestId
        );

        if (requestIndex === -1) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const friendId = user.friendRequests[requestIndex].from;

        // Add to both friends lists
        user.friends.push(friendId);
        user.friendRequests.splice(requestIndex, 1);
        await user.save();

        const friend = await User.findById(friendId);
        friend.friends.push(req.userId);
        await friend.save();

        res.json({ message: 'Friend request accepted' });
    } catch (error) {
        console.error('Accept friend error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove friend
router.delete('/:friendId', authenticate, async (req, res) => {
    try {
        const { friendId } = req.params;

        const user = await User.findById(req.userId);
        user.friends = user.friends.filter(f => f.toString() !== friendId);
        await user.save();

        const friend = await User.findById(friendId);
        if (friend) {
            friend.friends = friend.friends.filter(f => f.toString() !== req.userId.toString());
            await friend.save();
        }

        res.json({ message: 'Friend removed' });
    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
