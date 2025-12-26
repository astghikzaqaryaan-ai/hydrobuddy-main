import express from 'express';
import { body, validationResult } from 'express-validator';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get messages with a friend
router.get('/:friendId', authenticate, async (req, res) => {
    try {
        const { friendId } = req.params;
        const { limit = 50 } = req.query;

        // Verify friendship
        const user = await User.findById(req.userId);
        if (!user.friends.includes(friendId)) {
            return res.status(403).json({ error: 'Not friends with this user' });
        }

        const messages = await Message.find({
            $or: [
                { from: req.userId, to: friendId },
                { from: friendId, to: req.userId }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('from', 'name avatar')
            .populate('to', 'name avatar');

        // Mark messages as read
        await Message.updateMany(
            { from: friendId, to: req.userId, read: false },
            { read: true }
        );

        res.json({ messages: messages.reverse() });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send message to friend
router.post('/:friendId',
    authenticate,
    body('content').trim().isLength({ min: 1, max: 1000 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { friendId } = req.params;
            const { content, isReminder = false } = req.body;

            // Verify friendship
            const user = await User.findById(req.userId);
            if (!user.friends.includes(friendId)) {
                return res.status(403).json({ error: 'Not friends with this user' });
            }

            const message = new Message({
                from: req.userId,
                to: friendId,
                content,
                isReminder
            });

            await message.save();
            await message.populate('from', 'name avatar');
            await message.populate('to', 'name avatar');

            res.status(201).json({ message });
        } catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Send hydration reminder to friend
router.post('/reminder/:friendId',
    authenticate,
    body('message').optional().trim().isLength({ max: 1000 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { friendId } = req.params;
            const { message: customMessage } = req.body;

            // Verify friendship
            const user = await User.findById(req.userId);
            if (!user.friends.includes(friendId)) {
                return res.status(403).json({ error: 'Not friends with this user' });
            }

            const content = customMessage || "Hey! Don't forget to drink water today! 💧";

            const message = new Message({
                from: req.userId,
                to: friendId,
                content,
                isReminder: true
            });

            await message.save();
            await message.populate('from', 'name avatar');
            await message.populate('to', 'name avatar');

            res.status(201).json({ message });
        } catch (error) {
            console.error('Send reminder error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Get unread message count
router.get('/unread/count', authenticate, async (req, res) => {
    try {
        const count = await Message.countDocuments({
            to: req.userId,
            read: false
        });

        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
