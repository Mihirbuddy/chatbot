import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    senderType: {
        type: String,
        enum: ['user', 'ai'],
        default: 'user'
    }
}, {
    timestamps: true // This gives you createdAt and updatedAt
});

const Message = mongoose.model('message', messageSchema);

export default Message;
