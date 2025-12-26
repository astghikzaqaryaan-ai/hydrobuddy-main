import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Signup
router.post('/signup',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, name } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = new User({
                email,
                password: hashedPassword,
                name
            });

            await user.save();

            // Generate token
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });

            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    dailyGoal: user.dailyGoal,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Login
router.post('/login',
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });

            res.json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    dailyGoal: user.dailyGoal,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Get current user
router.get('/me', authenticate, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                dailyGoal: req.user.dailyGoal,
                avatar: req.user.avatar
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
