import mongoose from 'mongoose';

const statisticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
        index: true
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    goalAmount: {
        type: Number,
        required: true
    },
    goalAchieved: {
        type: Boolean,
        default: false
    },
    logsCount: {
        type: Number,
        default: 0
    },
    firstDrinkTime: {
        type: Date
    },
    lastDrinkTime: {
        type: Date
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    bestStreak: {
        type: Number,
        default: 0
    }
});

// Compound index for efficient queries
statisticsSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('Statistics', statisticsSchema);
