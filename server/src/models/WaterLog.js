import mongoose from 'mongoose';

const waterLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
        index: true
    }
});

// Compound index for efficient queries
waterLogSchema.index({ userId: 1, date: 1 });

export default mongoose.model('WaterLog', waterLogSchema);
