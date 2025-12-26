import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from './routes/auth.js';
import waterRoutes from './routes/water.js';
import friendsRoutes from './routes/friends.js';
import messagesRoutes from './routes/messages.js';
import statisticsRoutes from './routes/statistics.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/statistics', statisticsRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// MongoDB connection with in-memory server for development
async function startServer() {
    try {
        let mongoUri = process.env.MONGODB_URI;

        // Use in-memory MongoDB for development
        if (!mongoUri || mongoUri.includes('localhost')) {
            console.log('🔧 Starting in-memory MongoDB server...');
            const mongod = await MongoMemoryServer.create();
            mongoUri = mongod.getUri();
            console.log('✅ In-memory MongoDB started');
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
            console.log(`\n📝 Available endpoints:`);
            console.log(`   POST /api/auth/signup - Create account`);
            console.log(`   POST /api/auth/login - Login`);
            console.log(`   GET  /api/auth/me - Get current user`);
            console.log(`   POST /api/water/log - Log water intake`);
            console.log(`   GET  /api/water/today - Get today's intake`);
            console.log(`   GET  /api/friends - Get friends list`);
            console.log(`   GET  /api/statistics/daily - Get daily stats`);
            console.log(`   GET  /api/statistics/weekly - Get weekly stats`);
        });
    } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

startServer();
