import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    isReminder: {
        type: Boolean,
        default: false
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for efficient conversation queries
messageSchema.index({ from: 1, to: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
